import { test } from "node:test";
import assert from "node:assert/strict";
import { ORIGINAL_COPY } from "../lib/copy";

test("customer-facing storefront copy stays verbatim to the original", () => {
  assert.deepEqual(ORIGINAL_COPY, {
    brand: "datetime.store",
    pageTitle: "the datetime store",
    tagline: "we sell a t-shirt with the current datetime.",
    manualCheckout: "Or enter details manually",
    emailLabel: "Email (for receipt)",
    emailPlaceholder: "michelle@stripe.com",
    buy: "Buy now",
    processing: "Processing...",
    successTitle: "Congrats on your pretty cool shirt!",
    successBody: "You should receive an email shortly with your order confirmation number.",
    buyAnother: "Get another shirt",
  });
});
