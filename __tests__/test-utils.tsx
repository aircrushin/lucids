import { Model } from '@/lib/types/models';
import { User } from '@supabase/supabase-js';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import React, { ReactElement } from 'react';

// Mock Next.js navigation hooks
const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
};

// Mock Supabase Auth Context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const MockAuthContext = React.createContext<AuthContextType>({
    user: null,
    isLoading: false,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

// Create a custom render function that includes common providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    theme?: 'light' | 'dark';
    router?: typeof mockRouter;
    user?: User | null;
    isAuthLoading?: boolean;
    models?: Model[];
    searchMode?: 'normal' | 'academic';
}

export function renderWithProviders(
    ui: ReactElement,
    {
        theme = 'light',
        router = mockRouter,
        user = null,
        isAuthLoading = false,
        models = [],
        searchMode = 'normal',
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    // Mock auth context value
    const authContextValue: AuthContextType = {
        user,
        isLoading: isAuthLoading,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    };

    // Create wrapper with all providers
    function AllTheProviders({ children }: { children: React.ReactNode }) {
        return (
            <MockAuthContext.Provider value={authContextValue}>
                <ThemeProvider defaultTheme={theme} enableSystem={false} attribute="class">
                    {children}
                </ThemeProvider>
            </MockAuthContext.Provider>
        );
    }

    // Setup user event
    const user = userEvent.setup();

    return {
        user,
        router,
        ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
    };
}

// Helper function to render with specific context values
export function renderWithContext(
    ui: ReactElement,
    contextValue: Partial<AuthContextType>,
    options: CustomRenderOptions = {}
) {
    const authContextValue: AuthContextType = {
        user: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        ...contextValue,
    };

    function ContextProvider({ children }: { children: React.ReactNode }) {
        return (
            <MockAuthContext.Provider value={authContextValue}>
                <ThemeProvider defaultTheme={options.theme || 'light'} enableSystem={false} attribute="class">
                    {children}
                </ThemeProvider>
            </MockAuthContext.Provider>
        );
    }

    const user = userEvent.setup();

    return {
        user,
        ...render(ui, { wrapper: ContextProvider, ...options }),
    };
}

// Export the auth context for components that need to use it
export const useAuth = () => React.useContext(MockAuthContext);

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };

