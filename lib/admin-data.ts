import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

const PRODUCTS_ERROR = "Unable to load products right now. Please try again.";
const CATEGORIES_ERROR =
  "Unable to load categories right now. Please try again.";

/** All products (active and inactive). Owner RLS allows this; the storefront does not. */
export async function getOwnerProducts(): Promise<{
  products: Product[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { products: [], error: PRODUCTS_ERROR };
    return { products: (data ?? []) as Product[] };
  } catch {
    return { products: [], error: PRODUCTS_ERROR };
  }
}

export async function getOwnerProductById(
  id: string,
): Promise<{ product: Product | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return { product: null, error: PRODUCTS_ERROR };
    return { product: (data as Product | null) ?? null };
  } catch {
    return { product: null, error: PRODUCTS_ERROR };
  }
}

export async function getOwnerCategories(): Promise<{
  categories: Category[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) return { categories: [], error: CATEGORIES_ERROR };
    return { categories: (data ?? []) as Category[] };
  } catch {
    return { categories: [], error: CATEGORIES_ERROR };
  }
}

export async function getOwnerCategoryById(
  id: string,
): Promise<{ category: Category | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return { category: null, error: CATEGORIES_ERROR };
    return { category: (data as Category | null) ?? null };
  } catch {
    return { category: null, error: CATEGORIES_ERROR };
  }
}
