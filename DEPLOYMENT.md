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
BOOKING_OWNER_EMAIL=timaslovelylocs@gmail.com
BOOKING_OWNER_PHONE=3364711098
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+18447522370
RESEND_API_KEY=
CONFIRMATION_FROM_EMAIL=
```

5. Deploy.
6. Use the Render URL as the website URL in Twilio.

## Twilio URL

For the booking site, use the public website URL:

```text
https://your-render-url.onrender.com/
```

The booking backend endpoint is:

```text
https://your-render-url.onrender.com/api/bookings
```

Do not use `127.0.0.1` or `localhost` in Twilio. Those only work on your computer.

## Notes

- `.env.local` stays private and is only for your computer.
- On Render, add secrets in the Render dashboard instead of uploading `.env.local`.
- If you want automatic email too, add Resend credentials. SMS uses Twilio.
