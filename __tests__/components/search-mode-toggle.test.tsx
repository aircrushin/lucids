import { SearchModeToggle } from '@/components/search-mode-toggle';
import { getCookie, setCookie } from '@/lib/utils/cookies';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the cookies utility functions
jest.mock('@/lib/utils/cookies', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
    ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
    Globe: () => <div data-testid="globe-icon">Globe</div>,
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className, variant, onClick }: {
        children: React.ReactNode,
        className?: string,
        variant?: string,
        onClick?: () => void
    }) => (
        <button
            data-testid="button"
            className={className}
            data-variant={variant}
            onClick={onClick}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-menu">{children}</div>
    ),
    DropdownMenuTrigger: ({ asChild, children }: { asChild: boolean, children: React.ReactNode }) => (
        <div data-testid="dropdown-menu-trigger">{children}</div>
    ),
    DropdownMenuContent: ({ align, className, children }: {
        align: string,
        className: string,
        children: React.ReactNode
    }) => (
        <div data-testid="dropdown-menu-content" data-align={align} className={className}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({ onClick, className, children }: {
        onClick: () => void,
        className: string,
        children: React.ReactNode
    }) => (
        <div
            data-testid="dropdown-menu-item"
            className={className}
            onClick={onClick}
        >
            {children}
        </div>
    ),
}));

describe('SearchModeToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with default state', () => {
        // Mock getCookie to return null (no saved mode)
        (getCookie as jest.Mock).mockReturnValue(null);

        render(<SearchModeToggle />);

        // Check that the default state is rendered with Normal mode in the button
        const buttonText = screen.getByText('Normal', { selector: 'span.text-xs.font-medium' });
        expect(buttonText).toBeInTheDocument();
        expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('renders with saved mode from cookie', () => {
        // Mock getCookie to return 'academic'
        (getCookie as jest.Mock).mockReturnValue('academic');

        render(<SearchModeToggle />);

        // Check that the academic mode is rendered in the button
        const buttonText = screen.getByText('Academic', { selector: 'span.text-xs.font-medium' });
        expect(buttonText).toBeInTheDocument();
    });

    it('changes mode when dropdown item is clicked', async () => {
        // Mock getCookie to return null (no saved mode)
        (getCookie as jest.Mock).mockReturnValue(null);

        const user = userEvent.setup();
        render(<SearchModeToggle />);

        // Get the dropdown items
        const dropdownItems = screen.getAllByTestId('dropdown-menu-item');

        // Find the academic mode item (the second item)
        const academicModeItem = dropdownItems.find(item => item.textContent?.includes('Academic'));

        // Click on the academic mode item
        if (academicModeItem) {
            await user.click(academicModeItem);
        }

        // Check that setCookie was called with the correct mode
        expect(setCookie).toHaveBeenCalledWith('search-mode', 'academic');
    });

    it('changes mode back to normal when normal mode item is clicked', async () => {
        // Mock getCookie to return 'academic'
        (getCookie as jest.Mock).mockReturnValue('academic');

        const user = userEvent.setup();
        render(<SearchModeToggle />);

        // Get the dropdown items
        const dropdownItems = screen.getAllByTestId('dropdown-menu-item');

        // Find the normal mode item (the first item)
        const normalModeItem = dropdownItems.find(item => item.textContent?.includes('Normal'));

        // Click on the normal mode item
        if (normalModeItem) {
            await user.click(normalModeItem);
        }

        // Check that setCookie was called with the correct mode
        expect(setCookie).toHaveBeenCalledWith('search-mode', 'normal');
    });

    it('renders both normal and academic options in the dropdown', () => {
        // Mock getCookie to return null (no saved mode)
        (getCookie as jest.Mock).mockReturnValue(null);

        render(<SearchModeToggle />);

        // Get the dropdown items
        const dropdownItems = screen.getAllByTestId('dropdown-menu-item');

        // Check that there are two dropdown items
        expect(dropdownItems).toHaveLength(2);

        // Check that the dropdown items contain the correct text
        expect(dropdownItems[0]).toHaveTextContent('Normal');
        expect(dropdownItems[1]).toHaveTextContent('Academic');
    });

    it('renders with the correct color indicators for each mode', () => {
        // Mock getCookie to return null (no saved mode)
        (getCookie as jest.Mock).mockReturnValue(null);

        render(<SearchModeToggle />);

        // Get the dropdown items
        const dropdownItems = screen.getAllByTestId('dropdown-menu-item');

        // Check that the normal mode item has a green indicator
        expect(dropdownItems[0].querySelector('.bg-green-500')).toBeInTheDocument();

        // Check that the academic mode item has a purple indicator
        expect(dropdownItems[1].querySelector('.bg-purple-500')).toBeInTheDocument();
    });
});