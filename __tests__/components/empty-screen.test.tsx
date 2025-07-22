import { EmptyScreen } from '@/components/empty-screen';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
    ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
    BookOpen: () => <div data-testid="book-open-icon">BookOpen</div>,
    Code: () => <div data-testid="code-icon">Code</div>,
    Globe: () => <div data-testid="globe-icon">Globe</div>,
    Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb</div>,
    Sparkles: () => <div data-testid="sparkles-icon">Sparkles</div>,
    TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
}));

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, variant }: {
        children: React.ReactNode,
        onClick: () => void,
        className?: string,
        variant?: string
    }) => (
        <button
            data-testid="button"
            onClick={onClick}
            className={className}
            data-variant={variant}
        >
            {children}
        </button>
    ),
}));

describe('EmptyScreen', () => {
    const mockSubmitMessage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with example prompts', () => {
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Check that the heading is rendered
        expect(screen.getByText('Try asking about...')).toBeInTheDocument();

        // Check that example prompts are rendered
        expect(screen.getByText('Latest AI developments')).toBeInTheDocument();
        expect(screen.getByText('Market trends analysis')).toBeInTheDocument();
        expect(screen.getByText('Global news summary')).toBeInTheDocument();
        expect(screen.getByText('Code explanation')).toBeInTheDocument();
        expect(screen.getByText('Learning resources')).toBeInTheDocument();
        expect(screen.getByText('Creative ideas')).toBeInTheDocument();
    });

    it('renders all example messages with their content', () => {
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Check that all example messages are rendered with their content
        expect(screen.getByText('What are the latest developments in artificial intelligence?')).toBeInTheDocument();
        expect(screen.getByText('Analyze current market trends in technology stocks')).toBeInTheDocument();
        expect(screen.getByText('Give me a summary of today\'s most important global news')).toBeInTheDocument();
        expect(screen.getByText('Explain how React hooks work with examples')).toBeInTheDocument();
        expect(screen.getByText('Best resources to learn machine learning in 2024')).toBeInTheDocument();
        expect(screen.getByText('Give me creative startup ideas for sustainable technology')).toBeInTheDocument();
    });

    it('renders all icons for example prompts', () => {
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Check that all icons are rendered
        expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
        expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
        expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
        expect(screen.getByTestId('code-icon')).toBeInTheDocument();
        expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
        expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    });

    it('calls submitMessage when an example prompt is clicked', async () => {
        const user = userEvent.setup();
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Click on an example prompt
        await user.click(screen.getByText('Latest AI developments'));

        // Check that submitMessage was called with the correct message
        expect(mockSubmitMessage).toHaveBeenCalledWith(
            'What are the latest developments in artificial intelligence?'
        );
    });

    it('calls submitMessage with the correct message for each example prompt', async () => {
        const user = userEvent.setup();
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Test clicking on each example prompt
        const examplePrompts = [
            {
                heading: 'Latest AI developments',
                message: 'What are the latest developments in artificial intelligence?',
            },
            {
                heading: 'Market trends analysis',
                message: 'Analyze current market trends in technology stocks',
            },
            {
                heading: 'Global news summary',
                message: 'Give me a summary of today\'s most important global news',
            },
            {
                heading: 'Code explanation',
                message: 'Explain how React hooks work with examples',
            },
            {
                heading: 'Learning resources',
                message: 'Best resources to learn machine learning in 2024',
            },
            {
                heading: 'Creative ideas',
                message: 'Give me creative startup ideas for sustainable technology',
            },
        ];

        for (const prompt of examplePrompts) {
            mockSubmitMessage.mockClear();
            await user.click(screen.getByText(prompt.heading));
            expect(mockSubmitMessage).toHaveBeenCalledWith(prompt.message);
        }
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <EmptyScreen submitMessage={mockSubmitMessage} className="custom-class" />
        );

        // Check that the custom class is applied
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders buttons with ghost variant', () => {
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Check that all buttons have the ghost variant
        const buttons = screen.getAllByTestId('button');
        buttons.forEach(button => {
            expect(button).toHaveAttribute('data-variant', 'ghost');
        });
    });

    it('renders the correct number of example prompts', () => {
        render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Check that there are 6 example prompts
        const buttons = screen.getAllByTestId('button');
        expect(buttons).toHaveLength(6);
    });
});