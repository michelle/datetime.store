# datetime.store — Vercel deployment

Production rebuild of the original datetime.store using Next.js, Stripe PaymentIntents/Elements, and Prodigi. The original visible storefront copy is preserved verbatim and protected by a regression test.

## Local development

```sh
npm ci
cp .env.example .env.local
npm run dev
```

For local Stripe webhooks:

```sh
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Run the release checks with `npm run check`.

## Environment

| Variable | Preview | Production |
| --- | --- | --- |
| `APP_ENV` | `sandbox` | `production` |
| `SITE_URL` | optional; Vercel URL is inferred | `https://datetime.store` |
| `STRIPE_SECRET_KEY` | Stripe test key | Stripe live key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test key | Stripe live key |
| `STRIPE_WEBHOOK_SECRET` | Preview/test endpoint secret | Live endpoint secret |
| `PRODIGI_API_KEY` | Sandbox key | Live key |
| `PRODIGI_API_BASE` | `https://api.sandbox.prodigi.com/v4.0` | `https://api.prodigi.com/v4.0` |

`GET /api/health` rejects missing configuration, mixed Stripe modes, and mixed Prodigi modes. Production also requires the canonical `SITE_URL`.

## Release sequence

1. Deploy a Vercel preview with Stripe test and Prodigi sandbox credentials.
2. Complete a test payment and verify exactly one Prodigi order and its transparent 4680×5790 artwork.
3. Add production-only live credentials, `APP_ENV=production`, and `SITE_URL=https://datetime.store`.
4. Create the Stripe live webhook for `/api/webhooks/stripe`, listening for `payment_intent.succeeded` and `payment_intent.payment_failed`.
5. Attach `datetime.store` to the Vercel project, update DNS, and keep Render available for rollback until a live test purchase succeeds.

Before accepting general orders, reconfirm Prodigi live SKU/size availability, live landed cost, margin, tax treatment, and physical samples.
