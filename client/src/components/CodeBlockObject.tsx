import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import Konva from 'konva';
import type { CodeBlockObj, CodeBlockControl, D3VisualizationObj, ToolType, BoardAPI } from '../types';
import * as d3 from 'd3';
import { PrecomputeRenderEngine } from '../utils/PrecomputeRenderEngine';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { createExecutionGuard, wrapCodeWithTimeoutGuards, TimeoutError } from '../utils/sandboxTimeout';

interface CodeBlockObjectProps {
  obj: CodeBlockObj;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
  draggable?: boolean;
  onUpdate: (updates: Partial<CodeBlockObj>) => void;
  onCreateVisualization: (viz: D3VisualizationObj, codeBlockUpdates: Partial<CodeBlockObj>) => void;
  tool?: ToolType;
  boardAPI?: BoardAPI;
}

export const CodeBlockObject: React.FC<CodeBlockObjectProps> = ({
  obj,
  onSelect,
  isSelected = false,
  draggable = true,
  onUpdate,
  onCreateVisualization,
  tool = 'select',
  boardAPI
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const isSelectMode = tool === 'select';
  const editorViewRef = useRef<EditorView | null>(null);

  const activeRafsRef = useRef<Set<number>>(new Set());
  const renderCallbackRef = useRef<((values: Record<string, any>) => void) | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const precomputeRenderEngineRef = useRef<any>(null);
  const executionTimeoutRef = useRef<number | null>(null);

  // Execution state machine and queue for Fix 2
  type ExecutionState = 'idle' | 'precomputing' | 'rendering';
  const executionStateRef = useRef<ExecutionState>('idle');
  const executionQueueRef = useRef<Array<{
    controlValues?: Record<string, number>;
    includeControlsUpdate?: boolean;
  }>>([]);

  // Watch for external execution triggers from visualization controls
  useEffect(() => {
    if (obj.executionTrigger && obj.executionTrigger > (obj.lastExecuted || 0)) {
      // Pass executionContext control values to prevent code block controls from being modified
      const controlValuesOverride = obj.executionContext?.controlValues;
      executeCode(controlValuesOverride);
    }
  }, [obj.executionTrigger]);

  // Clean up RAFs when component unmounts
  useEffect(() => {
    return () => {
      activeRafsRef.current.forEach(id => window.cancelAnimationFrame(id));
      activeRafsRef.current.clear();
      // Clear precompute/render engine
      if (precomputeRenderEngineRef.current) {
        precomputeRenderEngineRef.current.clear();
        precomputeRenderEngineRef.current = null;
      }
      // Clear execution timeout
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
    };
  }, []);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (isEditing && editorRef.current && !editorViewRef.current) {
      const state = EditorState.create({
        doc: obj.code,
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                executeCode();
                return true;
              }
            },
            {
              key: 'Escape',
              run: () => {
                handleBlur();
                return true;
              }
            }
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newCode = update.state.doc.toString();
              onUpdate({ code: newCode });
            }
          })
        ]
      });

      const view = new EditorView({
        state,
        parent: editorRef.current
      });

      editorViewRef.current = view;

      // Focus the editor
      view.focus();
    }

    // Cleanup
    return () => {
      if (editorViewRef.current && !isEditing) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    };
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }
  };

  // Queue processing for execution state machine
  const processNextExecution = async () => {
    if (executionQueueRef.current.length === 0) {
      executionStateRef.current = 'idle';
      return;
    }

    const next = executionQueueRef.current.shift()!;
    await executeCodeInternal(next.controlValues, next.includeControlsUpdate);
    await processNextExecution(); // BUG FIX: Must await recursive call
  };

  const executeCode = async (controlValuesOverride?: Record<string, any>, includeControlsUpdate = false) => {
    const animationTime = obj.executionContext?.animationTime;

    // FAST PATH: Animation frame
    if (animationTime !== undefined && precomputeRenderEngineRef.current) {
      if (executionStateRef.current === 'precomputing') {
        console.warn('[CodeBlock] Precompute in progress, skipping animation frame');
        return;
      }

      const engine = precomputeRenderEngineRef.current;
      if (engine.isReady) {
        const frameIndex = Math.floor(animationTime * (engine.fps || 30));
        const success = engine.executeRender(frameIndex);

        if (success && outputRef.current) {
          const outputContent = outputRef.current.innerHTML;
          const vizId = obj.executionContext?.vizId || obj.outputId;
          if (vizId) {
            onUpdate({
              lastExecuted: Date.now(),
              executionContext: undefined,
              __visualizationUpdate: { id: vizId, content: outputContent }
            } as any);
          }
        }
        return;
      }
    }

    // SLOW PATH: Queue execution
    executionQueueRef.current.push({ controlValues: controlValuesOverride, includeControlsUpdate });

    if (executionStateRef.current === 'idle') {
      await processNextExecution(); // BUG FIX: Must await to ensure execution completes
    }
  };

  const executeCodeInternal = async (controlValuesOverride?: Record<string, any>, includeControlsUpdate = false) => {
    console.log('[CodeBlock] Starting execution...', obj.id);
    setIsExecuting(true);

    // Cancel any running animation frames from previous execution
    if (activeRafsRef.current.size > 0) {
      activeRafsRef.current.forEach(id => window.cancelAnimationFrame(id));
      activeRafsRef.current.clear();
    }

    // SLOW PATH: Full Execution (Setup)
    // Determine execution state based on whether we'll use precompute
    const willUsePrecompute = precomputeRenderEngineRef.current !== null;
    executionStateRef.current = willUsePrecompute ? 'precomputing' : 'rendering';

    try {
      // Reset render callback for new run
      renderCallbackRef.current = null;

      // Reset precompute/render engine for full re-execution
      if (precomputeRenderEngineRef.current) {
        precomputeRenderEngineRef.current.clear();
        precomputeRenderEngineRef.current = null;
      }

      // 1. Create output container
      const outputDiv = document.createElement('div');
      outputDiv.id = 'output';
      outputRef.current = outputDiv; // Persist for fast path

      // 2. Setup sandbox with control values
      // When animating, the override only contains the *animated* controls.
      // Merge it on top of the current control values so that controls the
      // user tweaked manually (but that are not part of the animation) keep
      // their value instead of silently resetting to their initial default.
      const currentControlValues = obj.controls?.reduce((acc, c) => {
        acc[c.label] = c.value;
        return acc;
      }, {} as Record<string, any>) || {};

      const sourceControlValues = controlValuesOverride
        ? { ...currentControlValues, ...controlValuesOverride }
        : (obj.executionContext ? obj.executionContext.controlValues : undefined) ||
          currentControlValues;

      const controlValues = new Map(
        Object.entries(sourceControlValues)
      );

      const controls: CodeBlockControl[] = [];

      // Helper to process animation spec (shared by sync execution and async save)
      const processAnimation = (animationSpec: any) => {
        if (animationSpec && animationSpec.keyframes && animationSpec.keyframes.length > 0) {
          console.log('[CodeBlock] Processing programmatic animation:', {
            keyframes: animationSpec.keyframes.length,
            duration: animationSpec.options?.duration
          });

          // Convert keyframe specs to proper Keyframe objects
          const keyframes = animationSpec.keyframes.map((spec: any) => ({
            id: `kf-${Date.now()}-${Math.random()}`,
            time: spec.time,
            controlValues: spec.values,
            label: spec.label
          }));

          // Calculate max time for duration
          const maxTime = Math.max(...keyframes.map((kf: any) => kf.time), 0);

          // Create new animation (Always generate new ID to force update)
          const newAnimation = {
            id: `anim-${Date.now()}-${Math.random()}`,
            codeBlockId: obj.id,
            keyframes: keyframes,
            duration: animationSpec.options?.duration || maxTime + 1,
            fps: animationSpec.options?.fps || 30,
            loop: animationSpec.options?.loop || false
          };

          return newAnimation;
        }
        return null;
      };

      const sandbox = {
        output: outputDiv,
        d3: d3,

        slider: (label: string, min: number, max: number, initial: number, step = 1) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'slider',
            label,
            value,
            min,
            max,
            step
          });
          return value;
        },

        input: (label: string, initial: string) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'text',
            label,
            value
          });
          return value;
        },

        checkbox: (label: string, initial: boolean) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'checkbox',
            label,
            value
          });
          return value;
        },

        radio: (label: string, options: string[], initial: string) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'radio',
            label,
            value,
            options
          });
          return value;
        },

        color: (label: string, initial: string) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'color',
            label,
            value
          });
          return value;
        },

        select: (label: string, options: string[], initial: string) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'select',
            label,
            value,
            options
          });
          return value;
        },

        range: (label: string, min: number, max: number, initialMin: number, initialMax: number, step = 1) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : { min: initialMin, max: initialMax };
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'range',
            label,
            value,
            min,
            max,
            step
          });
          return value;
        },

        button: (label: string) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : { clickCount: 0, lastClicked: null };
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'button',
            label,
            value
          });
          return value;
        },

        toggle: (label: string, initial: boolean) => {
          const existing = controlValues.get(label);
          const value = existing !== undefined ? existing : initial;
          controls.push({
            id: `${label}-${Date.now()}-${Math.random()}`,
            type: 'toggle',
            label,
            value
          });
          return value;
        },

        // Programmatic animation creation
        animate: (keyframeSpecs: Array<{ time: number, values: Record<string, any> }>, options?: { duration?: number, fps?: number, loop?: boolean }) => {
          // Store animation spec to be processed after execution
          (sandbox as any).__animationSpec = {
            keyframes: keyframeSpecs,
            options: options || {}
          };
        },

        log: (msg: any) => console.log('[CodeBlock]', msg),

        // Board API for reading/writing whiteboard elements
        board: (() => {
          console.log('[CodeBlock] Setting up board API, boardAPI exists:', !!boardAPI);
          return boardAPI || {
            getImages: () => [],
            getTexts: () => [],
            getShapes: () => [],
            getLatex: () => [],
            getStrokes: () => [],
            getVisualizations: () => [],
            getAll: () => ({ images: [], texts: [], shapes: [], latex: [], strokes: [], visualizations: [] }),
            addImage: () => '',
            addText: () => '',
            addShape: () => '',
            addLatex: () => '',
            updateElement: () => { },
            deleteElement: () => { },
            getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
            getCodeBlockPosition: () => ({ x: 0, y: 0, width: 500, height: 400 })
          };
        })(),

        // Better Programmatic Animation Builder
        createAnimation: () => {
          const frames: Array<{ time: number, values: Record<string, any>, label?: string }> = [];
          return {
            addKeyframe: (time: number, values: Record<string, any>, label?: string) => {
              frames.push({ time, values, label });
            },
            save: (options?: { duration?: number, fps?: number, loop?: boolean }) => {
              (sandbox as any).__animationSpec = {
                keyframes: frames,
                options: options || {}
              };
            }
          };
        },

        // Compute/Render Separation API for High-Performance Animations
        precompute: (fn: (registerFrame: (index: number, data: any) => void) => void) => {
          if (!precomputeRenderEngineRef.current) {
            precomputeRenderEngineRef.current = new PrecomputeRenderEngine({
              totalFrames: 100,
              fps: 60
            });
          }
          precomputeRenderEngineRef.current.precompute(fn);
        },

        render: (fn: any) => {
          // If precompute() was already called, register as the engine's render.
          // Otherwise fall back to the simple per-frame render-callback path.
          if (precomputeRenderEngineRef.current) {
            precomputeRenderEngineRef.current.render(fn);
          } else {
            renderCallbackRef.current = fn;
          }
        },

        // Safe requestAnimationFrame that gets cleaned up on re-run
        requestAnimationFrame: (callback: FrameRequestCallback) => {
          const id = window.requestAnimationFrame((time) => {
            // Remove from set when executed
            activeRafsRef.current.delete(id);
            callback(time);
          });
          activeRafsRef.current.add(id);
          return id;
        },
        cancelAnimationFrame: (id: number) => {
          window.cancelAnimationFrame(id);
          activeRafsRef.current.delete(id);
        }
      };

      // 3. Execute user code with timeout protection
      console.log('[CodeBlock] Executing user code...');
      const timeoutMs = 5000;
      const guard = createExecutionGuard(timeoutMs);
      const wrappedCode = wrapCodeWithTimeoutGuards(obj.code, '__execGuard');

      // Set fallback timeout
      executionTimeoutRef.current = window.setTimeout(() => {
        console.warn('[CodeBlock] Fallback timeout triggered');
      }, timeoutMs);

      // Add guard to sandbox
      (sandbox as any).__execGuard = guard;

      // Wrap execution in Promise.race for timeout protection
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          try {
            const userFunction = new Function(
              'output', 'd3', 'slider', 'input', 'checkbox',
              'radio', 'color', 'select', 'range', 'button', 'toggle', 'animate', 'createAnimation', 'requestAnimationFrame', 'cancelAnimationFrame', 'render', 'log', 'board', 'precompute', '__execGuard',
              wrappedCode
            );

            userFunction(
              sandbox.output,
              sandbox.d3,
              sandbox.slider,
              sandbox.input,
              sandbox.checkbox,
              sandbox.radio,
              sandbox.color,
              sandbox.select,
              sandbox.range,
              sandbox.button,
              sandbox.toggle,
              sandbox.animate,
              sandbox.createAnimation,
              sandbox.requestAnimationFrame,
              sandbox.cancelAnimationFrame,
              sandbox.render,
              sandbox.log,
              sandbox.board,
              sandbox.precompute,
              (sandbox as any).__execGuard
            );
            resolve();
          } catch (err: any) {
            if (err.message === 'TIMEOUT') {
              reject(new TimeoutError(timeoutMs));
            } else {
              reject(err);
            }
          }
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs + 100)
        )
      ]);

      // Clear timeout after successful execution
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
        executionTimeoutRef.current = null;
      }

      // 4. Execute precompute/render if using the new API
      if (precomputeRenderEngineRef.current) {
        console.log('[CodeBlock] Executing precompute phase...');
        const capturedControlValues: Record<string, any> = {};
        controls.forEach(c => {
          capturedControlValues[c.label] = c.value;
        });
        
        console.log('[CodeBlock] Controls captured:', capturedControlValues);
        
        const success = precomputeRenderEngineRef.current.executePrecompute(capturedControlValues);
        console.log('[CodeBlock] Precompute success:', success);
        console.log('[CodeBlock] Frame cache size:', precomputeRenderEngineRef.current.getFrameCache().size);
        
        if (success) {
          console.log('[CodeBlock] Executing initial render...');
          const renderSuccess = precomputeRenderEngineRef.current.executeRender(0);
          console.log('[CodeBlock] Initial render success:', renderSuccess);
        }
      }

      // 5. Extract output content
      const outputContent = outputDiv.innerHTML;
      console.log('[CodeBlock] Output generated, length:', outputContent.length);

      // 5. Create or update D3Visualization

      // 5. Atomic Update Generation
      const codeBlockUpdates: any = {
        lastExecuted: Date.now(),
        error: undefined
      };

      if (!controlValuesOverride || includeControlsUpdate) {
        codeBlockUpdates.controls = controls;
      }

      // Process animations unless we're in a fast-path (animationTime present)
      // Refresh and control changes should regenerate the animation
      const isAnimationFrame = obj.executionContext?.animationTime !== undefined;
      if (!isAnimationFrame) {
        const animationSpec = (sandbox as any).__animationSpec;
        const newAnimation = processAnimation(animationSpec);

        if (newAnimation) {
          codeBlockUpdates.animationId = newAnimation.id;
          // Pass magic prop for Whiteboard to handle update
          codeBlockUpdates.__programmaticAnimation = newAnimation;
        }
      }

      // If executionContext is set, update specific visualization and don't modify controls
      if (obj.executionContext) {
        console.log('[CodeBlock] Updating specific visualization:', obj.executionContext.vizId);
        // Single atomic update: viz content + codeblock state + clear executionContext
        // Using __visualizationUpdate avoids the React 18 batching race where
        // a separate onUpdateVisualization call gets clobbered by the onUpdate call.
        onUpdate({
          ...codeBlockUpdates,
          executionContext: undefined,
          __visualizationUpdate: {
            id: obj.executionContext.vizId,
            content: outputContent
          }
        } as any);
      } else if (obj.outputId && !obj.appendMode) {
        console.log('[CodeBlock] Updating existing visualization:', obj.outputId);

        // Pass merged updates (controls + animation + status + visualization content)
        // We need a way to pass visualization updates through onUpdate or similar mechanism
        // to avoid race conditions with multiple App.setState calls.

        // Strategy: Use onUpdate with a special field for visualization updates
        // This requires Whiteboard to handle it.

        const combinedUpdates = {
          ...codeBlockUpdates,
          __visualizationUpdate: {
            id: obj.outputId,
            content: outputContent
          }
        };

        if (!controlValuesOverride || includeControlsUpdate) {
          onUpdate(combinedUpdates);
        } else {
          // Animation-driven override: only update visualization content
          onUpdate({
            __visualizationUpdate: {
              id: obj.outputId,
              content: outputContent
            }
          } as any);
        }
      } else {
        console.log('[CodeBlock] Creating new visualization (append mode: ' + obj.appendMode + ')');
        // Create new visualization to the right of CodeBlock
        // In append mode, stack vertically below existing ones
        let vizX = obj.x + obj.width + 20;
        let vizY = obj.y;

        if (obj.appendMode && obj.outputId) {
          // Find position below existing visualizations from this codeblock
          vizY = obj.y + 370; // Height + spacing
        }

        // Capture current control values as a snapshot for this visualization
        const capturedControlValues: Record<string, any> = {};
        controls.forEach(c => {
          capturedControlValues[c.label] = c.value;
        });

        const newVizId = `viz-${Date.now()}`;
        const newViz: D3VisualizationObj = {
          id: newVizId,
          type: 'd3viz',
          x: vizX,
          y: vizY,
          width: 450,
          height: 350,
          content: outputContent,
          sourceCodeBlockId: obj.id,
          controlValues: capturedControlValues
        };

        // Pass both the viz AND the codeblock updates together
        // This ensures a single atomic state update
        onCreateVisualization(newViz, {
          ...codeBlockUpdates,
          outputId: obj.appendMode ? (obj.outputId || newVizId) : newVizId
        });
      }

      console.log('[CodeBlock] Execution completed successfully');
      setIsExecuting(false);
      executionStateRef.current = 'idle';
    } catch (error) {
      console.error('[CodeBlock] Execution error:', error);

      // Clear timeout on error
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
        executionTimeoutRef.current = null;
      }

      // Special handling for timeout errors
      if (error instanceof TimeoutError) {
        onUpdate({
          error: `Timeout: Code execution exceeded ${5000}ms. Check for infinite loops.`,
          lastExecuted: Date.now()
        });
      } else {
        onUpdate({
          error: error instanceof Error ? error.message : String(error),
          lastExecuted: Date.now()
        });
      }
      setIsExecuting(false);
      executionStateRef.current = 'idle';
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(obj.height || 400);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY;
      const newHeight = Math.max(minHeight, resizeStartHeight + deltaY);
      onUpdate({ height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartY, resizeStartHeight]);

  const isFolded = obj.isFolded;
  const foldedHeight = 45; // Just the toolbar
  const minHeight = 200; // Minimum height when unfolded
  const originalHeight = obj.unfoldedHeight || obj.height || 400;
  const displayHeight = isFolded ? foldedHeight : Math.max(originalHeight, minHeight);

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      onClick={isSelectMode ? onSelect : undefined}
      onTap={isSelectMode ? onSelect : undefined}
      draggable={isSelectMode && draggable && !isEditing}
      onDblClick={isSelectMode ? handleDoubleClick : undefined}
      onDblTap={isSelectMode ? handleDoubleClick : undefined}
      listening={isSelectMode}
    >
      <Html
        divProps={{
          style: {
            // Allow events to pass through to canvas when in drawing mode
            pointerEvents: isSelectMode ? 'auto' : 'none',
            userSelect: isEditing ? 'auto' : 'none'
          }
        }}
      >
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}
          style={{
            width: `${obj.width}px`,
            height: `${displayHeight}px`,
            minHeight: `${foldedHeight}px`,
            border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: isEditing ? 'text' : 'default',
            // Allow drawing through when not in select mode
            pointerEvents: isSelectMode ? 'auto' : 'none',
            transition: 'height 0.2s ease',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderBottom: '1px solid #d1d5db',
              pointerEvents: 'auto', // Toolbar can capture events
              flexShrink: 0 // Toolbar doesn't shrink
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeCode();
              }}
              disabled={isExecuting}
              title={isExecuting ? 'Running...' : 'Run code'}
              style={{
                padding: '4px 10px',
                backgroundColor: isExecuting ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Run
            </button>

            {/* Fold toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIsFolded = !obj.isFolded;
                if (newIsFolded) {
                  // Folding: save current height as unfoldedHeight
                  onUpdate({
                    isFolded: true,
                    unfoldedHeight: obj.height || 400
                  });
                } else {
                  // Unfolding: restore original height
                  onUpdate({
                    isFolded: false,
                    height: obj.unfoldedHeight || obj.height || 400
                  });
                }
              }}
              title={obj.isFolded ? 'Expand' : 'Collapse'}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {obj.isFolded ? 'Expand' : 'Collapse'}
            </button>

            {/* Append mode toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ appendMode: !obj.appendMode });
              }}
              title={obj.appendMode ? 'Append mode: stack visualizations' : 'Replace mode: overwrite visualization'}
              style={{
                padding: '4px 8px',
                backgroundColor: obj.appendMode ? '#dbeafe' : '#e5e7eb',
                color: obj.appendMode ? '#1d4ed8' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {obj.appendMode ? 'Append' : 'Replace'}
            </button>

            {/* Recording controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (obj.isRecording) {
                  // Stop recording
                  onUpdate({ isRecording: false, recordingStartTime: undefined });
                } else {
                  // Start recording
                  onUpdate({ isRecording: true, recordingStartTime: Date.now() });
                }
              }}
              title={obj.isRecording ? 'Stop recording' : 'Start recording animation'}
              style={{
                padding: '4px 8px',
                backgroundColor: obj.isRecording ? '#fecaca' : '#e5e7eb',
                color: obj.isRecording ? '#991b1b' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {obj.isRecording ? 'Stop' : 'Record'}
            </button>

            {obj.lastExecuted && !obj.error && (
              <span style={{ fontSize: '14px', color: '#10b981' }} title="Code executed successfully">
                OK
              </span>
            )}

            {obj.error && (
              <span style={{ fontSize: '11px', color: '#ef4444' }} title={obj.error}>
                ERR {obj.error.substring(0, 30)}{obj.error.length > 30 ? '...' : ''}
              </span>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>
              {isEditing ? '[Cmd+Enter] Run [Esc] Exit' : '[Double-click] Edit'}
            </div>
          </div>

          {/* Content Area - hidden when folded */}
          {!obj.isFolded && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden',
              pointerEvents: isEditing ? 'auto' : 'none'
            }}>
              {/* Code Editor Area */}
              <div style={{
                flex: '0 0 auto',
                minHeight: '120px',
                maxHeight: '250px',
                overflow: 'auto',
                position: 'relative'
              }}>
                {isEditing ? (
                  <div
                    ref={editorRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      fontSize: `${obj.fontSize}px`,
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <pre
                    style={{
                      margin: 0,
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: `${obj.fontSize}px`,
                      backgroundColor: '#282c34',
                      color: '#abb2bf',
                      overflow: 'auto',
                      height: '100%',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      pointerEvents: 'none'
                    }}
                  >
                    {obj.code}
                  </pre>
                )}
              </div>

            </div>
          )}

          {/* Resize handle at bottom */}
          {!obj.isFolded && isSelectMode && (
            <div
              onMouseDown={handleResizeStart}
              style={{
                width: '100%',
                height: '8px',
                cursor: 'ns-resize',
                backgroundColor: isResizing ? '#3b82f6' : 'transparent',
                borderTop: '1px solid #d1d5db',
                transition: 'background-color 0.15s',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (!isResizing) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{
                width: '30px',
                height: '3px',
                borderRadius: '2px',
                backgroundColor: '#9ca3af'
              }} />
            </div>
          )}
        </div>
      </Html>

      {/* Transparent rect for selection */}
      <Rect
        width={obj.width}
        height={displayHeight}
        fill="transparent"
        onDblClick={isSelectMode ? handleDoubleClick : undefined}
        onDblTap={isSelectMode ? handleDoubleClick : undefined}
      />
    </Group>
  );
};
