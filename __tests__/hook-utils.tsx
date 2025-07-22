import { act, renderHook } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Wrapper for hooks that need providers
interface WrapperProps {
    children: ReactNode;
    theme?: 'light' | 'dark';
}

export function createWrapper(options: { theme?: 'light' | 'dark' } = {}) {
    return function Wrapper({ children }: WrapperProps) {
        return (
            <ThemeProvider defaultTheme={options.theme || 'light'} enableSystem={false} attribute="class">
                {children}
            </ThemeProvider>
        );
    };
}

// Re-export act from React Testing Library
export { act };

// Helper function to render hooks with common providers
export function renderHookWithProviders<Result, Props>(
    render: (props: Props) => Result,
    options: {
        initialProps?: Props;
        theme?: 'light' | 'dark';
    } = {}
) {
    return renderHook(render, {
        wrapper: createWrapper({ theme: options.theme }),
        initialProps: options.initialProps,
    });
}