# Supabase Premium Purchase Setup

This repository now supports monthly and yearly premium listing purchases for bots.

## What changed

- `Monthly` plan: `€4.99` for 1 month of featured visibility.
- `Yearly` plan: `€45.00` for 12 months of featured visibility.
- Stripe checkout now stores `plan` in purchase metadata.
- `verify-premium-payment` now calculates `featured_until` based on the purchased plan.

## Required database changes

If your existing Supabase project already has the `premium_purchases` table, run this SQL to add plan support:

```sql
ALTER TABLE public.premium_purchases
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'monthly';

ALTER TABLE public.premium_purchases
  ALTER COLUMN currency SET DEFAULT 'eur';
```

If you are using Supabase migrations, apply the new migration file at:

- `supabase/migrations/20250806120000_add_plan_to_premium_purchases.sql`

## Required environment variables

Ensure the following environment variables are configured for your Supabase functions and local `.env` file:

- `SUPABASE_URL` (Supabase project URL)
- `SUPABASE_ANON_KEY` (Supabase anon/public key)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase service role key for server-side inserts/updates)
- `STRIPE_SECRET_KEY` (Stripe secret key for Checkout Session creation)

If you want to use Stripe.js in the frontend later, also add:

- `STRIPE_PUBLISHABLE_KEY`

## Notes for Stripe

- Use the Stripe Dashboard to confirm that `STRIPE_SECRET_KEY` is valid and has access to Checkout Sessions.
- The checkout session is created in EUR (`currency: "eur"`).
- `create-premium-checkout` passes the selected plan as Stripe metadata:
  - `plan`: `monthly` or `yearly`

> The checkout success URL must include the Stripe placeholder `?session_id={CHECKOUT_SESSION_ID}` so the app can verify the payment on the `/premium-success` page.

## Behavior after payment

- `verify-premium-payment` verifies the Stripe session.
- It updates the corresponding `premium_purchases` record to `status = 'paid'`.
- It also updates the bot listing to:
  - `featured = true`
  - `featured_until = <one month or one year from purchase>

## Optional maintenance

If you already have old pending purchases, you may want to review them before deploying.

## Useful links

- Stripe Dashboard: https://dashboard.stripe.com/
- Supabase Dashboard: https://app.supabase.com/
- Supabase Functions docs: https://supabase.com/docs/guides/functions
- Supabase Migrations docs: https://supabase.com/docs/guides/database/migrations
