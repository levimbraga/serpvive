export type ComparisonNavItem = {
  slug: string;
  name: string;
};

export const COMPARISON_NAV_ITEMS: readonly ComparisonNavItem[] = [
  { slug: "semrush", name: "Semrush" },
  { slug: "surfer-seo", name: "Surfer SEO" },
  { slug: "frase", name: "Frase" },
  { slug: "animalz-revive", name: "Animalz Revive" },
] as const;
