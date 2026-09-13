/**
 * Product image upload rules + content sniffing.
 * Used by both the client (for UX) and the server (as the trusted check).
 */

export const IMAGE_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

export const IMAGE_TYPE_ERROR = "Please upload a JPG, PNG, or WebP image.";
export const IMAGE_SIZE_ERROR = "Image must be 5 MB or smaller.";

export function isAllowedImageMime(value: unknown): value is AllowedImageMime {
  return (
    typeof value === "string" &&
    (ALLOWED_IMAGE_MIME as readonly string[]).includes(value)
  );
}

export function extensionForMime(mime: AllowedImageMime): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Detect a real image type from the file's leading bytes.
 * This does not rely on the filename or the browser-declared MIME type.
 */
export function detectImageMime(bytes: Uint8Array): AllowedImageMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/** Client-friendly metadata check (safe to call with browser File values). */
export function validateImageMeta(mime: string, size: number): string | null {
  if (size <= 0) return IMAGE_TYPE_ERROR;
  if (size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  if (!isAllowedImageMime(mime)) return IMAGE_TYPE_ERROR;
  return null;
}

/** Trusted server-side check based on file contents. */
export function validateImageBytes(
  bytes: Uint8Array,
): { ok: true; mime: AllowedImageMime } | { ok: false; message: string } {
  const mime = detectImageMime(bytes);
  if (!mime) return { ok: false, message: IMAGE_TYPE_ERROR };
  return { ok: true, mime };
}

/** Convert a stored public URL (or raw path) into a safe storage object path. */
export function toStoragePath(target: string): string | null {
  if (typeof target !== "string" || target.length === 0) return null;

  let path = target;
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const markerIndex = target.indexOf(marker);
  if (markerIndex !== -1) {
    path = target.slice(markerIndex + marker.length);
  }

  path = path.split("?")[0].split("#")[0];

  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }

  if (path.startsWith("/") || path.includes("..")) return null;
  if (!path.startsWith("products/")) return null;

  return path;
}
