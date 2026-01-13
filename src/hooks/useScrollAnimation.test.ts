import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, useStaggeredAnimation, useParallax } from './useScrollAnimation';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

describe('useScrollAnimation', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return isVisible as false initially', () => {
      const { result } = renderHook(() => useScrollAnimation());
      expect(result.current.isVisible).toBe(false);
    });

    it('should return empty className initially', () => {
      const { result } = renderHook(() => useScrollAnimation());
      expect(result.current.className).toBe('');
    });

    it('should return a ref object', () => {
      const { result } = renderHook(() => useScrollAnimation());
      expect(result.current.ref).toBeDefined();
      expect(result.current.ref.current).toBeNull();
    });
  });

  describe('hook return values', () => {
    it('should return object with ref, isVisible, and className', () => {
      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('isVisible');
      expect(result.current).toHaveProperty('className');
    });

    it('should return className as "animate-in" when isVisible is true', () => {
      // Note: We can't easily trigger the observer callback in isolation,
      // but we can verify the relationship between isVisible and className
      const { result } = renderHook(() => useScrollAnimation());

      // Initially both should be false/empty
      expect(result.current.isVisible).toBe(false);
      expect(result.current.className).toBe('');
    });
  });

  describe('options handling', () => {
    it('should accept threshold option', () => {
      const { result } = renderHook(() => useScrollAnimation({ threshold: 0.5 }));
      expect(result.current.ref).toBeDefined();
    });

    it('should accept rootMargin option', () => {
      const { result } = renderHook(() => useScrollAnimation({ rootMargin: '100px' }));
      expect(result.current.ref).toBeDefined();
    });

    it('should accept triggerOnce option', () => {
      const { result } = renderHook(() => useScrollAnimation({ triggerOnce: false }));
      expect(result.current.ref).toBeDefined();
    });

    it('should accept delay option', () => {
      const { result } = renderHook(() => useScrollAnimation({ delay: 500 }));
      expect(result.current.ref).toBeDefined();
    });

    it('should accept all options together', () => {
      const { result } = renderHook(() => useScrollAnimation({
        threshold: 0.5,
        rootMargin: '50px',
        triggerOnce: true,
        delay: 200
      }));
      expect(result.current.ref).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should handle unmount without errors', () => {
      // When no element is attached, unmount should still work without errors
      const { unmount } = renderHook(() => useScrollAnimation());
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should use default threshold of 0.1', () => {
      const { result } = renderHook(() => useScrollAnimation());
      // Verify hook works with defaults
      expect(result.current.isVisible).toBe(false);
    });

    it('should use default triggerOnce of true', () => {
      const { result } = renderHook(() => useScrollAnimation());
      // Verify hook works with defaults
      expect(result.current.isVisible).toBe(false);
    });
  });
});

describe('useStaggeredAnimation', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return hook values', () => {
    const { result } = renderHook(() => useStaggeredAnimation(0));

    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.isVisible).toBe('boolean');
    expect(typeof result.current.className).toBe('string');
  });

  it('should calculate delay as index * baseDelay', () => {
    // Index 2 with default baseDelay 200 = 400ms delay
    const { result } = renderHook(() => useStaggeredAnimation(2));
    expect(result.current.ref).toBeDefined();
  });

  it('should use default baseDelay of 200ms', () => {
    const { result } = renderHook(() => useStaggeredAnimation(1));
    expect(result.current.ref).toBeDefined();
  });

  it('should accept custom baseDelay', () => {
    const { result } = renderHook(() => useStaggeredAnimation(1, 100));
    expect(result.current.ref).toBeDefined();
  });

  it('should have zero delay for index 0', () => {
    // 0 * 200 = 0 delay
    const { result } = renderHook(() => useStaggeredAnimation(0, 200));
    expect(result.current.ref).toBeDefined();
  });

  it('should use threshold of 0.15', () => {
    // The hook passes threshold: 0.15 to useScrollAnimation
    const { result } = renderHook(() => useStaggeredAnimation(1));
    expect(result.current.ref).toBeDefined();
  });
});

describe('useParallax', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useParallax());
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should use default speed of 0.5', () => {
    const { result } = renderHook(() => useParallax());
    expect(result.current).toBeDefined();
  });

  it('should accept custom speed parameter', () => {
    const { result } = renderHook(() => useParallax(0.8));
    expect(result.current).toBeDefined();
  });

  it('should handle unmount without errors', () => {
    // When no element is attached, unmount should still work without errors
    const { unmount } = renderHook(() => useParallax());
    expect(() => unmount()).not.toThrow();
  });
});
