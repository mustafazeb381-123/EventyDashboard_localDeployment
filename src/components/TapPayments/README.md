# Tap Payments – Web Card SDK v2

This component uses **Tap Web Card SDK v2** for card payments (no Benefit Pay button). It loads the script from Tap’s CDN and renders the card form; the user clicks **Pay** to tokenize the card and receive a token in `onSuccess`.

- Docs: [Web Card SDK v2](https://developers.tap.company/docs/card-sdk-web-v2)
- Script: `https://tap-sdks.b-cdn.net/card/1.0.2/index.js`

## Usage

```tsx
import TapPayment from "@/components/TapPayments/TapPayment";

function CheckoutPage() {
  const handlePaymentSuccess = async (data) => {
    // data.id is the Tap token (tok_xxx) – send to your backend to create charge
    await fetch("/api/charges", {
      method: "POST",
      body: JSON.stringify({ source: { id: data.id } }),
    });
  };

  return (
    <TapPayment
      amount="50.00"
      currency="SAR"
      eventId={123}
      customer={{
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: { countryCode: "20", number: "1000000000" },
      }}
      onSuccess={handlePaymentSuccess}
      onError={(error) => console.error("Payment error:", error)}
    />
  );
}
```

## Props

- **amount** (string) – Amount to charge (e.g. `"12.50"`).
- **currency** (string) – Currency code (e.g. `"SAR"`, `"BHD"`, `"USD"`).
- **eventId** (optional) – Used to fetch payment config (publicKey, merchantId) from your backend.
- **orderId**, **transactionId** (optional) – Your internal IDs; use in backend when creating the charge.
- **customer** (optional) – Prefill name, email, phone in the card form.
- **locale** – `"en"` | `"ar"` (default: `"en"`).
- **edges** – `"curved"` | `"straight"` (default: `"curved"`).
- **onReady** – Fired when the card SDK is ready.
- **onError** – Fired on SDK or payment errors.
- **onSuccess** – Fired with token payload; **`data.id`** is the Tap token to send to your backend as `source.id` in the create charge API.

## Backend

1. **Get config** – When `eventId` is set, the component expects payment config (e.g. `publicKey`, `merchantId`). Replace the placeholder in `TapPayment.tsx` with your `initiateTapPayment` (or similar) call.
2. **Create charge** – In `onSuccess`, send `data.id` (token) to your backend; backend calls Tap’s create charge API with `source.id: data.id`. If 3DS is required, redirect the user to the URL returned by Tap.
3. **Webhooks** – Handle Tap webhooks on your server as per [Tap docs](https://developers.tap.company/docs/card-sdk-web-v2).

See `BACKEND_API_REQUIREMENTS.md` for more detail.

## Testing

- Use Tap test keys (`pk_test_...`).
- Use test card numbers from Tap documentation.

## Live mode

For production, use the API key for your registered domain and ensure your domain is registered with Tap ([docs](https://developers.tap.company/docs/card-sdk-web-v2)).
