# Tap Payments Component

## Overview

This component integrates Tap Payments (Benefit Pay) for processing event registration payments.

## Installation

The Tap Payments SDK should already be installed. If not:

```bash
npm install @tap-payments/benefit-pay-button
```

## Usage

### Basic Example

```tsx
import TapPayment from "@/components/TapPayments/TapPayment";
import { Locale, Edges } from "@tap-payments/benefit-pay-button";

function CheckoutPage() {
  const handlePaymentSuccess = async (data: any) => {
    console.log("Payment completed:", data);
    // Redirect to success page, update UI, etc.
  };

  return (
    <TapPayment
      amount="50.00"
      currency="BHD"
      eventId={123}
      customer={{
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: {
          countryCode: "+20",
          number: "1000000000",
        },
      }}
      onSuccess={handlePaymentSuccess}
      onError={(error) => console.error("Payment error:", error)}
      onCancel={() => console.log("Payment cancelled")}
    />
  );
}
```

### With Custom Metadata

```tsx
<TapPayment
  amount="100.00"
  currency="USD"
  eventId={456}
  orderId="ord_123456"
  transactionId="txn_123456"
  metadata={{
    udf1: "event_registration",
    udf2: "user_123",
    udf3: "vip_ticket",
  }}
  customer={{
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
  }}
  locale={Locale.AR} // Arabic interface
  edges={Edges.STRAIGHT}
  onSuccess={handleSuccess}
/>
```

## Props

See `TapPayment.tsx` for full TypeScript interface documentation.

### Required Props
- `amount`: Payment amount as string (e.g., "12.50")
- `currency`: Currency code (e.g., "BHD", "USD", "SAR")

### Optional Props
- `eventId`: Event ID for payment tracking
- `orderId`: Your internal order ID
- `transactionId`: Your internal transaction ID
- `customer`: Customer information object
- `metadata`: Custom metadata (udf1-udf5)
- `locale`: `Locale.EN` or `Locale.AR` (default: EN)
- `edges`: `Edges.CURVED` or `Edges.STRAIGHT` (default: CURVED)
- `debug`: Enable debug mode (default: false)
- `onReady`: Callback when button is ready
- `onClick`: Callback when button is clicked
- `onCancel`: Callback when payment is cancelled
- `onError`: Callback for errors
- `onSuccess`: Callback for successful payment
- `disabled`: Disable the payment button

## Backend Integration

**⚠️ IMPORTANT:** The backend endpoints must be implemented before this component will work fully.

See `BACKEND_API_REQUIREMENTS.md` for detailed backend API specifications.

### Current Status

- ✅ Component structure created
- ✅ API helper functions created
- ⏳ Backend endpoints need to be implemented
- ⏳ Component uses placeholder values until backend is ready

### Once Backend is Ready

1. Uncomment the API calls in `TapPayment.tsx`:
   - Line ~45: `initiateTapPayment()` call
   - Line ~95: `verifyTapPayment()` call

2. Import the API functions:
   ```tsx
   import { initiateTapPayment, verifyTapPayment } from "@/apis/apiHelpers";
   ```

3. Remove placeholder values

4. Test with Tap test credentials

## Integration Points

This component should be integrated into:

1. **Event Registration Flow** - After user fills registration form
2. **Ticket Purchase Flow** - When purchasing event tickets
3. **Checkout Page** - As part of checkout process

## Testing

### Test Mode
- Set `debug={true}` prop
- Use Tap test credentials
- Use test card numbers from Tap documentation

### Production Mode
- Set `debug={false}` prop
- Use Tap production credentials
- Ensure webhook is configured in Tap dashboard

## Support

For Tap Payments documentation:
- https://docs.tap.company/
- Contact Tap support for merchant account setup
