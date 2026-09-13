"use server";

import { randomUUID } from "node:crypto";
import { getOwnerContext } from "@/lib/auth";
import {
  extensionForMime,
  IMAGE_BUCKET,
  IMAGE_SIZE_ERROR,
  IMAGE_TYPE_ERROR,
  MAX_IMAGE_BYTES,
  toStoragePath,
  validateImageBytes,
} from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/server";

export type UploadImageResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

const NOT_ALLOWED = "You do not have permission to manage product images.";
const UPLOAD_FAILED = "Image upload failed. Please try again.";
const DELETE_FAILED = "Image could not be removed. Please try again.";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function uploadProductImage(
  formData: FormData,
): Promise<UploadImageResult> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user) return { ok: false, message: "Please sign in again." };
  if (!isOwner) return { ok: false, message: NOT_ALLOWED };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: IMAGE_TYPE_ERROR };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: IMAGE_SIZE_ERROR };
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return { ok: false, message: UPLOAD_FAILED };
  }

  // Content-based validation (never trust the filename or declared type).
  const validated = validateImageBytes(bytes);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }

  const productIdRaw = formData.get("productId");
  const productId =
    typeof productIdRaw === "string" && UUID_PATTERN.test(productIdRaw)
      ? productIdRaw
      : null;

  const folder = productId ? `products/${productId}` : "products/temp";
  const path = `${folder}/${randomUUID()}.${extensionForMime(validated.mime)}`;

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, bytes, {
        contentType: validated.mime,
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) return { ok: false, message: UPLOAD_FAILED };

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) return { ok: false, message: UPLOAD_FAILED };

    return { ok: true, url: data.publicUrl, path };
  } catch {
    return { ok: false, message: UPLOAD_FAILED };
  }
}

export async function deleteProductImage(
  target: string,
): Promise<{ ok: boolean; message?: string }> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user || !isOwner) {
    return { ok: false, message: NOT_ALLOWED };
  }

  const path = toStoragePath(target);
  if (!path) return { ok: false, message: DELETE_FAILED };

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) return { ok: false, message: DELETE_FAILED };
    return { ok: true };
  } catch {
    return { ok: false, message: DELETE_FAILED };
  }
}
