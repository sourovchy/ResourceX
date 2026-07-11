/**
 * Client-side image compression to WebP.
 *
 * Converting uploads to WebP in the browser (via canvas) before they hit the
 * API gives us materially smaller payloads — typically 25–40% smaller than the
 * equivalent JPEG and far smaller than PNG — with no server-side dependency
 * (the backend already accepts `image/webp`). Smaller stored images mean faster
 * downloads, better LCP on item/avatar grids, and less mobile data.
 *
 * Oversized photos are also downscaled to `maxDimension` (longest edge), since a
 * 12MP phone photo never needs to be displayed above ~1600px in this UI.
 */

export type CompressOptions = {
  /** Longest-edge cap in pixels. Larger images are scaled down preserving aspect ratio. */
  maxDimension?: number;
  /** WebP quality, 0–1. */
  quality?: number;
};

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1600,
  quality: 0.82,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Returns a new WebP `File` for the given image. On any failure (unsupported
 * environment, decode error, larger result) it safely returns the original file
 * so uploads never break.
 */
export async function compressToWebp(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const { maxDimension, quality } = { ...DEFAULTS, ...options };

  // Only raster images are convertible; skip anything else (e.g. already-tiny SVG).
  if (typeof document === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  try {
    const img = await loadImage(file);

    const scale = Math.min(
      1,
      maxDimension / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );

    // Bail out if the browser couldn't encode WebP or the result isn't smaller.
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
