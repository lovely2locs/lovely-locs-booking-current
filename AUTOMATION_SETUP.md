# Lovely Locs Cross-Platform Update Flow

This project can be updated from Codex into the live checkout stack with `DEPLOY_LIVE_UPDATE.bat`.

## What The Automation Updates

1. Runs the local QA tests.
2. Rebuilds `lovely-locs-booking-deploy.zip`.
3. Uploads the website/backend files to GitHub.
4. Triggers a Render redeploy when a Render API key is provided.
5. Checks the live Render health endpoint.

## What Render Handles After Deploy

Render runs the live website and booking backend. The booking backend connects to:

- Stripe for deposits and Apple Pay eligibility through Stripe Checkout.
- Twilio for SMS confirmations.
- Resend for email confirmations when configured.

Those provider secrets stay in Render environment variables. They should not be committed to GitHub.

## Temporary Keys Needed

For full automation, use:

- `GITHUB_TOKEN`: GitHub token with contents read/write access for `lovely2locs/lovely-locs-booking`.
- `RENDER_API_KEY`: Render API key for triggering the deploy.

Optional environment overrides:

- `GITHUB_REPO`: defaults to `lovely2locs/lovely-locs-booking`.
- `GITHUB_BRANCH`: defaults to `main`.
- `RENDER_SERVICE_ID`: defaults to the current Lovely Locs Render service.
- `PUBLIC_SITE_URL`: defaults to `https://lovely-locs-booking.onrender.com`.

## Safe Usage

Run:

```text
DEPLOY_LIVE_UPDATE.bat
```

Paste temporary keys only into the prompt window. Do not paste keys into website code, docs, or GitHub.

After the deploy completes, revoke temporary keys you do not plan to keep.

## Checkout Confirmation Rule

The website should not send final appointment confirmations just because a client clicks submit. Final confirmation messages should be tied to verified provider events:

- Stripe: `checkout.session.completed`
- PayPal or Venmo, if added later: successful capture/payment webhook

If payment is canceled or unsuccessful, the client should be sent back to a retry page with their cart and booking details restored.
