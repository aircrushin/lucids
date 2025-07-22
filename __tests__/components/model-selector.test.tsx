import { ModelSelector } from '@/components/model-selector';
import { createModelId } from '@/lib/utils';
import { getCookie } from '@/lib/utils/cookies';
import { isReasoningModel } from '@/lib/utils/registry';
import { render, screen } from '@testing-library/react';
import { generateMockModels } from '../mocks/mock-data';

// Mock the cookies utility functions
jest.mock('@/lib/utils/cookies', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

// Mock the registry utility functions
jest.mock('@/lib/utils/registry', () => ({
    isReasoningModel: jest.fn(),
}));

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
    createModelId: jest.fn((model) => `${model.providerId}-${model.id}`),
    cn: jest.fn((...inputs) => inputs.join(' ')),
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => (
        <img
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            className={props.className}
        />
    ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Check: () => <div data-testid="check-icon">Check</div>,
    ChevronsUpDown: () => <div data-testid="chevrons-updown-icon">ChevronsUpDown</div>,
    Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb</div>,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock the UI components that are causing issues
jest.mock('@/components/ui/command', () => ({
    Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
    CommandInput: ({ placeholder }: { placeholder: string }) => <input data-testid="command-input" placeholder={placeholder} />,
    CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
    CommandGroup: ({ heading, children }: { heading: string, children: React.ReactNode }) => (
        <div data-testid="command-group" data-heading={heading}>{children}</div>
    ),
    CommandItem: ({ value, onSelect, children }: { value: string, onSelect: (value: string) => void, children: React.ReactNode }) => (
        <div data-testid="command-item" data-value={value} onClick={() => onSelect(value)}>{children}</div>
    ),
}));

jest.mock('@/components/ui/popover', () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
    PopoverTrigger: ({ asChild, children }: { asChild: boolean, children: React.ReactNode }) => (
        <div data-testid="popover-trigger">{children}</div>
    ),
    PopoverContent: ({ children, className, align }: { children: React.ReactNode, className: string, align: string }) => (
        <div data-testid="popover-content" data-align={align} className={className}>{children}</div>
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className, role, onClick }: { children: React.ReactNode, className?: string, role?: string, onClick?: () => void }) => (
        <button data-testid="button" className={className} role={role} onClick={onClick}>{children}</button>
    ),
}));

describe('ModelSelector', () => {
    const mockModels = generateMockModels(3);

    beforeEach(() => {
        jest.clearAllMocks();
        (isReasoningModel as jest.Mock).mockImplementation((id) => id === 'model-1');
    });

    it('renders correctly with default state', () => {
        // Mock getCookie to return null (no selected model)
        (getCookie as jest.Mock).mockReturnValue(null);

        render(<ModelSelector models={mockModels} />);

        // Check that the default state is rendered
        expect(screen.getByText('Select model')).toBeInTheDocument();
    });

    it('renders with a selected model from cookie', () => {
        // Mock getCookie to return a selected model
        const selectedModel = mockModels[0];
        (getCookie as jest.Mock).mockReturnValue(JSON.stringify(selectedModel));
        (createModelId as jest.Mock).mockReturnValueOnce(`${selectedModel.providerId}-${selectedModel.id}`);

        render(<ModelSelector models={mockModels} />);

        // The model name should be in the document
        expect(screen.getByTestId('button')).toHaveTextContent(selectedModel.name);
    });

    it('handles invalid cookie data gracefully', () => {
        // Mock getCookie to return invalid JSON
        (getCookie as jest.Mock).mockReturnValue('invalid-json');

        // Mock console.error to prevent test output pollution
        const originalConsoleError = console.error;
        console.error = jest.fn();

        render(<ModelSelector models={mockModels} />);

        // Check that the default state is rendered
        expect(screen.getByText('Select model')).toBeInTheDocument();

        // Verify console.error was called
        expect(console.error).toHaveBeenCalled();

        // Restore console.error
        console.error = originalConsoleError;
    });

    it('displays reasoning model indicator for reasoning models', () => {
        // Mock isReasoningModel to return true for the first model
        (isReasoningModel as jest.Mock).mockImplementation((id) => id === mockModels[0].id);

        // Mock getCookie to return the first model
        (getCookie as jest.Mock).mockReturnValue(JSON.stringify(mockModels[0]));
        (createModelId as jest.Mock).mockReturnValue(`${mockModels[0].providerId}-${mockModels[0].id}`);

        render(<ModelSelector models={mockModels} />);

        // Check that the lightbulb icon is displayed (using getAllByTestId since there might be multiple)
        expect(screen.getAllByTestId('lightbulb-icon').length).toBeGreaterThan(0);
    });
});