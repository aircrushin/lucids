import { ChatPanel } from '@/components/chat-panel';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Message } from 'ai';

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock('react-type-animation', () => ({
    TypeAnimation: () => <div data-testid="type-animation">Mocked Type Animation</div>,
}));

jest.mock('@/components/empty-screen', () => ({
    EmptyScreen: ({ submitMessage, className }: { submitMessage: (message: string) => void, className?: string }) => (
        <div data-testid="empty-screen" className={className}>
            <button
                data-testid="example-prompt"
                onClick={() => submitMessage('Example prompt')}
            >
                Example prompt
            </button>
        </div>
    ),
}));

jest.mock('@/components/model-selector', () => ({
    ModelSelector: () => <div data-testid="model-selector">Model Selector</div>,
}));

jest.mock('@/components/search-mode-toggle', () => ({
    SearchModeToggle: () => <div data-testid="search-mode-toggle">Search Mode Toggle</div>,
}));

jest.mock('lucide-react', () => ({
    ArrowUp: () => <div data-testid="arrow-up-icon">Arrow Up</div>,
    Square: () => <div data-testid="square-icon">Square</div>,
    MessageCirclePlus: () => <div data-testid="message-circle-plus-icon">Message Circle Plus</div>,
}));

// Mock the ai module
jest.mock('ai', () => {
    return {
        Message: class {
            id?: string;
            role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
            content: string;
            createdAt?: string;
            constructor(props: any) {
                Object.assign(this, props);
            }
        }
    };
});

describe('ChatPanel', () => {
    // Common props for testing
    const defaultProps = {
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        isLoading: false,
        messages: [] as Message[],
        setMessages: jest.fn(),
        stop: jest.fn(),
        append: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty state correctly', () => {
        render(<ChatPanel {...defaultProps} />);

        // Check for empty state elements
        expect(screen.getByTestId('type-animation')).toBeInTheDocument();
        expect(screen.getByText('Ask anything and get comprehensive answers with real-time information')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ask anything... ✨')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        const handleInputChange = jest.fn();
        const user = userEvent.setup();

        render(<ChatPanel {...defaultProps} handleInputChange={handleInputChange} />);

        const textarea = screen.getByPlaceholderText('Ask anything... ✨');
        await user.type(textarea, 'Hello world');

        expect(handleInputChange).toHaveBeenCalled();
    });

    it('submits the form when Enter is pressed', async () => {
        const handleSubmit = jest.fn(e => e.preventDefault());
        const user = userEvent.setup();

        render(
            <ChatPanel
                {...defaultProps}
                input="Test message"
                handleSubmit={handleSubmit}
            />
        );

        const textarea = screen.getByPlaceholderText('Ask anything... ✨');
        await user.type(textarea, '{Enter}');

        expect(handleSubmit).toHaveBeenCalled();
    });

    it('does not submit empty form when Enter is pressed', async () => {
        const handleSubmit = jest.fn(e => e.preventDefault());
        const user = userEvent.setup();

        render(
            <ChatPanel
                {...defaultProps}
                input=""
                handleSubmit={handleSubmit}
            />
        );

        const textarea = screen.getByPlaceholderText('Ask anything... ✨');
        await user.type(textarea, '{Enter}');

        expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('shows loading state correctly', () => {
        render(<ChatPanel {...defaultProps} isLoading={true} />);

        // Should show the stop button when loading
        expect(screen.getByTestId('square-icon')).toBeInTheDocument();
    });

    it('calls stop function when stop button is clicked during loading', async () => {
        const stopFn = jest.fn();
        const user = userEvent.setup();

        render(<ChatPanel {...defaultProps} isLoading={true} stop={stopFn} />);

        const stopButton = screen.getByTestId('square-icon').closest('button');
        if (stopButton) {
            await user.click(stopButton);
            expect(stopFn).toHaveBeenCalled();
        } else {
            fail('Stop button not found');
        }
    });

    it('shows EmptyScreen when there are no messages and textarea is focused', async () => {
        const user = userEvent.setup();
        render(<ChatPanel {...defaultProps} />);

        // EmptyScreen should be visible when textarea is focused
        const textarea = screen.getByPlaceholderText('Ask anything... ✨');
        await user.click(textarea);

        // EmptyScreen should be visible
        expect(screen.getByTestId('empty-screen')).toBeInTheDocument();
        expect(screen.getByTestId('empty-screen')).toHaveClass('visible');
    });

    it('handles example prompt clicks from EmptyScreen', async () => {
        const handleInputChange = jest.fn();
        const user = userEvent.setup();

        render(<ChatPanel {...defaultProps} handleInputChange={handleInputChange} />);

        // Focus the textarea to show EmptyScreen
        const textarea = screen.getByPlaceholderText('Ask anything... ✨');
        await user.click(textarea);

        // Click on an example prompt
        const examplePrompt = screen.getByTestId('example-prompt');
        await user.click(examplePrompt);

        // Should call handleInputChange with the example prompt text
        expect(handleInputChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: 'Example prompt' })
            })
        );
    });

    it('renders with messages correctly', () => {
        const messages: Message[] = [
            { id: '1', role: 'user', content: 'Hello' } as Message,
            { id: '2', role: 'assistant', content: 'Hi there' } as Message,
        ];

        render(<ChatPanel {...defaultProps} messages={messages} />);

        // Should not show empty state elements when there are messages
        expect(screen.queryByTestId('type-animation')).not.toBeInTheDocument();

        // Should show the new chat button when there are messages
        expect(screen.getByTestId('message-circle-plus-icon')).toBeInTheDocument();
    });

    it('creates a new chat when new chat button is clicked', async () => {
        const setMessages = jest.fn();
        const messages: Message[] = [
            { id: '1', role: 'user', content: 'Hello' } as Message,
            { id: '2', role: 'assistant', content: 'Hi there' } as Message,
        ];
        const user = userEvent.setup();

        render(
            <ChatPanel
                {...defaultProps}
                messages={messages}
                setMessages={setMessages}
            />
        );

        const newChatButton = screen.getByTestId('message-circle-plus-icon').closest('button');
        if (newChatButton) {
            await user.click(newChatButton);
            expect(setMessages).toHaveBeenCalledWith([]);
        } else {
            fail('New chat button not found');
        }
    });
});