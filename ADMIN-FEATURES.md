# Admin discount, app installation and notifications

## Discount

- Starts enabled when this release is deployed, unless `settings/storeDiscount.enabled` is already false.
- The admin dashboard switch saves the enabled flag in Firestore. No product documents are rewritten.
- All active product variants use 10% off, rounded to the nearest kobo. ₦2,150 becomes ₦1,935.
- Expiry is enforced on the server at `2026-10-16T00:00:00+01:00`, immediately after 15 October in Africa/Lagos.
- The public pricing endpoint returns only the active flag and percentage. The deadline appears only in admin controls.
- Product cards, pack selectors, cart and checkout show original prices crossed out. Open pages refresh campaign state every 15 seconds and on focus.
- Checkout computes trusted prices from Firestore. A stale quoted total returns 409 and refreshes the cart for the buyer to review before retrying.
- Existing orders keep the price agreed when they were created, including orders awaiting payment when the offer ends.

## Install the admin app

Deploy over HTTPS. Open `/admin-login` or `/dashboard/admin` on the phone. Use **Install app** when offered. On iPhone/iPad, use Safari → Share → Add to Home Screen. Browser menu installation is also available where supported.

The app opens the protected admin dashboard. `public/manifest.json`, PNG icons and `public/admin-sw.js` provide installation and a network-failure screen. Private pages and API responses are never stored in a service-worker cache. An internet connection and admin login are required.

## Notifications

Each new order and first confirmed payment writes a durable `adminNotifications` event atomically with its order update. The dashboard shows unread counts, order links, older events and a per-admin **Mark all as read** action, stored in `adminNotificationState`.

The inbox polls every 15 seconds. Optional browser alerts require permission and an open dashboard; this release does not send background push alerts after the dashboard is closed. Events are retained for the admin's next visit. Turning off browser alerts does not disable the inbox.

Payment confirmation is shared between the authenticated callback and the signed Paystack webhook, with amount/currency/reference validation and duplicate-event protection. Retried payment attempts remain identifiable in `paymentAttempts`.

### Required Paystack setup after deployment

In Paystack Settings → API Keys & Webhooks, set the webhook URL for the appropriate test/live mode to:

`https://YOUR-DEPLOYED-DOMAIN/api/payments/webhook`

Use the corresponding `PAYSTACK_SECRET_KEY` already configured on the server. No new environment variables are required. This webhook is needed to receive payment confirmations when the buyer closes the payment page. Never place the secret key in a public environment variable.

Reference: https://paystack.com/docs/payments/webhooks/

## Firestore access

The new collections use the Firebase Admin SDK only; do not grant client access to `settings`, `adminNotifications`, `adminNotificationState`, or `paymentAttempts`. Review existing Firestore rules if the project currently grants broad browser access. No additional composite index is needed for these queries.

## Validation

Run `npm test` for discount boundaries, kobo rounding, payment signature/amount validation, order creation and duplicate payment handling using an in-memory Firestore substitute. These tests do not place real orders or charge a card. Run `npm run build` for production compilation.

After deployment, use Paystack test mode to verify a new order, payment callback and webhook retry, then check a real admin phone installation. Confirm the switch off/on behavior and install/browser notification permissions on each supported device.
