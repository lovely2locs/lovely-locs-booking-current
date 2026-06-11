# Lovely Locs Public Deployment

This project is ready to deploy as one Node web service. The live URL will look like:

```text
https://lovely-locs-booking.onrender.com
```

Your final URL may be different depending on the service name Render gives you.

## Deploy On Render

1. Put this folder in a GitHub repository.
2. Go to Render and create a new Web Service from that repository.
3. Use these settings:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /healthz
```

4. Add these environment variables in Render:

```text
PUBLIC_SITE_URL=https://lovely-locs-booking.onrender.com
DATA_DIR=
GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
BOOKING_OWNER_EMAIL=lvlc.support@lovelylocsnc.com
BOOKING_OWNER_PHONE=3364711098
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+18447522370
RESEND_API_KEY=
CONFIRMATION_FROM_EMAIL=Lovely Locs <lvlc.support@lovelylocsnc.com>
RESEND_DOMAIN_VERIFIED=false
```

The Google login uses the Web application Client ID only. Do not add a Google Client Secret to Render or commit it to this project. In Google Auth Platform, authorize `https://lovelylocsnc.com` and `https://www.lovelylocsnc.com` as JavaScript origins.

New Google users complete a one-time Lovely Locs profile. The app saves the profile in the existing server record store and saves a device copy for fast autofill and interrupted-booking recovery. For cross-device profiles that survive service rebuilds, attach persistent storage and set `DATA_DIR` to that mounted directory.

5. Deploy.
6. In Stripe, add a webhook endpoint for `https://lovely-locs-booking.onrender.com/api/stripe/webhook` and subscribe to `checkout.session.completed`.
7. Use the Render URL as the website URL in Twilio.

## Twilio URL

For the booking site, use the public website URL:

```text
https://your-render-url.onrender.com/
```

The booking backend endpoint is:

```text
https://your-render-url.onrender.com/api/bookings
```

The Stripe webhook endpoint is:

```text
https://your-render-url.onrender.com/api/stripe/webhook
```

Do not use `127.0.0.1` or `localhost` in Twilio. Those only work on your computer.

## Notes

- `.env.local` stays private and is only for your computer.
- On Render, add secrets in the Render dashboard instead of uploading `.env.local`.
- If you want automatic email too, add Resend credentials. SMS uses Twilio.
