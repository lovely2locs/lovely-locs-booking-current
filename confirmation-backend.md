# Lovely Locs Confirmation Backend

The website now posts bookings to `POST /api/bookings`.

What the backend does:

- Prices the cart from the trusted server catalog
- Saves every pending booking request to `bookings.jsonl`
- Creates a Stripe Checkout Session for the non-refundable deposit
- Receives Stripe payment events at `POST /api/stripe/webhook`
- Sends client/owner notifications after Stripe reports `checkout.session.completed`

## Setup

1. Create or open a Stripe account.
2. Copy your Stripe secret key into `.env.local`:

```text
STRIPE_SECRET_KEY=
PUBLIC_SITE_URL=http://127.0.0.1:4175
```

3. For production, create a Stripe webhook endpoint for:

```text
https://lovely-locs-booking.onrender.com/api/stripe/webhook
```

Subscribe it to `checkout.session.completed`, then add the signing secret as:

```text
STRIPE_WEBHOOK_SECRET=
```

4. Create or open a Twilio account.
5. Buy or connect an SMS-enabled Twilio phone number.
6. Copy these values from Twilio into `.env.local`:

```text
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

Use E.164 format for the Twilio number, for example `+13364711098`.

7. Optional: add Resend email credentials if you also want automatic emails.
8. Start the site with `OPEN_WEBSITE.bat` or run:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-server.js
```

9. Open `http://127.0.0.1:4175/`.

If Stripe keys are not set, the site cannot accept deposits. If Resend/Twilio keys are not set, paid bookings are still logged, but automatic owner/client notifications are skipped.

## Where to find the Twilio keys

- Account SID: Twilio Console dashboard
- Auth Token: Twilio Console dashboard
- From Number: the SMS-capable Twilio phone number you bought or ported

Keep `.env.local` private. It is ignored by Git because it contains secrets.
