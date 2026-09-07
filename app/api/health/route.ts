import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "APP_ENV",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "PRODIGI_API_KEY",
    "PRODIGI_API_BASE",
    "SITE_URL",
    "SUPPORT_EMAIL",
  ] as const;
  const missing = required.filter((key) => !process.env[key]);
  const validAppEnv = process.env.APP_ENV === "sandbox" || process.env.APP_ENV === "production";
  const live = process.env.APP_ENV === "production";
  const stripeModeMatches = live
    ? process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_")
    : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_");
  const expectedProdigiBase = live ? "https://api.prodigi.com/v4.0" : "https://api.sandbox.prodigi.com/v4.0";
  const prodigiModeMatches = process.env.PRODIGI_API_BASE === expectedProdigiBase;
  const healthy = missing.length === 0 && validAppEnv && stripeModeMatches && prodigiModeMatches;

  return NextResponse.json(
    {
      ok: healthy,
      mode: live ? "production" : "sandbox",
      checks: {
        configuration: missing.length === 0,
        appMode: validAppEnv,
        stripeMode: Boolean(stripeModeMatches),
        prodigiMode: prodigiModeMatches,
      },
      ...(missing.length ? { missing } : {}),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
