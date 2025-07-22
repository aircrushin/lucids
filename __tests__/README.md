# Testing Guide

This document provides guidelines for writing tests in the project.

## Table of Contents

- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Utility Function Testing](#utility-function-testing)
- [Running Tests](#running-tests)

## Component Testing

Components are tested using React Testing Library. Use the `renderWithProviders` function from `__tests__/test-utils.tsx` to render components with the necessary providers.

```tsx
import { renderWithProviders, screen } from '@/__tests__/test-utils';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

## Hook Testing

Hooks are tested using the `renderHookWithProviders` function from `__tests__/hook-utils.tsx`.

### Example: Testing a Hook

```tsx
import { renderHookWithProviders, act } from '@/__tests__/hook-utils';
import { useMyHook } from '@/lib/hooks/use-my-hook';

describe('useMyHook', () => {
  it('returns the expected initial state', () => {
    const { result } = renderHookWithProviders(() => useMyHook());
    expect(result.current.value).toBe('initial value');
  });

  it('updates state when action is called', () => {
    const { result } = renderHookWithProviders(() => useMyHook());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### Testing Hooks with Context

If your hook depends on context, you can provide the context in the wrapper:

```tsx
import { renderHook } from '@testing-library/react';
import { MyContext } from '@/lib/contexts/my-context';

const wrapper = ({ children }) => (
  <MyContext.Provider value={{ user: { id: '1', name: 'Test User' } }}>
    {children}
  </MyContext.Provider>
);

const { result } = renderHook(() => useMyHook(), { wrapper });
```

### Testing Hooks with Side Effects

For hooks with side effects (like setTimeout, fetch, etc.), make sure to mock those dependencies:

```tsx
// Mock timers
jest.useFakeTimers();

// Test timeout behavior
act(() => {
  result.current.startTimer();
  jest.advanceTimersByTime(1000);
});

// Restore real timers
jest.useRealTimers();
```

## Utility Function Testing

Utility functions are tested directly:

```tsx
import { formatDate } from '@/lib/utils/date-utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-01-01');
    expect(formatDate(date)).toBe('01/01/2023');
  });
});
```

## Running Tests

- Run all tests: `npm test`
- Run specific test file: `npm test -- path/to/test.ts`
- Run tests with coverage: `npm run test:coverage`
- Run tests in watch mode: `npm run test:watch`