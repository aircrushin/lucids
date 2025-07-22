import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with the defined handlers
export const server = setupServer(...handlers);

// Configure MSW for tests
beforeAll(() => {
  // Start the server before all tests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset handlers between tests
  server.resetHandlers();
});

afterAll(() => {
  // Close the server after all tests
  server.close();
});