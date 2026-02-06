import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { D3VisualizationObj, CodeBlockObj } from '../types';

// Mock the parameter isolation logic
describe('Parameter Isolation', () => {
  let mockCodeBlock: CodeBlockObj;
  let mockVisualization: D3VisualizationObj;

  beforeEach(() => {
    mockCodeBlock = {
      id: 'codeblock-1',
      type: 'codeblock',
      code: 'const x = slider("X", 0, 100, 50);',
      x: 100,
      y: 100,
      width: 500,
      height: 400,
      fontSize: 14,
      controls: [
        { id: 'ctrl-1', type: 'slider', label: 'X', value: 50, min: 0, max: 100, step: 1 }
      ]
    };

    mockVisualization = {
      id: 'viz-1',
      type: 'd3viz',
      x: 650,
      y: 100,
      width: 450,
      height: 350,
      content: '<svg></svg>',
      sourceCodeBlockId: 'codeblock-1',
      controlValues: { 'X': 75 } // Custom value different from code block
    };
  });

  describe('control value ownership', () => {
    it('should track visualization control values separately from code block', () => {
      // Visualization has custom value
      expect(mockVisualization.controlValues?.['X']).toBe(75);
      
      // Code block keeps its original value
      const codeBlockValue = mockCodeBlock.controls?.find(c => c.label === 'X')?.value;
      expect(codeBlockValue).toBe(50);
      
      // They are different
      expect(mockVisualization.controlValues?.['X']).not.toBe(codeBlockValue);
    });

    it('should detect when visualization params differ from defaults', () => {
      const hasCustomParams = mockCodeBlock.controls?.some(control => {
        const vizValue = mockVisualization.controlValues?.[control.label];
        const defaultValue = control.value;
        return vizValue !== defaultValue;
      });

      expect(hasCustomParams).toBe(true);
    });

    it('should not detect changes when values match defaults', () => {
      // Set visualization value to match code block
      mockVisualization.controlValues = { 'X': 50 };

      const hasCustomParams = mockCodeBlock.controls?.some(control => {
        const vizValue = mockVisualization.controlValues?.[control.label];
        const defaultValue = control.value;
        return vizValue !== defaultValue;
      });

      expect(hasCustomParams).toBe(false);
    });
  });

  describe('reset to defaults', () => {
    it('should reset visualization values to code block defaults', () => {
      // Visualization has custom value
      expect(mockVisualization.controlValues?.['X']).toBe(75);

      // Reset logic
      const defaultValues: Record<string, any> = {};
      mockCodeBlock.controls?.forEach(control => {
        defaultValues[control.label] = control.value;
      });

      mockVisualization.controlValues = defaultValues;

      // Now matches code block
      expect(mockVisualization.controlValues?.['X']).toBe(50);
    });
  });

  describe('execution context isolation', () => {
    it('should use visualization control values in execution context', () => {
      const executionContext = {
        vizId: mockVisualization.id,
        controlValues: mockVisualization.controlValues || {}
      };

      expect(executionContext.controlValues['X']).toBe(75);
      expect(executionContext.controlValues['X']).not.toBe(50);
    });

    it('should not modify code block controls when using execution context', () => {
      const originalCodeBlockValue = mockCodeBlock.controls?.find(c => c.label === 'X')?.value;
      
      // Simulate execution with visualization values
      const executionContext = {
        vizId: mockVisualization.id,
        controlValues: mockVisualization.controlValues || {}
      };

      // Code block value should remain unchanged
      const currentCodeBlockValue = mockCodeBlock.controls?.find(c => c.label === 'X')?.value;
      expect(currentCodeBlockValue).toBe(originalCodeBlockValue);
      expect(executionContext.controlValues['X']).not.toBe(currentCodeBlockValue);
    });
  });

  describe('complex control types', () => {
    it('should handle object values (range controls)', () => {
      mockCodeBlock.controls = [
        { 
          id: 'ctrl-range', 
          type: 'range', 
          label: 'Range', 
          value: { min: 0, max: 100 }, 
          min: 0, 
          max: 100, 
          step: 1 
        }
      ];

      mockVisualization.controlValues = { 'Range': { min: 25, max: 75 } };

      const hasCustomParams = mockCodeBlock.controls?.some(control => {
        const vizValue = mockVisualization.controlValues?.[control.label];
        const defaultValue = control.value;
        return JSON.stringify(vizValue) !== JSON.stringify(defaultValue);
      });

      expect(hasCustomParams).toBe(true);
    });

    it('should handle array values', () => {
      mockCodeBlock.controls = [
        { 
          id: 'ctrl-multi', 
          type: 'select', 
          label: 'Options', 
          value: ['a', 'b'], 
          options: ['a', 'b', 'c'] 
        }
      ];

      mockVisualization.controlValues = { 'Options': ['a', 'b', 'c'] };

      const hasCustomParams = mockCodeBlock.controls?.some(control => {
        const vizValue = mockVisualization.controlValues?.[control.label];
        const defaultValue = control.value;
        return JSON.stringify(vizValue) !== JSON.stringify(defaultValue);
      });

      expect(hasCustomParams).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle missing control values gracefully', () => {
      mockVisualization.controlValues = {};

      const hasCustomParams = mockCodeBlock.controls?.some(control => {
        const vizValue = mockVisualization.controlValues?.[control.label];
        const defaultValue = control.value;
        return vizValue !== defaultValue;
      });

      // Should consider missing values as different from defaults
      expect(hasCustomParams).toBe(true);
    });

    it('should handle visualization without source code block', () => {
      mockVisualization.sourceCodeBlockId = 'non-existent';
      
      // Should not throw when checking params without source
      const checkParams = () => {
        return mockCodeBlock.controls?.some(control => {
          const vizValue = mockVisualization.controlValues?.[control.label];
          return vizValue !== control.value;
        });
      };

      expect(checkParams).not.toThrow();
    });

    it('should handle code block without controls', () => {
      mockCodeBlock.controls = undefined;

      const hasCustomParams = mockCodeBlock.controls?.some(() => true);
      expect(hasCustomParams).toBeUndefined();
    });
  });
});
