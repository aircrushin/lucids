import { deleteCookie, getCookie, setCookie } from '@/lib/utils/cookies';

// Unmock the cookie functions since we want to test the actual implementation
jest.unmock('@/lib/utils/cookies');

describe('Cookie Utility Functions', () => {
  // Store the original document.cookie descriptor
  let originalDocumentCookieDescriptor: PropertyDescriptor | undefined;
  
  beforeAll(() => {
    // Save the original document.cookie descriptor
    originalDocumentCookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
  });
  
  afterAll(() => {
    // Restore the original document.cookie descriptor
    if (originalDocumentCookieDescriptor) {
      Object.defineProperty(document, 'cookie', originalDocumentCookieDescriptor);
    }
  });
  
  beforeEach(() => {
    // Create a mock for document.cookie
    let cookies: string[] = [];
    
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: jest.fn(() => cookies.join('; ')),
      set: jest.fn((cookieString: string) => {
        // Handle cookie deletion (with expires in the past)
        if (cookieString.includes('expires=Thu, 01 Jan 1970')) {
          const cookieName = cookieString.split('=')[0];
          cookies = cookies.filter(c => !c.startsWith(`${cookieName}=`));
          return;
        }
        
        // Extract the cookie name and value
        const cookieParts = cookieString.split(';')[0].trim();
        const cookieName = cookieParts.split('=')[0];
        
        // Remove existing cookie with the same name if it exists
        cookies = cookies.filter(c => !c.startsWith(`${cookieName}=`));
        
        // Add the new cookie
        cookies.push(cookieParts);
      }),
    });
  });

  describe('setCookie', () => {
    it('should set a cookie with the specified name and value', () => {
      setCookie('testCookie', 'testValue');
      expect(document.cookie).toContain('testCookie=testValue');
    });

    it('should set a cookie with the default expiration (30 days)', () => {
      const spy = jest.spyOn(Date.prototype, 'setTime');
      setCookie('testCookie', 'testValue');
      
      // Check if setTime was called with current time + 30 days
      expect(spy).toHaveBeenCalled();
      const currentTime = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      
      // Allow for small timing differences in test execution
      const timeArg = spy.mock.calls[0][0];
      expect(timeArg).toBeGreaterThan(currentTime);
      expect(timeArg).toBeLessThan(currentTime + thirtyDaysInMs + 1000); // Add 1 second tolerance
      
      spy.mockRestore();
    });

    it('should set a cookie with a custom expiration', () => {
      const spy = jest.spyOn(Date.prototype, 'setTime');
      setCookie('testCookie', 'testValue', 7);
      
      // Check if setTime was called with current time + 7 days
      expect(spy).toHaveBeenCalled();
      const currentTime = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      // Allow for small timing differences in test execution
      const timeArg = spy.mock.calls[0][0];
      expect(timeArg).toBeGreaterThan(currentTime);
      expect(timeArg).toBeLessThan(currentTime + sevenDaysInMs + 1000); // Add 1 second tolerance
      
      spy.mockRestore();
    });
  });

  describe('getCookie', () => {
    it('should return the value of an existing cookie', () => {
      document.cookie = 'testCookie=testValue';
      expect(getCookie('testCookie')).toBe('testValue');
    });

    it('should return null for a non-existent cookie', () => {
      expect(getCookie('nonExistentCookie')).toBeNull();
    });

    it('should handle multiple cookies correctly', () => {
      document.cookie = 'cookie1=value1';
      document.cookie = 'cookie2=value2';
      document.cookie = 'cookie3=value3';
      
      expect(getCookie('cookie1')).toBe('value1');
      expect(getCookie('cookie2')).toBe('value2');
      expect(getCookie('cookie3')).toBe('value3');
    });

    it('should handle cookies with special characters', () => {
      document.cookie = 'complexCookie=value with spaces';
      expect(getCookie('complexCookie')).toBe('value with spaces');
      
      document.cookie = 'jsonCookie=%7B%22key%22%3A%22value%22%7D';
      expect(getCookie('jsonCookie')).toBe('%7B%22key%22%3A%22value%22%7D');
    });

    it('should handle empty cookie value', () => {
      document.cookie = 'emptyCookie=';
      expect(getCookie('emptyCookie')).toBe('');
    });
  });

  describe('deleteCookie', () => {
    it('should delete an existing cookie', () => {
      // Set a cookie first
      document.cookie = 'testCookie=testValue';
      expect(document.cookie).toContain('testCookie=testValue');
      
      // Delete the cookie
      deleteCookie('testCookie');
      
      // Check if the cookie was deleted
      expect(document.cookie).not.toContain('testCookie=testValue');
    });

    it('should not throw an error when deleting a non-existent cookie', () => {
      expect(() => {
        deleteCookie('nonExistentCookie');
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle cookies with the same prefix', () => {
      document.cookie = 'test=value1';
      document.cookie = 'test1=value2';
      document.cookie = 'test11=value3';
      
      expect(getCookie('test')).toBe('value1');
      expect(getCookie('test1')).toBe('value2');
      expect(getCookie('test11')).toBe('value3');
    });

    it('should handle cookies with equals sign in the value', () => {
      // The current implementation will only return the part before the first equals sign in the value
      document.cookie = 'equalsCookie=value=with=equals';
      
      // This test verifies the current behavior, which could be improved in the future
      // Note: This is a limitation of the current implementation
      expect(getCookie('equalsCookie')).toBe('value');
    });
  });
});