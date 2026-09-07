import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { parseCheckoutInput, ValidationError } from "@/lib/checkout";
import { artworkUrl, formatTimestampHuman } from "@/lib/artwork";
import { CURRENCY, PRICE_CENTS, PRODIGI_SKUS, STYLE_LABELS } from "@/lib/products";
import { META } from "@/lib/fulfillment";
import { invalidOriginResponse, isSameOrigin } from "@/lib/request-security";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 * Creates a PaymentIntent for one shirt. The client then confirms it with the
 * Payment Element / Express Checkout Element. Everything needed to fulfil the
 * order is stored on the PaymentIntent: product metadata here, and Stripe's
 * native shipping field from the Address Element during confirmation.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return invalidOriginResponse();

  let input;
  try {
    input = parseCheckoutInput(await req.json().catch(() => null));
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: { message: err.message, field: err.field } }, { status: 400 });
    }
    throw err;
  }

  const { style, size, timestamp, email } = input;

  try {
    const intent = await stripe().paymentIntents.create(
      {
        amount: PRICE_CENTS,
        currency: CURRENCY,
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        description: `datetime.store — ${STYLE_LABELS[style]} ${size} shirt printed with ${timestamp} (${formatTimestampHuman(timestamp)})`,
        statement_descriptor_suffix: "DATETIME",
        metadata: {
          [META.style]: style,
          [META.size]: size,
          [META.timestamp]: String(timestamp),
          [META.artworkUrl]: artworkUrl(timestamp),
          prodigi_sku: PRODIGI_SKUS[style],
        },
      },
      {
        idempotencyKey: `checkout_${createHash("sha256")
          .update(JSON.stringify({ timestamp, style, size, email }))
          .digest("hex")}`,
      },
    );

    return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id, amount: intent.amount, currency: intent.currency });
  } catch (err) {
    console.error("[checkout] failed to create PaymentIntent", err);
    const message = err instanceof Error ? err.message : "Could not start checkout";
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
