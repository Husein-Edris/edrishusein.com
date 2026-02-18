import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCookieConsent, CookieConsent } from './useCookieConsent';
import { createMockLocalStorage } from '../__mocks__/browser-apis';

describe('useCookieConsent', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have consent state that eventually resolves', async () => {
      const { result } = renderHook(() => useCookieConsent());

      // After useEffect runs, consent should be set to default values
      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });
    });

    it('should return hasConsent as false when no stored consent', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(false);
      });
    });

    it('should set default consent values when no stored consent', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).toEqual({
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        });
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should load consent from localStorage when available', async () => {
      const storedConsent: CookieConsent = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
        timestamp: '2024-01-15T10:00:00.000Z',
      };
      mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).toEqual(storedConsent);
        expect(result.current.hasConsent).toBe(true);
      });
    });

    it('should call localStorage.getItem on mount', async () => {
      renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cookieConsent');
      });
    });
  });

  describe('updateConsent', () => {
    it('should update consent state', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      const newConsent: CookieConsent = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      };

      act(() => {
        result.current.updateConsent(newConsent);
      });

      expect(result.current.consent?.analytics).toBe(true);
      expect(result.current.consent?.marketing).toBe(true);
      expect(result.current.consent?.functional).toBe(true);
    });

    it('should set hasConsent to true after update', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      act(() => {
        result.current.updateConsent({
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        });
      });

      expect(result.current.hasConsent).toBe(true);
    });

    it('should save consent to localStorage with timestamp', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      const newConsent: CookieConsent = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      };

      act(() => {
        result.current.updateConsent(newConsent);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cookieConsent',
        expect.stringContaining('"analytics":true')
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cookieConsent',
        expect.stringContaining('"timestamp":')
      );
    });

    it('should add timestamp to consent when updating', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      act(() => {
        result.current.updateConsent({
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        });
      });

      expect(result.current.consent?.timestamp).toBeDefined();
    });

    it('should initialize analytics when analytics consent is newly given', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      act(() => {
        result.current.updateConsent({
          essential: true,
          analytics: true,
          marketing: false,
          functional: false,
        });
      });

      // Analytics initialization is logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Analytics cookies accepted')
      );
    });
  });

  describe('clearConsent', () => {
    it('should reset consent to default values', async () => {
      const storedConsent: CookieConsent = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      };
      mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent?.analytics).toBe(true);
      });

      act(() => {
        result.current.clearConsent();
      });

      expect(result.current.consent).toEqual({
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
    });

    it('should set hasConsent to false', async () => {
      const storedConsent: CookieConsent = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      };
      mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
      });

      act(() => {
        result.current.clearConsent();
      });

      expect(result.current.hasConsent).toBe(false);
    });

    it('should remove consent from localStorage', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      act(() => {
        result.current.clearConsent();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('cookieConsent');
    });
  });

  describe('helper functions', () => {
    describe('canUseAnalytics', () => {
      it('should return true when analytics consent is given', async () => {
        const storedConsent: CookieConsent = {
          essential: true,
          analytics: true,
          marketing: false,
          functional: false,
        };
        mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseAnalytics()).toBe(true);
        });
      });

      it('should return false when analytics consent is not given', async () => {
        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseAnalytics()).toBe(false);
        });
      });
    });

    describe('canUseMarketing', () => {
      it('should return true when marketing consent is given', async () => {
        const storedConsent: CookieConsent = {
          essential: true,
          analytics: false,
          marketing: true,
          functional: false,
        };
        mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseMarketing()).toBe(true);
        });
      });

      it('should return false when marketing consent is not given', async () => {
        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseMarketing()).toBe(false);
        });
      });
    });

    describe('canUseFunctional', () => {
      it('should return true when functional consent is given', async () => {
        const storedConsent: CookieConsent = {
          essential: true,
          analytics: false,
          marketing: false,
          functional: true,
        };
        mockLocalStorage.setStoredValue('cookieConsent', JSON.stringify(storedConsent));

        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseFunctional()).toBe(true);
        });
      });

      it('should return false when functional consent is not given', async () => {
        const { result } = renderHook(() => useCookieConsent());

        await waitFor(() => {
          expect(result.current.canUseFunctional()).toBe(false);
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle localStorage read errors gracefully', async () => {
      mockLocalStorage.simulateError();

      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        // Should fall back to default consent
        expect(result.current.consent).toEqual({
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        });
        expect(result.current.hasConsent).toBe(false);
      });
    });

    it('should log error when localStorage read fails', async () => {
      mockLocalStorage.simulateError();

      renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error reading cookie consent:',
          expect.any(Error)
        );
      });
    });

    it('should handle localStorage write errors gracefully', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      mockLocalStorage.simulateError();

      act(() => {
        result.current.updateConsent({
          essential: true,
          analytics: true,
          marketing: false,
          functional: false,
        });
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error saving cookie consent:',
        expect.any(Error)
      );
    });

    it('should handle malformed JSON in localStorage', async () => {
      mockLocalStorage.setStoredValue('cookieConsent', 'not valid json');

      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        // Should fall back to default consent
        expect(result.current.consent).toEqual({
          essential: true,
          analytics: false,
          marketing: false,
          functional: false,
        });
      });
    });

    it('should handle clearConsent errors gracefully', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      mockLocalStorage.simulateError();

      act(() => {
        result.current.clearConsent();
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error clearing cookie consent:',
        expect.any(Error)
      );
    });
  });

  describe('essential consent', () => {
    it('should always have essential consent as true in defaults', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent?.essential).toBe(true);
      });
    });

    it('should preserve essential consent as true even when cleared', async () => {
      const { result } = renderHook(() => useCookieConsent());

      await waitFor(() => {
        expect(result.current.consent).not.toBeNull();
      });

      act(() => {
        result.current.clearConsent();
      });

      expect(result.current.consent?.essential).toBe(true);
    });
  });
});
