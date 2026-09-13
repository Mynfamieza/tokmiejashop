import type { Category, Product } from "@/lib/types";

/**
 * Preview-only catalog.
 *
 * These mirror the rows in `supabase/seed.sql` and are shown ONLY when the
 * Supabase environment variables are missing, so the storefront shell is
 * still visible before a database is connected. The UI labels this state
 * clearly. Once Supabase is configured, real data is used instead.
 *
 * Replace or remove this file once the Supabase project is live.
 */
export const PREVIEW_PRODUCTS: Product[] = [
  {
    id: "preview-sambal-garing-bilis-pucuk-ubi",
    name: "Sambal Garing Bilis Pucuk Ubi",
    slug: "sambal-garing-bilis-pucuk-ubi",
    description: "Sambal garing dengan bilis dan pucuk ubi.",
    price: 13,
    cost_price: 0,
    image_url: null,
    category: "sambal",
    active: true,
    featured: true,
    stock_quantity: 50,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "preview-sambal-paru-crunch",
    name: "Sambal Paru Crunch",
    slug: "sambal-paru-crunch",
    description: "Sambal paru yang rangup.",
    price: 15,
    cost_price: 0,
    image_url: null,
    category: "sambal",
    active: true,
    featured: true,
    stock_quantity: 30,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "preview-biskut-buah-pinggang",
    name: "Biskut Buah Pinggang",
    slug: "biskut-buah-pinggang",
    description: "Biskut klasik untuk minum petang.",
    price: 12,
    cost_price: 0,
    image_url: null,
    category: "cookies",
    active: true,
    featured: true,
    stock_quantity: 40,
    created_at: "2024-01-03T00:00:00.000Z",
    updated_at: "2024-01-03T00:00:00.000Z",
  },
];

export const PREVIEW_CATEGORIES: Category[] = [
  {
    id: "preview-category-sambal",
    name: "Sambal",
    slug: "sambal",
    active: true,
    sort_order: 1,
    created_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "preview-category-cookies",
    name: "Cookies",
    slug: "cookies",
    active: true,
    sort_order: 2,
    created_at: "2024-01-01T00:00:00.000Z",
  },
];
