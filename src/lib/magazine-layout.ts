// Notebook magazine grid (design B5): card size follows recency on a 6-column grid.
// Newest is xl (4 columns, 2 rows), the next two m (2 columns, stacked beside it),
// then a row of three s (2 columns each), then w (3 columns, two per row).
// Incomplete rows are widened so the grid never leaves a hole.

export type MagazineSize = 'xl' | 'm' | 's' | 'w' | 'full';

const MEDIUM_COUNT = 2;
const SMALL_COUNT = 3;

/** Size per card for `count` posts sorted newest first. */
export function magazineSizes(count: number): MagazineSize[] {
  if (count <= 0) return [];
  if (count === 1) return ['full'];

  const mediums = Math.min(MEDIUM_COUNT, count - 1);
  const afterMediums = count - 1 - mediums;
  const smalls = afterMediums >= SMALL_COUNT ? SMALL_COUNT : 0;
  const wides = afterMediums - smalls;

  const wideSizes: MagazineSize[] = Array.from({ length: wides }, (_, index) =>
    wides % 2 === 1 && index === wides - 1 ? 'full' : 'w',
  );

  return [
    'xl',
    ...Array.from({ length: mediums }, (): MagazineSize => 'm'),
    ...Array.from({ length: smalls }, (): MagazineSize => 's'),
    ...wideSizes,
  ];
}

/** Large cards show the excerpt; small ones keep to date, title and badges. */
export function showsExcerpt(size: MagazineSize): boolean {
  return size === 'xl' || size === 'w' || size === 'full';
}
