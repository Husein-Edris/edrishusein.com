import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

// Flat config replacing the removed `next lint` command (Next.js 16).
// eslint-config-next@16 ships native flat-config arrays, so we spread them
// directly instead of using FlatCompat (which throws on their circular plugin refs).
const eslintConfig = [
  {
    // `eslint .` would otherwise walk build output and legacy files.
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'server.js', 'ecosystem.config.js'],
  },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
