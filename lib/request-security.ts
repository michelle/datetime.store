/**
 * Lightweight CSRF protection for browser-initiated mutation routes. This is
 * not a rate limiter, but it prevents another website from silently creating
 * PaymentIntents or invoking the customer fulfillment endpoint.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : requestOrigin;
    return origin === configuredOrigin || (process.env.NODE_ENV !== "production" && origin === requestOrigin);
  } catch {
    return false;
  }
}

export function invalidOriginResponse(): Response {
  return Response.json({ error: { message: "Invalid request origin" } }, { status: 403 });
}

/** A PaymentIntent client secret is safe for the customer to hold and proves access to that checkout. */
export function clientSecretMatches(actual: string | null, supplied: unknown): boolean {
  return typeof supplied === "string" && supplied.length > 20 && actual === supplied;
}
