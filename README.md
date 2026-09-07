# datetime.store

> we sell a t-shirt with the current datetime.

This production rebuild preserves the original single-product shop and replaces its obsolete React 15, Stripe Tokens, and Scalable Press stack with Next.js, Stripe PaymentIntents/Elements, and Prodigi.

The shirt clock freezes when the customer commits to buy. Stripe is the order system of record; after a successful payment, both the signed Stripe webhook and the customer return flow can idempotently create the Prodigi order. The resulting Prodigi order ID is written back to Stripe metadata. No separate customer database is used.

Print artwork is generated deterministically at `/api/artwork/<timestamp>.png`: a transparent 300 DPI canvas with a raw 13-digit epoch timestamp in bundled Chivo. Both garment SKUs, the paid checkout, idempotent fulfillment race, and Prodigi sandbox asset ingestion were proven by the original benchmark run.

## Product

| Style | Prodigi SKU | Garment |
| --- | --- | --- |
| Fitted | `GLOBAL-TEE-BC-6004` | Bella + Canvas 6004 women's favourite tee |
| Unisex | `GLOBAL-TEE-BC-3001` | Bella + Canvas 3001 unisex classic tee |

Black, sizes S–XL, US addresses only. The storefront currently charges US$22.50 with standard shipping included. Reconfirm live availability, landed cost, and margin before switching to production.

## Local setup

```sh
npm ci
cp .env.example .env.local
npm run dev
```

For local Stripe webhooks:

```sh
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use Stripe test card `4242 4242 4242 4242`, any future expiry/CVC, and a US shipping address. Prodigi sandbox orders are not printed or charged.

Run the complete release check with:

```sh
npm run check
```

## Configuration

| Variable | Required | Value |
| --- | --- | --- |
| `APP_ENV` | yes | `sandbox` until cutover, then `production` |
| `SITE_URL` | yes | Canonical origin, `https://datetime.store` on Render |
| `STRIPE_SECRET_KEY` | yes | Matching Stripe test/live secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | Matching Stripe test/live publishable key; triggers a rebuild when changed |
| `STRIPE_WEBHOOK_SECRET` | yes | Signing secret for `/api/webhooks/stripe` in the same Stripe mode |
| `PRODIGI_API_KEY` | yes | Matching Prodigi sandbox/live API key |
| `PRODIGI_API_BASE` | yes | Sandbox: `https://api.sandbox.prodigi.com/v4.0`; live: `https://api.prodigi.com/v4.0` |
| `SUPPORT_EMAIL` | yes | Monitored customer support mailbox |

`GET /api/health` returns 503 when required configuration is missing. With `APP_ENV=production`, it also refuses test Stripe keys or the Prodigi sandbox URL.

## Render release runbook

The checked-in `render.yaml` documents the build, start, health check, and non-secret settings. For the existing Render web service:

1. Disable auto-deploy during migration and confirm the service still points to `michelle/datetime.store`, branch `master`.
2. Set build command `npm ci && npm run build`, start command `npm start`, and health check path `/api/health`.
3. Set all variables above with `APP_ENV=sandbox` and sandbox credentials. Do not remove the old service variables until rollback is no longer needed.
4. Deploy the migration branch manually and test the Render preview/service URL end to end. Confirm one successful Stripe test PaymentIntent maps to exactly one Prodigi sandbox order, the downloaded artwork is readable, transparent, and 4680×5790, and the order-status link works.
5. In Stripe live mode, create a webhook for `https://datetime.store/api/webhooks/stripe` subscribing to `payment_intent.succeeded` and `payment_intent.payment_failed`; put its live `whsec_…` value in Render.
6. Reconfirm live Prodigi catalogue/quote results for every offered SKU and size, order physical fitted and unisex samples, choose a viable retail price, and decide how US sales tax will be collected.
7. Set live Stripe keys, the live Prodigi key/base URL, `APP_ENV=production`, and a working support mailbox. Register `datetime.store` for Apple Pay in Stripe.
8. Deploy, verify `/api/health`, make one real low-risk purchase, confirm Stripe → one Prodigi live order → correct asset, then re-enable auto-deploy after GitHub CI passes.

Rollback is a Render redeploy of the prior successful commit. Pause/cancel any new live Prodigi order separately; rolling back application code does not cancel fulfillment already submitted.

## Operational limits

- Stripe sends payment receipts; there is no custom shipping/tracking email. Customers must keep their private order-status link, and support must monitor Stripe/Prodigi.
- There is no persistent retry queue or admin dashboard. Stripe retries transient webhook failures, and re-opening the status link retries idempotently.
- Tax is not currently calculated. This must be resolved before taking general live orders.
- Prodigi sandbox proof is not a substitute for live SKU validation and physical samples.
