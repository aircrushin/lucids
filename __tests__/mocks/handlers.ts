import { http, HttpResponse } from 'msw';
import { generateMockMessages, generateMockModels, generateMockSearchResults, generateMockUser } from './mock-data';

// Define handlers for API endpoints
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: generateMockUser(),
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
      }
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Chat endpoints
  http.post('/api/chat', async ({ request }) => {
    const body = await request.json();
    
    // Return a mock response based on the request
    return HttpResponse.json({
      id: 'mock-chat-id',
      messages: generateMockMessages(1),
      createdAt: new Date().toISOString(),
      ...body,
    });
  }),

  // Models endpoint
  http.get('/api/models', () => {
    return HttpResponse.json({
      models: generateMockModels(5),
    });
  }),

  // Search endpoints
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const mode = url.searchParams.get('mode') || 'normal';
    
    return HttpResponse.json({
      results: generateMockSearchResults(5),
      query,
      mode,
    });
  }),

  // Fallback for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { error: 'Please add request handler for this endpoint' },
      { status: 404 }
    );
  }),
];