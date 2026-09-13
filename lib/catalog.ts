import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { PREVIEW_CATEGORIES, PREVIEW_PRODUCTS } from "@/lib/preview-data";
import type { Category, Product } from "@/lib/types";

export type CatalogResult<T> = {
  data: T;
  /** True when Supabase is not configured and bundled preview data is shown. */
  usingPreview: boolean;
  error?: string;
};

function preview<T>(data: T): CatalogResult<T> {
  return { data, usingPreview: true };
}

function failure<T>(data: T, error: string): CatalogResult<T> {
  return { data, usingPreview: false, error };
}

export async function getActiveProducts(): Promise<CatalogResult<Product[]>> {
  if (!isSupabaseConfigured) {
    return preview(PREVIEW_PRODUCTS);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) return failure<Product[]>([], error.message);
    return { data: (data ?? []) as Product[], usingPreview: false };
  } catch (error) {
    return failure<Product[]>([], toMessage(error));
  }
}

export async function getFeaturedProducts(
  limit = 6,
): Promise<CatalogResult<Product[]>> {
  if (!isSupabaseConfigured) {
    return preview(PREVIEW_PRODUCTS.filter((product) => product.featured).slice(0, limit));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return failure<Product[]>([], error.message);
    return { data: (data ?? []) as Product[], usingPreview: false };
  } catch (error) {
    return failure<Product[]>([], toMessage(error));
  }
}

export async function getActiveCategories(): Promise<CatalogResult<Category[]>> {
  if (!isSupabaseConfigured) {
    return preview(PREVIEW_CATEGORIES);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) return failure<Category[]>([], error.message);
    return { data: (data ?? []) as Category[], usingPreview: false };
  } catch (error) {
    return failure<Category[]>([], toMessage(error));
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error while loading data from Supabase.";
}

export const getProductBySlug = cache(
  async (slug: string): Promise<CatalogResult<Product | null>> => {
    if (!isSupabaseConfigured) {
      const product =
        PREVIEW_PRODUCTS.find((item) => item.slug === slug) ?? null;
      return preview(product);
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (error) return failure<Product | null>(null, error.message);
      return { data: (data ?? null) as Product | null, usingPreview: false };
    } catch (error) {
      return failure<Product | null>(null, toMessage(error));
    }
  },
);
