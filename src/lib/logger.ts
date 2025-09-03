const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  warn: (...args: any[]) => isDev && console.warn(...args),
  error: (...args: any[]) => isDev && console.error(...args),
  group: (label: string) => isDev && console.group(label),
  groupEnd: () => isDev && console.groupEnd(),
};