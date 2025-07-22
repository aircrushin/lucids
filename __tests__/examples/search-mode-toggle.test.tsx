import { SearchModeToggle } from '@/components/search-mode-toggle';
import { getCookie, setCookie } from '@/lib/utils/cookies';
import { render, screen } from '../test-utils';

// Mock the cookies utility functions
jest.mock('@/lib/utils/cookies', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

describe('SearchModeToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default mode (normal) when no cookie is set', () => {
        // Mock getCookie to return null (no mode set)
        (getCookie as jest.Mock).mockReturnValue(null);

        render(<SearchModeToggle />);

        // Check that the default mode is rendered
        expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('renders with academic mode when cookie is set to academic', () => {
        // Mock getCookie to return academic mode
        (getCookie as jest.Mock).mockReturnValue('academic');

        render(<SearchModeToggle />);

        // Check that academic mode is rendered
        expect(screen.getByText('Academic')).toBeInTheDocument();
    });

    it('opens the dropdown when clicked', async () => {
        (getCookie as jest.Mock).mockReturnValue('normal');

        const { user } = render(<SearchModeToggle />);

        // Click the button to open the dropdown
        await user.click(screen.getByText('Normal'));

        // Check that both options are available
        expect(screen.getAllByText('Normal')[0]).toBeInTheDocument();
        expect(screen.getByText('Academic')).toBeInTheDocument();
    });

    it('changes mode when a different option is selected', async () => {
        (getCookie as jest.Mock).mockReturnValue('normal');

        const { user } = render(<SearchModeToggle />);

        // Open the dropdown
        await user.click(screen.getByText('Normal'));

        // Click on the academic option
        await user.click(screen.getByText('Academic'));

        // Check that setCookie was called with the correct mode
        expect(setCookie).toHaveBeenCalledWith('search-mode', 'academic');
    });
});