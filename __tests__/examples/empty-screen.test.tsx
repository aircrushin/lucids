import { EmptyScreen } from '@/components/empty-screen';
import { render, screen } from '../test-utils';

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

    it('calls submitMessage when an example prompt is clicked', async () => {
        const { user } = render(<EmptyScreen submitMessage={mockSubmitMessage} />);

        // Click on an example prompt
        await user.click(screen.getByText('Latest AI developments'));

        // Check that submitMessage was called with the correct message
        expect(mockSubmitMessage).toHaveBeenCalledWith(
            'What are the latest developments in artificial intelligence?'
        );
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <EmptyScreen submitMessage={mockSubmitMessage} className="custom-class" />
        );

        // Check that the custom class is applied
        expect(container.firstChild).toHaveClass('custom-class');
    });
});