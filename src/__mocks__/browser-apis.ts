import { vi } from 'vitest';

// IntersectionObserver mock with trigger capability
export interface MockIntersectionObserverInstance {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  root: Element | null;
  rootMargin: string;
  thresholds: readonly number[];
  takeRecords: () => IntersectionObserverEntry[];
  // Helper to trigger intersection callback
  triggerIntersection: (entries: Partial<IntersectionObserverEntry>[]) => void;
}

let intersectionObserverCallback: IntersectionObserverCallback | null = null;
let intersectionObserverOptions: IntersectionObserverInit | undefined;

export const createMockIntersectionObserver = () => {
  const mockObserve = vi.fn();
  const mockUnobserve = vi.fn();
  const mockDisconnect = vi.fn();

  const MockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
    intersectionObserverCallback = callback;
    intersectionObserverOptions = options;

    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
      root: options?.root || null,
      rootMargin: options?.rootMargin || '0px',
      thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0],
      takeRecords: () => [],
    };
  });

  return {
    MockIntersectionObserver,
    mockObserve,
    mockUnobserve,
    mockDisconnect,
    getCallback: () => intersectionObserverCallback,
    getOptions: () => intersectionObserverOptions,
  };
};

// Helper to trigger intersection observer callback
export function triggerIntersection(entries: Partial<IntersectionObserverEntry>[]) {
  if (intersectionObserverCallback) {
    const fullEntries = entries.map(entry => ({
      isIntersecting: false,
      intersectionRatio: 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target: document.createElement('div'),
      time: Date.now(),
      ...entry,
    }));
    intersectionObserverCallback(fullEntries as IntersectionObserverEntry[], {} as IntersectionObserver);
  }
}

// localStorage mock with error simulation capability
export interface MockLocalStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  length: number;
  key: ReturnType<typeof vi.fn>;
  // Helpers
  simulateError: () => void;
  restoreNormal: () => void;
  setStoredValue: (key: string, value: string) => void;
}

export const createMockLocalStorage = (): MockLocalStorage => {
  const store: Record<string, string> = {};
  let shouldThrow = false;

  const mock: MockLocalStorage = {
    getItem: vi.fn((key: string) => {
      if (shouldThrow) throw new Error('localStorage is not available');
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (shouldThrow) throw new Error('localStorage is not available');
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      if (shouldThrow) throw new Error('localStorage is not available');
      delete store[key];
    }),
    clear: vi.fn(() => {
      if (shouldThrow) throw new Error('localStorage is not available');
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    simulateError: () => {
      shouldThrow = true;
    },
    restoreNormal: () => {
      shouldThrow = false;
    },
    setStoredValue: (key: string, value: string) => {
      store[key] = value;
    },
  };

  return mock;
};

// Window scroll mock
export const createMockWindowScroll = () => {
  let scrollY = 0;
  const scrollListeners: EventListener[] = [];

  const mockAddEventListener = vi.fn((event: string, listener: EventListener) => {
    if (event === 'scroll') {
      scrollListeners.push(listener);
    }
  });

  const mockRemoveEventListener = vi.fn((event: string, listener: EventListener) => {
    if (event === 'scroll') {
      const index = scrollListeners.indexOf(listener);
      if (index > -1) scrollListeners.splice(index, 1);
    }
  });

  const setScrollY = (y: number) => {
    scrollY = y;
    Object.defineProperty(window, 'pageYOffset', { value: y, writable: true });
    scrollListeners.forEach(listener => listener(new Event('scroll')));
  };

  return {
    mockAddEventListener,
    mockRemoveEventListener,
    setScrollY,
    getScrollY: () => scrollY,
  };
};
