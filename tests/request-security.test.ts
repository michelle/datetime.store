import { test } from "node:test";
import assert from "node:assert/strict";
import { clientSecretMatches, isSameOrigin } from "../lib/request-security";

test("same-origin mutations honor the configured production origin", () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = "https://datetime.store";
  try {
    assert.equal(isSameOrigin(new Request("https://internal-render-host/api/checkout", { headers: { origin: "https://datetime.store" } })), true);
    assert.equal(isSameOrigin(new Request("https://internal-render-host/api/checkout", { headers: { origin: "https://evil.example" } })), false);
    assert.equal(isSameOrigin(new Request("https://internal-render-host/api/checkout")), false);
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("customer order access requires the exact PaymentIntent client secret", () => {
  const secret = "pi_123_secret_abcdefghijklmnopqrstuvwxyz";
  assert.equal(clientSecretMatches(secret, secret), true);
  assert.equal(clientSecretMatches(secret, "pi_123_secret_wrong_value_12345"), false);
  assert.equal(clientSecretMatches(secret, null), false);
});
