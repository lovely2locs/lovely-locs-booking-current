# Finish Lovely Locs Deployment

Your deploy-ready zip is:

```text
lovely-locs-booking-deploy.zip
```

## Upload To GitHub

1. Go to `https://github.com/new`
2. Repository name: `lovely-locs-booking`
3. Choose Private
4. Do not add README, .gitignore, or license
5. Create the repository
6. Open the repository
7. Choose `uploading an existing file`
8. Upload the files from `lovely-locs-booking-deploy.zip`
9. Commit the upload

## Deploy On Render

1. Go to `https://render.com`
2. Create a new Web Service
3. Connect the GitHub repo: `lovely2locs/lovely-locs-booking`
4. Use:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /healthz
```

5. Add environment variables:

```text
PUBLIC_SITE_URL=https://lovely-locs-booking.onrender.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
BOOKING_OWNER_EMAIL=lovely2locs@gmail.com
BOOKING_OWNER_PHONE=3364711098
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+18447522370
```

6. Deploy.
7. In Stripe, create a webhook endpoint:

```text
https://lovely-locs-booking.onrender.com/api/stripe/webhook
```

Subscribe it to:

```text
checkout.session.completed
```

## Twilio Website URL

Use the live Render URL, not the local preview URL.

Example:

```text
https://lovely-locs-booking.onrender.com/
```

The backend booking endpoint will be:

```text
https://lovely-locs-booking.onrender.com/api/bookings
```
