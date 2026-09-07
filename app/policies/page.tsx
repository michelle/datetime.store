export const metadata = { title: "Policies & support · datetime.store" };

const supportEmail = process.env.SUPPORT_EMAIL || "support@datetime.store";

export default function PoliciesPage() {
  return (
    <main className="container policy-page">
      <h1><a href="/" style={{ color: "inherit", textDecoration: "none" }}>datetime.store</a></h1>
      <h2>Policies &amp; support</h2>

      <h3>Shipping</h3>
      <p>Each shirt is printed on demand. Standard US shipping is included in the listed price. Production and delivery estimates shown by carriers are not guarantees.</p>

      <h3>Returns and problems</h3>
      <p>Because every timestamp shirt is made uniquely for you, we cannot accept change-of-mind returns. If your item arrives damaged, defective, or incorrect, contact us within 14 days of delivery and include your order link and photos. Your statutory rights are not affected.</p>

      <h3>Privacy</h3>
      <p>We send the details needed to take payment to Stripe and the details needed to print and ship your shirt to Prodigi. We do not sell customer data. Stripe is the system of record for the order; this site does not maintain a separate customer database.</p>

      <h3>Contact</h3>
      <p>Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for order support. Do not email card details.</p>

      <p style={{ marginTop: 32 }}><a href="/">← Back to the store</a></p>
    </main>
  );
}
