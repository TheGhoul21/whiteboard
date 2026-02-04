import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import Konva from 'konva';
import type { CodeBlockObj, CodeBlockControl, D3VisualizationObj, ToolType } from '../types';
import { ControlWidget } from './ControlWidget';
import * as d3 from 'd3';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';

interface CodeBlockObjectProps {
  obj: CodeBlockObj;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  isSelected?: boolean;
  draggable?: boolean;
  onUpdate: (updates: Partial<CodeBlockObj>) => void;
  onCreateVisualization: (viz: D3VisualizationObj, codeBlockUpdates: Partial<CodeBlockObj>) => void;
  onUpdateVisualization: (updates: { id: string; content: string }) => void;
  tool?: ToolType;
}

export const CodeBlockObject: React.FC<CodeBlockObjectProps> = ({
  obj,
  onSelect,
  isSelected = false,
  draggable = true,
  onUpdate,
  onCreateVisualization,
  onUpdateVisualization,
  tool = 'select'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const isSelectMode = tool === 'select';
  const editorViewRef = useRef<EditorView | null>(null);

  // Watch for external execution triggers from visualization controls
  useEffect(() => {
    if (obj.executionTrigger && obj.executionTrigger > (obj.lastExecuted || 0)) {
      executeCode();
    }
  }, [obj.executionTrigger]);

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

  const executeCode = () => {
    console.log('[CodeBlock] Starting execution...', obj.id);
    setIsExecuting(true);

    // Use setTimeout to avoid blocking and ensure state updates properly
    setTimeout(() => {
      try {
        // 1. Create output container
        const outputDiv = document.createElement('div');
        outputDiv.id = 'output';

        // 2. Setup sandbox with control values
        // If executionContext is set, use those control values instead of obj.controls values
        const sourceControlValues = obj.executionContext
          ? obj.executionContext.controlValues
          : obj.controls?.reduce((acc, c) => {
              acc[c.label] = c.value;
              return acc;
            }, {} as Record<string, any>) || {};

        const controlValues = new Map(
          Object.entries(sourceControlValues)
        );

        const controls: CodeBlockControl[] = [];

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

          log: (msg: any) => console.log('[CodeBlock]', msg)
        };

        // 3. Execute user code
        console.log('[CodeBlock] Executing user code...');
        const userFunction = new Function(
          'output', 'd3', 'slider', 'input', 'checkbox',
          'radio', 'color', 'select', 'range', 'button', 'toggle', 'log',
          obj.code
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
          sandbox.log
        );

        // 4. Extract output content
        const outputContent = outputDiv.innerHTML;
        console.log('[CodeBlock] Output generated, length:', outputContent.length);

        // 5. Create or update D3Visualization

        // If executionContext is set, update specific visualization and don't modify controls
        if (obj.executionContext) {
          console.log('[CodeBlock] Updating specific visualization:', obj.executionContext.vizId);
          onUpdateVisualization({
            id: obj.executionContext.vizId,
            content: outputContent
          });

          // Clear execution context and update state (without modifying controls)
          onUpdate({
            executionContext: undefined,
            error: undefined,
            lastExecuted: Date.now()
          });
        } else if (obj.outputId && !obj.appendMode) {
          console.log('[CodeBlock] Updating existing visualization:', obj.outputId);
          // Update existing visualization
          onUpdateVisualization({
            id: obj.outputId,
            content: outputContent
          });

          // Update controls and state
          onUpdate({
            controls: controls,
            error: undefined,
            lastExecuted: Date.now()
          });
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
            controls: controls,
            error: undefined,
            lastExecuted: Date.now(),
            // In append mode, keep the first outputId as reference, but we track all via a different mechanism
            outputId: obj.appendMode ? (obj.outputId || newVizId) : newVizId
          });
        }

        console.log('[CodeBlock] Execution completed successfully');
        setIsExecuting(false);
      } catch (error) {
        console.error('[CodeBlock] Execution error:', error);
        onUpdate({
          error: error instanceof Error ? error.message : String(error),
          lastExecuted: Date.now()
        });
        setIsExecuting(false);
      }
    }, 10);
  };

  const handleControlChange = (controlId: string, newValue: any) => {
    console.log('[CodeBlock] Control changed:', controlId, newValue);

    // Update controls only - NO auto re-execution
    // User must click "Run" to see changes
    const updatedControls = obj.controls?.map(c =>
      c.id === controlId ? { ...c, value: newValue } : c
    );

    onUpdate({ controls: updatedControls });

    // TODO: Re-enable auto-execution when history system is fixed
    // For now, require manual "Run" click to avoid state corruption
  };

  const handleResizeStart = (e: React.MouseEvent) => {
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
              ▶
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
              {obj.isFolded ? '▶' : '▼'}
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
              {obj.appendMode ? '⊕' : '↻'}
            </button>

            {obj.lastExecuted && !obj.error && (
              <span style={{ fontSize: '14px', color: '#10b981' }} title="Code executed successfully">
                ✓
              </span>
            )}

            {obj.error && (
              <span style={{ fontSize: '11px', color: '#ef4444' }} title={obj.error}>
                ⚠ {obj.error.substring(0, 30)}{obj.error.length > 30 ? '...' : ''}
              </span>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>
              {isEditing ? '⌨ Cmd+Enter to run, Esc to exit' : '✎'}
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

              {/* Controls Area - always visible when controls exist */}
              {obj.controls && obj.controls.length > 0 && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #d1d5db',
                    pointerEvents: 'auto', // Controls can capture events
                    flex: '1 1 auto', // Allow controls to grow and shrink
                    minHeight: '80px',
                    maxHeight: '200px', // Limit max height
                    overflowY: 'auto', // Enable vertical scrolling
                    overflowX: 'hidden' // Prevent horizontal scroll
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                    🎮
                  </div>
                  {obj.controls.map((control) => (
                    <ControlWidget
                      key={control.id}
                      control={control}
                      onChange={(value) => handleControlChange(control.id, value)}
                    />
                  ))}
                </div>
              )}
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
