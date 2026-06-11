# Lovely Locs Automated Messages

The backend now supports these automated sends through the existing Resend/Twilio providers and the `bookings.jsonl` booking store:

- Appointment confirmations after a deposit is confirmed
- Deposit reminders for unpaid booking requests
- 3-day and 1-day appointment reminders
- Follow-up review requests the day after an appointment
- Monthly referral campaign emails for clients who opted in
- Annual birthday credits for clients who opted in and added a birthday. The credit email starts 2 weeks before the saved birthday and the credit expires 1 month after the birthday.
- Referral reminders for clients who opted in
- Referral reward tracking with pending status until the referred client's deposit is accepted

## Required env vars

Set these in Render:

- `AUTOMATION_RUN_TOKEN`: a private token used by the scheduler.
- `RESEND_API_KEY` and `CONFIRMATION_FROM_EMAIL`: required for email sends.
- Use `CONFIRMATION_FROM_EMAIL=Lovely Locs <lvlc.support@lovelylocsnc.com>` after `lovelylocsnc.com` is verified in Resend.
- Set `RESEND_DOMAIN_VERIFIED=true` only after the Resend Domains dashboard shows `verified`.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`: required for SMS sends.
- `TWILIO_TOLLFREE_VERIFIED`: set to `true` only after a U.S. toll-free Twilio sender is fully verified. Leave it false to prevent paid undelivered messages from an unverified toll-free number.
- `REVIEW_REQUEST_URL`: optional review link for follow-up messages.
- `REFERRAL_CREDIT_AMOUNT`: referral reward amount, default `$15`.
- `BIRTHDAY_CREDIT_AMOUNT`: annual birthday credit amount, default `$15`.
- `REFERRAL_CAMPAIGN_SUBJECT` and `REFERRAL_CAMPAIGN_MESSAGE`: optional monthly referral campaign copy.

## Discount Rules

- Sale promo codes can be reused by the same email and phone on more than one separate booking before the sale deadline.
- A sale promo code only applies once per booking.
- Earned referral credits and birthday credits are tracked separately from sale promo codes.
- The server applies one best discount per booking instead of stacking multiple discounts.
- Birthday credits are annual, start 2 weeks before the saved birthday, and expire 1 month after the birthday.
- Referral rewards stay pending until the referred client's deposit is accepted, then the referrer gets the credit.

## Client Settings

Clients can open `#client-settings`, enter the same email and phone used for booking, and see:

- Their referral code
- A referral share link
- Pending referrals
- Approved referrals
- Available, reserved, or redeemed credits
- Saved profile details from their previous booking

When a client uses client settings or submits a booking, the browser stores their basic profile locally so future bookings can prefill:

- Name
- Email
- Phone
- Birthday
- Contact preference
- SMS/referral/email opt-ins
- Notes

Google sign-in is enabled when `GOOGLE_CLIENT_ID` is configured. The server verifies Google's signed ID token and only opens client settings when the verified Google email matches an existing Lovely Locs booking. The booking email and phone lookup remains available as a fallback.

## Scheduler URLs

Use a scheduler such as Render Cron, UptimeRobot, Zapier, or Make to call these URLs:

- Daily: `https://lovely-locs-booking.onrender.com/api/automations/run?type=daily&token=YOUR_TOKEN`
- Monthly referral campaign: `https://lovely-locs-booking.onrender.com/api/automations/run?type=monthly&token=YOUR_TOKEN`

You can also send the token as an `Authorization: Bearer YOUR_TOKEN` header instead of putting it in the URL.

## Duplicate protection

Every sent automation appends an `automation.notification.sent` event to `bookings.jsonl`. Future runs check those events before sending again, so running the daily endpoint more than once should not resend the same reminder for the same cycle.

## Monthly Graphic Copy

Headline:

Good People Know Good People

Text:

Refer a friend.

When they book:

They receive the new client rate

You receive $15 off your next service

This rewards loyalty without discounting your brand.
