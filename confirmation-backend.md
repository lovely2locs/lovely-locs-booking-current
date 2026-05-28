# Lovely Locs Confirmation Backend

The website now posts bookings to `POST /api/bookings`.

What the backend does:

- Saves every booking request to `bookings.jsonl`
- Sends client email confirmation when Resend keys are configured
- Sends client text confirmation when Twilio keys are configured
- Sends owner email/text notifications when provider keys are configured

## Setup

1. Create or open a Twilio account.
2. Buy or connect an SMS-enabled Twilio phone number.
3. Copy these values from Twilio into `.env.local`:

```text
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

Use E.164 format for the Twilio number, for example `+13364711098`.

4. Optional: add Resend email credentials if you also want automatic emails.
5. Start the site with `OPEN_WEBSITE.bat` or run:

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" local-server.js
```

4. Open `http://127.0.0.1:4175/`.

If the provider keys are not set, bookings are still saved locally, and the site shows fallback email/text buttons.

## Where to find the Twilio keys

- Account SID: Twilio Console dashboard
- Auth Token: Twilio Console dashboard
- From Number: the SMS-capable Twilio phone number you bought or ported

Keep `.env.local` private. It is ignored by Git because it contains secrets.
