# Testing Guidelines

This document provides comprehensive guidelines for writing tests in the project. It covers testing patterns, best practices, and examples for different component types.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Structure](#testing-structure)
- [Component Testing](#component-testing)
  - [UI Components](#ui-components)
  - [Interactive Components](#interactive-components)
  - [Container Components](#container-components)
- [Hook Testing](#hook-testing)
- [Utility Function Testing](#utility-function-testing)
- [Mocking](#mocking)
  - [API Mocking](#api-mocking)
  - [Context Mocking](#context-mocking)
  - [Module Mocking](#module-mocking)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Testing Philosophy

Our testing approach follows these principles:

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Write maintainable tests**: Tests should be easy to understand and maintain.
3. **Test at the right level**: Use the appropriate testing level (unit, integration, e2e) for each scenario.
4. **Prioritize user-centric tests**: Test from the user's perspective when possible.
5. **Keep tests simple**: Each test should verify one specific behavior.

## Testing Structure

Tests are organized alongside the components they test, following a `[component-name].test.tsx` naming convention. For global test utilities and setup, we use the `__tests__` directory.

```
├── __tests__/                  # Global test utilities and setup
│   ├── setup.ts                # Global test setup
│   ├── test-utils.tsx          # Common test utilities
│   └── mocks/                  # Common mocks
├── components/
│   ├── component-name.tsx      # Component source
│   └── component-name.test.tsx # Component tests
├── lib/
│   ├── util-name.ts            # Utility source
│   └── util-name.test.ts       # Utility tests
```

## Component Testing

### UI Components

UI components are primarily tested for correct rendering and appearance.

#### Example: Testing a UI Component

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: /primary button/i });
    expect(button).toHaveClass('bg-primary');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button', { name: /disabled button/i })).toBeDisabled();
  });
});
```

### Interactive Components

Interactive components should be tested for user interactions and state changes.

#### Example: Testing an Interactive Component

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from '@/components/counter';

describe('Counter', () => {
  it('increments count when increment button is clicked', async () => {
    render(<Counter initialCount={0} />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await userEvent.click(incrementButton);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('decrements count when decrement button is clicked', async () => {
    render(<Counter initialCount={5} />);
    
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
    
    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    await userEvent.click(decrementButton);
    
    expect(screen.getByText('Count: 4')).toBeInTheDocument();
  });

  it('does not allow count to go below zero', async () => {
    render(<Counter initialCount={0} />);
    
    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    await userEvent.click(decrementButton);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});
```

### Container Components

Container components often interact with context, state management, or data fetching. These require more complex test setups.

#### Example: Testing a Container Component

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '@/components/user-profile';
import { UserContext } from '@/lib/contexts/user-context';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API server
const server = setupServer(
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(ctx.json({ name: 'John Doe', email: 'john@example.com' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile', () => {
  it('renders user data from context', () => {
    const mockUser = { id: '1', name: 'Jane Doe', email: 'jane@example.com' };
    
    render(
      <UserContext.Provider value={{ user: mockUser, isAuthenticated: true }}>
        <UserProfile />
      </UserContext.Provider>
    );
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('fetches and displays user data when not provided in context', async () => {
    render(
      <UserContext.Provider value={{ isAuthenticated: true }}>
        <UserProfile userId="123" />
      </UserContext.Provider>
    );
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('/api/user/profile', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(
      <UserContext.Provider value={{ isAuthenticated: true }}>
        <UserProfile userId="123" />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error loading profile')).toBeInTheDocument();
    });
  });
});
```

## Hook Testing

Hooks are tested using the `renderHookWithProviders` function from `__tests__/hook-utils.tsx`.

### Example: Testing a Simple Hook

```tsx
import { renderHookWithProviders, act } from '@/__tests__/hook-utils';
import { useCounter } from '@/lib/hooks/use-counter';

describe('useCounter', () => {
  it('returns the expected initial state', () => {
    const { result } = renderHookWithProviders(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments the counter', () => {
    const { result } = renderHookWithProviders(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements the counter', () => {
    const { result } = renderHookWithProviders(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('resets the counter', () => {
    const { result } = renderHookWithProviders(() => useCounter(5));
    
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);
  });
});
```

### Example: Testing a Hook with Side Effects

```tsx
import { renderHookWithProviders, act } from '@/__tests__/hook-utils';
import { useFetch } from '@/lib/hooks/use-fetch';

// Mock fetch
global.fetch = jest.fn();

describe('useFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches data and updates state', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result, waitForNextUpdate } = renderHookWithProviders(() => 
      useFetch('/api/data')
    );

    // Initial state
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await waitForNextUpdate();

    // Updated state
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/data');
  });

  it('handles fetch errors', async () => {
    const errorMessage = 'Network error';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHookWithProviders(() => 
      useFetch('/api/data')
    );

    await waitForNextUpdate();

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(errorMessage);
  });
});
```

## Utility Function Testing

Utility functions are tested directly by calling them with various inputs and asserting on the outputs.

### Example: Testing a Formatting Utility

```tsx
import { formatCurrency } from '@/lib/utils/format-utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    expect(formatCurrency(1000.5, 'USD')).toBe('$1,000.50');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    expect(formatCurrency(1000.5, 'EUR')).toBe('€1,000.50');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-1000, 'USD')).toBe('-$1,000.00');
  });

  it('uses default currency when not specified', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});
```

### Example: Testing a Validation Utility

```tsx
import { validateEmail } from '@/lib/utils/validation-utils';

describe('validateEmail', () => {
  it('returns true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@example')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@exam ple.com')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });
});
```

## Mocking

### API Mocking

We use Mock Service Worker (MSW) to mock API requests. This allows us to test components that make API calls without actually making network requests.

#### Example: Setting up MSW

```tsx
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ])
    );
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    const { name } = req.body as { name: string };
    return res(
      ctx.status(201),
      ctx.json({ id: 3, name })
    );
  }),
  
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({ id: 1, name: 'John Doe' })
      );
    }
    return res(ctx.status(404));
  }),
];

// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

#### Example: Using MSW in Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from '@/components/user-list';
import { server } from '@/__tests__/mocks/server';

// Start the server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('UserList', () => {
  it('renders a list of users', async () => {
    render(<UserList />);
    
    // Initially shows loading state
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
```

### Context Mocking

For components that use React Context, we need to provide mock context values.

#### Example: Mocking Context

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeContext, ThemeProvider } from '@/lib/contexts/theme-context';
import { ThemedComponent } from '@/components/themed-component';

describe('ThemedComponent', () => {
  it('renders with light theme by default', () => {
    render(<ThemedComponent />, { wrapper: ThemeProvider });
    expect(screen.getByTestId('themed-component')).toHaveClass('light-theme');
  });

  it('renders with dark theme when provided', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'dark', setTheme: jest.fn() }}>
        <ThemedComponent />
      </ThemeContext.Provider>
    );
    expect(screen.getByTestId('themed-component')).toHaveClass('dark-theme');
  });
});
```

### Module Mocking

Sometimes we need to mock entire modules or specific functions from modules.

#### Example: Mocking a Module

```tsx
// Mock the entire module
jest.mock('@/lib/utils/date-utils', () => ({
  formatDate: jest.fn().mockReturnValue('2023-01-01'),
  isToday: jest.fn().mockReturnValue(true),
}));

import { formatDate, isToday } from '@/lib/utils/date-utils';
import { DateDisplay } from '@/components/date-display';

describe('DateDisplay', () => {
  it('displays formatted date', () => {
    render(<DateDisplay date={new Date()} />);
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalled();
  });

  it('shows "Today" indicator when date is today', () => {
    render(<DateDisplay date={new Date()} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(isToday).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Test behavior, not implementation details**
   - Focus on what the component does, not how it does it
   - Avoid testing internal state unless necessary
   - Test from the user's perspective when possible

2. **Write maintainable tests**
   - Keep tests simple and focused
   - Use descriptive test names
   - Avoid duplication with test helpers and fixtures
   - Use setup and teardown functions for common operations

3. **Test edge cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary conditions

4. **Use the right queries**
   - Prefer user-centric queries (getByRole, getByLabelText)
   - Avoid implementation-specific queries (getByTestId) when possible
   - Use the most specific query that makes sense

5. **Clean up after tests**
   - Reset mocks between tests
   - Clean up any side effects
   - Restore any global objects that were modified

6. **Test accessibility**
   - Verify ARIA attributes
   - Test keyboard navigation
   - Check for proper focus management

## Common Patterns

### Testing Form Submission

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/login-form';

describe('LoginForm', () => {
  it('submits the form with user input', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check that the form was submitted with the correct data
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('validates form fields before submission', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Submit without filling out the form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check that validation errors are displayed
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Check that the form was not submitted
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
```

### Testing Conditional Rendering

```tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/user-profile';

describe('UserProfile', () => {
  it('renders admin controls for admin users', () => {
    render(<UserProfile user={{ name: 'Admin', role: 'admin' }} />);
    expect(screen.getByText('Admin Controls')).toBeInTheDocument();
  });

  it('does not render admin controls for regular users', () => {
    render(<UserProfile user={{ name: 'User', role: 'user' }} />);
    expect(screen.queryByText('Admin Controls')).not.toBeInTheDocument();
  });

  it('renders a message when no user is provided', () => {
    render(<UserProfile />);
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataFetcher } from '@/components/data-fetcher';

describe('DataFetcher', () => {
  it('fetches and displays data when button is clicked', async () => {
    // Mock the fetch function
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'Test Data' }),
    });
    
    render(<DataFetcher />);
    
    // Click the fetch button
    await userEvent.click(screen.getByRole('button', { name: /fetch data/i }));
    
    // Check that loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Data')).toBeInTheDocument();
    });
    
    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/data');
  });

  it('handles fetch errors', async () => {
    // Mock the fetch function to reject
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch error'));
    
    render(<DataFetcher />);
    
    // Click the fetch button
    await userEvent.click(screen.getByRole('button', { name: /fetch data/i }));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error: Fetch error')).toBeInTheDocument();
    });
  });
});
```