import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { FulfillmentError, fulfillPaymentIntent } from "@/lib/fulfillment";
import { clientSecretMatches, invalidOriginResponse, isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/orders/finalize { paymentIntentId }
 * Called by the browser right after Stripe confirms the payment so the customer
 * sees their Prodigi order id immediately. The Stripe webhook does the same
 * thing server-to-server; both paths are idempotent.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return invalidOriginResponse();
  const body = (await req.json().catch(() => null)) as { paymentIntentId?: unknown; clientSecret?: unknown } | null;
  const id = body?.paymentIntentId;
  if (typeof id !== "string" || !/^pi_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: { message: "paymentIntentId is required" } }, { status: 400 });
  }

  try {
    const pi = await stripe().paymentIntents.retrieve(id);
    if (!clientSecretMatches(pi.client_secret, body?.clientSecret)) {
      return NextResponse.json({ error: { message: "Order access could not be verified" } }, { status: 403 });
    }
    const result = await fulfillPaymentIntent(pi);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof FulfillmentError) {
      console.error(`[finalize] ${id}: ${err.code} ${err.message}`);
      return NextResponse.json({ error: { message: err.message, code: err.code } }, { status: err.status });
    }
    console.error(`[finalize] ${id}: unexpected`, err);
    return NextResponse.json({ error: { message: "Something went wrong placing your order" } }, { status: 500 });
  }
}
