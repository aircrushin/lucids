import { Model } from '@/lib/types/models';
import { User } from '@supabase/supabase-js';
import { Message } from 'ai';

/**
 * Generate a mock user for testing
 * @param overrides - Optional properties to override default values
 * @returns A mock User object
 */
export function generateMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Generate mock models for testing
 * @param count - Number of models to generate
 * @returns An array of mock Model objects
 */
export function generateMockModels(count = 3): Model[] {
  const providers = ['OpenAI', 'Anthropic', 'Google'];
  const providerIds = ['openai', 'anthropic', 'google'];
  
  return Array.from({ length: count }).map((_, index) => ({
    id: `model-${index + 1}`,
    name: `Model ${index + 1}`,
    provider: providers[index % providers.length],
    providerId: providerIds[index % providerIds.length],
    enabled: true,
    description: `Description for Model ${index + 1}`,
    contextLength: 8192,
    maxCompletionTokens: 4096,
  }));
}

/**
 * Generate mock chat messages for testing
 * @param count - Number of message pairs to generate (user + assistant)
 * @returns An array of mock Message objects
 */
export function generateMockMessages(count = 2): Message[] {
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    // Add user message
    messages.push({
      id: `user-message-${i}`,
      role: 'user',
      content: `This is test user message ${i + 1}`,
      createdAt: new Date(Date.now() - (count - i) * 60000).toISOString(),
    });
    
    // Add assistant message
    messages.push({
      id: `assistant-message-${i}`,
      role: 'assistant',
      content: `This is test assistant response ${i + 1}`,
      createdAt: new Date(Date.now() - (count - i) * 60000 + 30000).toISOString(),
    });
  }
  
  return messages;
}

/**
 * Generate mock API response for testing
 * @param type - Type of API response to generate
 * @param overrides - Optional properties to override default values
 * @returns A mock API response object
 */
export function generateMockApiResponse<T>(type: 'success' | 'error', data?: T, overrides?: Record<string, any>) {
  if (type === 'success') {
    return {
      status: 200,
      ok: true,
      data: data || { message: 'Success' },
      ...overrides,
    };
  } else {
    return {
      status: 400,
      ok: false,
      error: {
        message: 'Error occurred',
        code: 'BAD_REQUEST',
      },
      ...overrides,
    };
  }
}

/**
 * Generate mock search results for testing
 * @param count - Number of search results to generate
 * @returns An array of mock search result objects
 */
export function generateMockSearchResults(count = 5) {
  return Array.from({ length: count }).map((_, index) => ({
    id: `result-${index + 1}`,
    title: `Search Result ${index + 1}`,
    url: `https://example.com/result-${index + 1}`,
    snippet: `This is a snippet for search result ${index + 1}. It contains some sample text that would be displayed in search results.`,
    source: `source-${index % 3 + 1}`,
    published: new Date(Date.now() - index * 86400000).toISOString(),
  }));
}