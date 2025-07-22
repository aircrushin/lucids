import { ModelSelector } from '@/components/model-selector';
import { getCookie, setCookie } from '@/lib/utils/cookies';
import { generateMockModels } from '../mocks/mock-data';
import { render, screen } from '../test-utils';

// Mock the cookies utility functions
jest.mock('@/lib/utils/cookies', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

describe('ModelSelector', () => {
    const mockModels = generateMockModels(3);

    beforeEach(() => {
        jest.clearAllMocks();
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

        render(<ModelSelector models={mockModels} />);

        // The model name should be in the document
        expect(screen.getByRole('combobox')).toHaveTextContent(selectedModel.name);
    });

    it('opens the dropdown when clicked', async () => {
        (getCookie as jest.Mock).mockReturnValue(null);

        const { user } = render(<ModelSelector models={mockModels} />);

        // Click the button to open the dropdown
        await user.click(screen.getByRole('combobox'));

        // Check that the dropdown is open
        expect(screen.getByPlaceholderText('Search models...')).toBeInTheDocument();

        // Check that all models are listed
        mockModels.forEach(model => {
            expect(screen.getByText(model.name)).toBeInTheDocument();
        });
    });

    it('selects a model when clicked', async () => {
        (getCookie as jest.Mock).mockReturnValue(null);

        const { user } = render(<ModelSelector models={mockModels} />);

        // Open the dropdown
        await user.click(screen.getByRole('combobox'));

        // Click on the first model
        await user.click(screen.getByText(mockModels[0].name));

        // Check that setCookie was called with the correct model
        expect(setCookie).toHaveBeenCalledWith('selectedModel', JSON.stringify(mockModels[0]));
    });
});