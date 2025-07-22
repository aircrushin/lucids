// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Import MSW server setup
// Note: Uncomment the following line after installing MSW
// import './mocks/server';

// Import hook testing utilities
import './hook-utils';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return `<img src="${props.src}" alt="${props.alt || ''}" />`
  }
}));

// Mock cookies utility functions
jest.mock('@/lib/utils/cookies', () => ({
  getCookie: jest.fn().mockImplementation((name) => {
    if (name === 'selectedModel') {
      return JSON.stringify({
        id: 'default-model',
        name: 'Default Model',
        provider: 'OpenAI',
        providerId: 'openai',
        enabled: true
      });
    }
    if (name === 'search-mode') {
      return 'normal';
    }
    return null;
  }),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Set up environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock the Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-access-token',
          },
        },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
    },
  }),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React does not recognize the') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('Warning: Failed prop type'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock TransformStream for AI library
global.TransformStream = class TransformStream {
  readable: ReadableStream;
  writable: WritableStream;

  constructor() {
    // Create readable stream with proper type
    const readableMock = {
      locked: false,
      cancel: jest.fn().mockResolvedValue(undefined),
      getReader: jest.fn().mockReturnValue({
        read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
        releaseLock: jest.fn(),
        closed: Promise.resolve(undefined)
      }),
      pipeThrough: jest.fn(),
      pipeTo: jest.fn().mockResolvedValue(undefined),
      tee: jest.fn()
    };

    // Set the tee method after the object is created to avoid self-reference
    readableMock.pipeThrough = jest.fn().mockReturnValue(readableMock);
    readableMock.tee = jest.fn().mockReturnValue([readableMock, readableMock]);

    this.readable = readableMock as unknown as ReadableStream;

    this.writable = {
      locked: false,
      abort: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getWriter: jest.fn().mockReturnValue({
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        abort: jest.fn().mockResolvedValue(undefined),
        releaseLock: jest.fn(),
        closed: Promise.resolve(undefined),
        ready: Promise.resolve(undefined)
      })
    } as unknown as WritableStream;
  }
};

// Clean up after all tests
afterAll(() => {
  console.error = originalConsoleError;
});