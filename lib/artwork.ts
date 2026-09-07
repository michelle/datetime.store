/**
 * The artwork is a PNG generated deterministically from the purchase timestamp,
 * so the preview, the Stripe metadata and the file Prodigi prints are all
 * derived from one number.
 *
 * Print spec mirrors the original store's Scalable Press design:
 *   text 8in wide, centered horizontally, 3in from the top of the print area.
 * The Prodigi print area for both tees is 15.6in x 19.3in; we render a
 * transparent canvas of exactly that aspect ratio and ask Prodigi to
 * `fitPrintArea`, so the placement is preserved.
 */

export const PRINT_AREA_IN = { width: 15.6, height: 19.3 } as const;
/** Prodigi recommends 300 DPI for raster print assets. */
export const ARTWORK_DPI = 300;
export const TEXT_WIDTH_IN = 8;
export const TEXT_TOP_IN = 3;

export const ARTWORK_PX = {
  width: Math.round(PRINT_AREA_IN.width * ARTWORK_DPI),
  height: Math.round(PRINT_AREA_IN.height * ARTWORK_DPI),
  textWidth: Math.round(TEXT_WIDTH_IN * ARTWORK_DPI),
  textTop: Math.round(TEXT_TOP_IN * ARTWORK_DPI),
} as const;

/** Earliest timestamp we accept (2017-01-01, when datetime.store launched). */
const MIN_TIMESTAMP = 1483228800000;
/** Tolerate a little client clock skew into the future. */
const FUTURE_SKEW_MS = 5 * 60 * 1000;

export function isValidTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_TIMESTAMP &&
    value <= Date.now() + FUTURE_SKEW_MS
  );
}

/** Parse a timestamp from a URL segment like "1757100000000" or "1757100000000.png". */
export function parseTimestampParam(param: string): number | null {
  const m = /^(\d{13})(?:\.png)?$/.exec(param);
  if (!m) return null;
  const ts = Number(m[1]);
  return isValidTimestamp(ts) ? ts : null;
}

/** Public origin for URLs that third parties (Prodigi) must be able to fetch. */
export function siteOrigin(): string {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const render = process.env.RENDER_EXTERNAL_URL;
  if (render) return render.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function artworkUrl(timestamp: number): string {
  return `${siteOrigin()}/api/artwork/${timestamp}.png`;
}

export function formatTimestampHuman(timestamp: number): string {
  return new Date(timestamp).toISOString().replace("T", " ").replace("Z", " UTC");
}
