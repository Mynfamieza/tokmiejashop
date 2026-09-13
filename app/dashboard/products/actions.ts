"use server";

import { revalidatePath } from "next/cache";
import {
  hasProductErrors,
  slugify,
  validateProductInput,
  type ProductErrors,
  type ProductInput,
} from "@/lib/admin-validation";
import { getOwnerContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: ProductErrors };

const UNAUTHORIZED = "You do not have permission to manage products.";
const GENERIC = "Could not save the product. Please try again.";

type Client = Awaited<ReturnType<typeof createClient>>;

async function getOwnerClient(): Promise<Client | null> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user || !isOwner) return null;
  return createClient();
}

async function uniqueSlug(
  client: Client,
  table: string,
  base: string,
): Promise<string> {
  let candidate = base;
  for (let index = 2; index < 50; index += 1) {
    const { data, error } = await client
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${index}`;
  }
  return `${base}-${Date.now()}`;
}

async function categoryExists(
  client: Client,
  slug: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

function revalidateCatalog(): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
}

export async function createProduct(
  input: ProductInput,
): Promise<ProductActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  const { values, errors } = validateProductInput(input);
  if (hasProductErrors(errors)) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: errors,
    };
  }

  try {
    if (!(await categoryExists(client, values.category))) {
      return {
        ok: false,
        message: "Please choose a valid category.",
        fieldErrors: { category: "Unknown category." },
      };
    }

    const slug = await uniqueSlug(client, "products", slugify(values.name));
    const { data, error } = await client
      .from("products")
      .insert({ ...values, slug })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "A product with a similar name already exists.",
          fieldErrors: { name: "This name is already in use." },
        };
      }
      return { ok: false, message: GENERIC };
    }

    revalidateCatalog();
    return { ok: true, id: data.id as string };
  } catch {
    return { ok: false, message: GENERIC };
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  if (typeof id !== "string" || id.length === 0 || id.length > 64) {
    return { ok: false, message: "This product could not be found." };
  }

  const { values, errors } = validateProductInput(input);
  if (hasProductErrors(errors)) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: errors,
    };
  }

  try {
    if (!(await categoryExists(client, values.category))) {
      return {
        ok: false,
        message: "Please choose a valid category.",
        fieldErrors: { category: "Unknown category." },
      };
    }

    // The slug is preserved on edit so existing product URLs keep working.
    const { data: existing, error: readError } = await client
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (readError) return { ok: false, message: GENERIC };
    if (!existing) {
      return { ok: false, message: "This product could not be found." };
    }

    const { error } = await client
      .from("products")
      .update(values)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "A product with a similar name already exists.",
          fieldErrors: { name: "This name is already in use." },
        };
      }
      return { ok: false, message: GENERIC };
    }

    revalidateCatalog();
    return { ok: true, id };
  } catch {
    return { ok: false, message: GENERIC };
  }
}

export async function setProductActive(
  id: string,
  active: boolean,
): Promise<ProductActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  if (typeof id !== "string" || id.length === 0 || typeof active !== "boolean") {
    return { ok: false, message: GENERIC };
  }

  try {
    const { data, error } = await client
      .from("products")
      .update({ active })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: GENERIC };
    if (!data) return { ok: false, message: "This product could not be found." };

    revalidateCatalog();
    return { ok: true, id };
  } catch {
    return { ok: false, message: GENERIC };
  }
}
