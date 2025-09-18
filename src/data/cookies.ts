export interface CookieInfo {
  name: string;
  description: string;
  expiry?: string;
  domain?: string;
  purpose: string;
}

export interface CookieCategory {
  id: 'essential' | 'analytics' | 'functional' | 'marketing';
  title: string;
  description: string;
  cookies: CookieInfo[];
}

export const cookieDatabase: CookieCategory[] = [
  {
    id: 'essential',
    title: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences.',
    cookies: [
      {
        name: 'cookieConsent',
        description: 'Stores your cookie preferences and consent choices',
        expiry: '1 year',
        purpose: 'Remember your cookie consent settings'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We only use analytics if you consent to it.',
    cookies: [
      // Currently no analytics cookies are implemented
      // Add Google Analytics cookies here when/if you implement them:
      // {
      //   name: '_ga',
      //   description: 'Google Analytics main cookie for distinguishing users',
      //   expiry: '2 years',
      //   domain: '.edrishusein.com',
      //   purpose: 'Distinguish unique users'
      // }
    ]
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
    cookies: [
      // Currently no functional cookies are implemented
      // Add theme/preference cookies here when/if you implement them:
      // {
      //   name: 'theme',
      //   description: 'Stores your preferred color theme',
      //   expiry: '1 year',
      //   purpose: 'Remember dark/light mode preference'
      // }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies', 
    description: 'These cookies are used for advertising and marketing purposes. We do not currently use any marketing or advertising cookies.',
    cookies: [
      // Currently no marketing cookies are used
      // This category exists for future use if you decide to add marketing tools
    ]
  }
];

// Function to get cookies for a specific category
export const getCookiesByCategory = (categoryId: CookieCategory['id']): CookieInfo[] => {
  const category = cookieDatabase.find(cat => cat.id === categoryId);
  return category?.cookies || [];
};

// Function to get all cookies
export const getAllCookies = (): CookieInfo[] => {
  return cookieDatabase.flatMap(category => category.cookies);
};

// Function to search cookies by name or purpose
export const searchCookies = (query: string): CookieInfo[] => {
  const searchTerm = query.toLowerCase();
  return getAllCookies().filter(cookie => 
    cookie.name.toLowerCase().includes(searchTerm) ||
    cookie.purpose.toLowerCase().includes(searchTerm) ||
    cookie.description.toLowerCase().includes(searchTerm)
  );
};

// Function to add a new cookie (for future dynamic addition)
export const addCookieToCategory = (categoryId: CookieCategory['id'], cookie: CookieInfo): void => {
  const categoryIndex = cookieDatabase.findIndex(cat => cat.id === categoryId);
  if (categoryIndex !== -1) {
    cookieDatabase[categoryIndex].cookies.push(cookie);
  }
};

// Function to detect cookies currently set in the browser
export const detectBrowserCookies = (): string[] => {
  if (typeof document === 'undefined') return [];
  
  return document.cookie
    .split(';')
    .map(cookie => cookie.trim().split('=')[0])
    .filter(name => name.length > 0);
};

// Function to match detected cookies with our database
export const getActiveCookies = (): { [key: string]: CookieInfo[] } => {
  const detectedCookies = detectBrowserCookies();
  const result: { [key: string]: CookieInfo[] } = {};
  
  cookieDatabase.forEach(category => {
    const activeCookies = category.cookies.filter(cookie => {
      // Handle wildcard cookies (like _ga_*)
      if (cookie.name.includes('*')) {
        const pattern = cookie.name.replace('*', '');
        return detectedCookies.some(detected => detected.startsWith(pattern));
      }
      return detectedCookies.includes(cookie.name);
    });
    
    if (activeCookies.length > 0) {
      result[category.id] = activeCookies;
    }
  });
  
  return result;
};