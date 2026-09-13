"use server";

import { revalidatePath } from "next/cache";
import {
  hasExpenseErrors,
  validateExpenseInput,
  type ExpenseFieldErrors,
  type ExpenseInput,
} from "@/lib/finance";
import { getOwnerContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ExpenseActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: ExpenseFieldErrors };

const UNAUTHORIZED = "You do not have permission to manage finances.";
const GENERIC = "Could not save the expense. Please try again.";

type Client = Awaited<ReturnType<typeof createClient>>;

async function getOwnerClient(): Promise<Client | null> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user || !isOwner) return null;
  return createClient();
}

function revalidateFinance(): void {
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
}

export async function createExpense(
  input: ExpenseInput,
): Promise<ExpenseActionResult> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  const { values, errors } = validateExpenseInput(input);
  if (hasExpenseErrors(errors)) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: errors,
    };
  }

  try {
    const { data, error } = await client
      .from("expenses")
      .insert(values)
      .select("id")
      .single();

    if (error) return { ok: false, message: GENERIC };

    revalidateFinance();
    return { ok: true, id: data.id as string };
  } catch {
    return { ok: false, message: GENERIC };
  }
}

export async function deleteExpense(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const client = await getOwnerClient();
  if (!client) return { ok: false, message: UNAUTHORIZED };

  if (typeof id !== "string" || id.length === 0 || id.length > 64) {
    return { ok: false, message: GENERIC };
  }

  try {
    const { data, error } = await client
      .from("expenses")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: GENERIC };
    if (!data) return { ok: false, message: "This expense could not be found." };

    revalidateFinance();
    return { ok: true };
  } catch {
    return { ok: false, message: GENERIC };
  }
}
