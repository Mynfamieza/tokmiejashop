"use server";

import { revalidatePath } from "next/cache";
import {
  hasCategoryErrors,
  slugify,
  validateCategoryInput,
  type CategoryErrors,
  type CategoryInput,
} from "@/lib/admin-validation";
import { getOwnerContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CategoryActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: CategoryErrors };

const UNAUTHORIZED = "You do not have permission to manage categories.";
const GENERIC = "Could not save the category. Please try again.";

type Client = Awaited<ReturnType<typeof createClient>>;

async function getOwnerClient(): Promise<Client | null> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user || !isOwner) return null;
  return createClient();
}

async function uniqueSlug(
  client: Client,
  base: string,
): Promise<string> {
  let candidate = base;
  for (let index = 2; index < 50; index += 1) {
    const { data, error } = await client
      .from("categories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${index}`;
  }
  return `${base}-${Date.now()}`;
}

function revalidateCatalog(): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  const { values, errors } = validateCategoryInput(input);
  if (hasCategoryErrors(errors)) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: errors,
    };
  }

  try {
    const slug = await uniqueSlug(client, slugify(values.name));
    const { data, error } = await client
      .from("categories")
      .insert({ ...values, slug })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "A category with a similar name already exists.",
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

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<CategoryActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  if (typeof id !== "string" || id.length === 0 || id.length > 64) {
    return { ok: false, message: "This category could not be found." };
  }

  const { values, errors } = validateCategoryInput(input);
  if (hasCategoryErrors(errors)) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: errors,
    };
  }

  try {
    // The slug is preserved on edit so product/category links keep working.
    const { data: existing, error: readError } = await client
      .from("categories")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (readError) return { ok: false, message: GENERIC };
    if (!existing) {
      return { ok: false, message: "This category could not be found." };
    }

    const { error } = await client
      .from("categories")
      .update(values)
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "A category with a similar name already exists.",
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

export async function setCategoryActive(
  id: string,
  active: boolean,
): Promise<CategoryActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  if (typeof id !== "string" || id.length === 0 || typeof active !== "boolean") {
    return { ok: false, message: GENERIC };
  }

  try {
    const { data, error } = await client
      .from("categories")
      .update({ active })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: GENERIC };
    if (!data) {
      return { ok: false, message: "This category could not be found." };
    }

    revalidateCatalog();
    return { ok: true, id };
  } catch {
    return { ok: false, message: GENERIC };
  }
}
