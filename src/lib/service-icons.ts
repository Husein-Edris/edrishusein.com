// Icon keys an editor can pick for a service card and its deliverables (ACF
// select in the theme, inc/acf-fields/service-page.php, same list). The SVGs
// live in src/components/Service/ServiceIcon.tsx.
export const SERVICE_ICON_KEYS = [
  'code',
  'layout',
  'mobile',
  'search',
  'edit',
  'key',
  'speed',
  'shield',
  'update',
  'redirect',
  'wrench',
  'chat',
] as const;

export type ServiceIconKey = (typeof SERVICE_ICON_KEYS)[number];

export const DEFAULT_SERVICE_ICON: ServiceIconKey = 'code';

/** A select value to a known icon key; anything else is the default icon. */
export function serviceIconKey(value: unknown): ServiceIconKey {
  return (SERVICE_ICON_KEYS as readonly unknown[]).includes(value) ? (value as ServiceIconKey) : DEFAULT_SERVICE_ICON;
}
