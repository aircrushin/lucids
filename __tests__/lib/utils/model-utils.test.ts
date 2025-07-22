import { Model } from '@/lib/types/models';
import { createModelId, getDefaultModelId } from '@/lib/utils';
import { isReasoningModel } from '@/lib/utils/registry';

// Unmock the functions since we want to test the actual implementation
jest.unmock('@/lib/utils');
jest.unmock('@/lib/utils/registry');

describe('Model Utility Functions', () => {
  describe('createModelId', () => {
    it('should create a model ID by combining providerId and id with a colon', () => {
      const model: Model = {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        providerId: 'openai',
        enabled: true,
        toolCallType: 'native'
      };
      
      expect(createModelId(model)).toBe('openai:gpt-4');
    });
    
    it('should handle models with special characters in id or providerId', () => {
      const model: Model = {
        id: 'model-123_456',
        name: 'Special Model',
        provider: 'Test Provider',
        providerId: 'test-provider',
        enabled: true,
        toolCallType: 'native'
      };
      
      expect(createModelId(model)).toBe('test-provider:model-123_456');
    });
    
    it('should handle models with numeric ids', () => {
      const model: Model = {
        id: '123',
        name: 'Numeric Model',
        provider: 'Test Provider',
        providerId: '456',
        enabled: true,
        toolCallType: 'native'
      };
      
      expect(createModelId(model)).toBe('456:123');
    });
  });
  
  describe('getDefaultModelId', () => {
    it('should return the ID of the first model in the array', () => {
      const models: Model[] = [
        {
          id: 'model1',
          name: 'Model 1',
          provider: 'Provider 1',
          providerId: 'provider1',
          enabled: true,
          toolCallType: 'native'
        },
        {
          id: 'model2',
          name: 'Model 2',
          provider: 'Provider 2',
          providerId: 'provider2',
          enabled: true,
          toolCallType: 'native'
        }
      ];
      
      expect(getDefaultModelId(models)).toBe('provider1:model1');
    });
    
    it('should throw an error if the models array is empty', () => {
      expect(() => {
        getDefaultModelId([]);
      }).toThrow('No models available');
    });
  });
  
  describe('isReasoningModel', () => {
    it('should return true for models containing deepseek-r1', () => {
      expect(isReasoningModel('deepseek-r1')).toBe(true);
      expect(isReasoningModel('provider:deepseek-r1-model')).toBe(true);
      expect(isReasoningModel('deepseek-r1-ultra')).toBe(true);
    });
    
    it('should return true for models containing deepseek-reasoner', () => {
      expect(isReasoningModel('deepseek-reasoner')).toBe(true);
      expect(isReasoningModel('provider:deepseek-reasoner-model')).toBe(true);
      expect(isReasoningModel('deepseek-reasoner-plus')).toBe(true);
    });
    
    it('should return true for models containing o3-mini', () => {
      expect(isReasoningModel('o3-mini')).toBe(true);
      expect(isReasoningModel('provider:o3-mini-model')).toBe(true);
      expect(isReasoningModel('o3-mini-plus')).toBe(true);
    });
    
    it('should return false for models not containing any reasoning model identifiers', () => {
      expect(isReasoningModel('gpt-4')).toBe(false);
      expect(isReasoningModel('claude-3')).toBe(false);
      expect(isReasoningModel('llama-3')).toBe(false);
    });
    
    it('should return false for non-string inputs', () => {
      // @ts-ignore - Testing runtime behavior with incorrect types
      expect(isReasoningModel(null)).toBe(false);
      // @ts-ignore - Testing runtime behavior with incorrect types
      expect(isReasoningModel(undefined)).toBe(false);
      // @ts-ignore - Testing runtime behavior with incorrect types
      expect(isReasoningModel(123)).toBe(false);
      // @ts-ignore - Testing runtime behavior with incorrect types
      expect(isReasoningModel({})).toBe(false);
    });
  });
});