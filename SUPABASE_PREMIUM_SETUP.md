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

## SQL Command to Create Premium Checkout Function

**Note:** Supabase Edge Functions cannot be created via SQL commands. The `create_premium_checkout` function must be deployed as a TypeScript file using the Supabase CLI or dashboard. However, here's a PostgreSQL function that handles the database operations for premium checkout (for reference only):

```sql
-- Create a PostgreSQL function for premium checkout database operations
-- Note: This is for reference only - the actual Edge Function handles Stripe integration

CREATE OR REPLACE FUNCTION create_premium_checkout_db(
  p_user_id UUID,
  p_bot_id UUID,
  p_stripe_session_id TEXT,
  p_amount INTEGER,
  p_currency TEXT DEFAULT 'eur',
  p_plan TEXT DEFAULT 'monthly',
  p_status TEXT DEFAULT 'pending'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_featured_until TIMESTAMP WITH TIME ZONE;
  v_result JSON;
BEGIN
  -- Calculate featured_until based on plan
  IF p_plan = 'yearly' THEN
    v_featured_until := NOW() + INTERVAL '1 year';
  ELSE
    v_featured_until := NOW() + INTERVAL '1 month';
  END IF;

  -- Insert premium purchase record
  INSERT INTO public.premium_purchases (
    user_id,
    bot_id,
    stripe_session_id,
    amount,
    currency,
    status,
    plan,
    featured_until
  ) VALUES (
    p_user_id,
    p_bot_id,
    p_stripe_session_id,
    p_amount,
    p_currency,
    p_status,
    p_plan,
    v_featured_until
  );

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'message', 'Premium checkout record created',
    'featured_until', v_featured_until,
    'plan', p_plan
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_premium_checkout_db(UUID, UUID, TEXT, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
```

**Important:** This SQL function is provided for reference only. The actual `create_premium_checkout` Edge Function must be deployed as a TypeScript file because it requires:

- Stripe API integration (JavaScript/TypeScript only)
- User authentication validation
- CORS handling
- External API calls

To deploy the Edge Function, use the Supabase CLI:

```bash
supabase functions deploy create-premium-checkout
```

Or upload the function code through the Supabase Dashboard under Edge Functions.

## Updated Edge Function Code

Replace your current `create_premium_checkout` function with this updated version that supports monthly/yearly plans:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function readBody(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return await req.json();
  }
  // Fallback: accept raw text JSON
  const text = await req.text();
  return JSON.parse(text);
}

const planConfig = {
  monthly: {
    amount: 499, // €4.99 in cents
    description: '1 month of premium visibility',
  },
  yearly: {
    amount: 4500, // €45.00 in cents
    description: '12 months of premium visibility',
  },
} as const;

type PremiumPlan = keyof typeof planConfig;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return jsonResponse(
      {
        error: 'Missing server secrets. Set STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.',
      },
      500
    );
  }

  // Input validation
  const body = (await readBody(req)) as {
    botId: string;
    plan: PremiumPlan;
    returnUrl?: string;
  };

  const { botId, plan, returnUrl } = body;

  if (!botId) {
    return jsonResponse({ error: 'Bot ID is required' }, 400);
  }

  if (!plan || !planConfig[plan]) {
    return jsonResponse({ error: 'Plan must be either "monthly" or "yearly"' }, 400);
  }

  // Authenticate user
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authorization header required' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify user with Supabase
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!userRes.ok) {
    return jsonResponse({ error: 'Invalid authentication' }, 401);
  }

  const user = await userRes.json();

  // Verify bot ownership
  const botRes = await fetch(`${supabaseUrl}/rest/v1/bots?id=eq.${botId}&select=name,owner_id`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!botRes.ok) {
    return jsonResponse({ error: 'Bot not found' }, 404);
  }

  const bots = await botRes.json();
  if (bots.length === 0 || bots[0].owner_id !== user.id) {
    return jsonResponse({ error: 'You can only purchase premium for your own bots' }, 403);
  }

  const bot = bots[0];
  const selectedPlan = planConfig[plan];

  // Check for free/test users
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=discord_id`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  const profiles = await profileRes.json();
  const isFreeUser = profiles.length > 0 && profiles[0].discord_id === '1289423234487549972';
  const isTestUser = profiles.length > 0 && profiles[0].discord_id === '1254195552808206429';
  const amount = isFreeUser || isTestUser ? 0 : selectedPlan.amount;

  // Handle free users
  if (isFreeUser) {
    const featuredUntil = plan === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Insert premium purchase record
    await fetch(`${supabaseUrl}/rest/v1/premium_purchases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        bot_id: botId,
        stripe_session_id: `free_grant_${Date.now()}`,
        amount: 0,
        currency: 'eur',
        status: 'paid',
        plan,
        featured_until: featuredUntil,
      }),
    });

    // Update bot
    await fetch(`${supabaseUrl}/rest/v1/bots?id=eq.${botId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        featured: true,
        featured_until: featuredUntil,
      }),
    });

    return jsonResponse({
      success: true,
      message: 'Premium listing granted for free!',
      featured_until: featuredUntil,
      plan,
    });
  }

  // Create Stripe Checkout Session
  const successUrl = returnUrl || `${req.headers.get('origin')}/premium-success?session_id={CHECKOUT_SESSION_ID}`;

  const form = new URLSearchParams();
  form.set('mode', 'payment'); // One-time payment, not subscription
  form.set('success_url', successUrl);
  form.set('cancel_url', `${req.headers.get('origin')}/`);
  form.set('currency', 'eur');
  form.set('line_items[0][price_data][currency]', 'eur');
  form.set('line_items[0][price_data][product_data][name]', `Premium Listing - ${bot.name}`);
  form.set('line_items[0][price_data][product_data][description]', selectedPlan.description);
  form.set('line_items[0][price_data][unit_amount]', String(amount));
  form.set('line_items[0][quantity]', '1');
  form.set('metadata[botId]', botId);
  form.set('metadata[userId]', user.id);
  form.set('metadata[plan]', plan);
  form.set('metadata[type]', 'premium_listing');
  form.set('client_reference_id', user.id);

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const stripeText = await stripeRes.text();

  let stripeData: any;
  try {
    stripeData = JSON.parse(stripeText);
  } catch {
    stripeData = { raw: stripeText };
  }

  if (!stripeRes.ok) {
    return jsonResponse(
      {
        error: 'Stripe error creating checkout session',
        status: stripeRes.status,
        details: stripeData,
      },
      400
    );
  }

  // Store pending purchase record
  await fetch(`${supabaseUrl}/rest/v1/premium_purchases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: user.id,
      bot_id: botId,
      stripe_session_id: stripeData.id,
      amount,
      currency: 'eur',
      status: 'pending',
      plan,
    }),
  });

  return jsonResponse({
    id: stripeData.id,
    url: stripeData.url,
  });
});
```

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
