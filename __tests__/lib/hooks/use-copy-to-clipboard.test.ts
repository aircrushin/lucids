import { act, renderHookWithProviders } from '@/__tests__/hook-utils';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Save original clipboard
const originalClipboard = global.navigator.clipboard;

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    // Setup mock clipboard
    Object.defineProperty(global.navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });
    
    // Reset mock before each test
    jest.clearAllMocks();
    
    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original clipboard
    Object.defineProperty(global.navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
    
    // Restore real timers
    jest.useRealTimers();
  });

  it('should initialize with isCopied set to false', () => {
    const { result } = renderHookWithProviders(() => useCopyToClipboard({ timeout: 2000 }));
    
    expect(result.current.isCopied).toBe(false);
  });

  it('should copy text to clipboard and set isCopied to true', async () => {
    const { result } = renderHookWithProviders(() => useCopyToClipboard({ timeout: 2000 }));
    
    await act(async () => {
      result.current.copyToClipboard('Test text');
    });
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text');
    expect(result.current.isCopied).toBe(true);
  });

  it('should reset isCopied to false after timeout', async () => {
    const { result } = renderHookWithProviders(() => useCopyToClipboard({ timeout: 2000 }));
    
    await act(async () => {
      result.current.copyToClipboard('Test text');
    });
    
    expect(result.current.isCopied).toBe(true);
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(result.current.isCopied).toBe(false);
  });

  it('should not copy empty text', async () => {
    const { result } = renderHookWithProviders(() => useCopyToClipboard({ timeout: 2000 }));
    
    await act(async () => {
      result.current.copyToClipboard('');
    });
    
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
    expect(result.current.isCopied).toBe(false);
  });

  it('should use default timeout if not provided', async () => {
    const { result } = renderHookWithProviders(() => useCopyToClipboard({}));
    
    await act(async () => {
      result.current.copyToClipboard('Test text');
    });
    
    expect(result.current.isCopied).toBe(true);
    
    // Fast-forward time by default timeout (2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(result.current.isCopied).toBe(false);
  });

  it('should handle clipboard API not being available', async () => {
    // Remove clipboard API
    Object.defineProperty(global.navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });
    
    const { result } = renderHookWithProviders(() => useCopyToClipboard({ timeout: 2000 }));
    
    await act(async () => {
      result.current.copyToClipboard('Test text');
    });
    
    expect(result.current.isCopied).toBe(false);
  });
});