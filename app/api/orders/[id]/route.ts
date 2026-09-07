import { NextResponse } from "next/server";
import { getOrderStatus } from "@/lib/fulfillment";
import { stripe } from "@/lib/stripe";
import { clientSecretMatches } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orders/:paymentIntentId — payment + print status for the order page. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: { message: "Invalid order id" } }, { status: 400 });
  }
  try {
    const pi = await stripe().paymentIntents.retrieve(id);
    const suppliedSecret = new URL(req.url).searchParams.get("payment_intent_client_secret");
    if (!clientSecretMatches(pi.client_secret, suppliedSecret)) {
      return NextResponse.json({ error: { message: "Order access could not be verified" } }, { status: 403 });
    }
    const status = await getOrderStatus(id);
    return NextResponse.json(status);
  } catch (err) {
    const code = (err as { statusCode?: number }).statusCode;
    if (code === 404) return NextResponse.json({ error: { message: "Order not found" } }, { status: 404 });
    console.error(`[orders] ${id}`, err);
    return NextResponse.json({ error: { message: "Could not load order" } }, { status: 500 });
  }
}
