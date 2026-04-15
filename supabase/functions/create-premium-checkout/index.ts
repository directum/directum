import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const calculateFeaturedUntil = (plan: string) => {
  const featuredUntil = new Date();
  if (plan === "yearly") {
    featuredUntil.setFullYear(featuredUntil.getFullYear() + 1);
  } else {
    featuredUntil.setMonth(featuredUntil.getMonth() + 1);
  }
  return featuredUntil.toISOString();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { botId, plan, returnUrl } = await req.json();
    if (!botId) {
      throw new Error("Bot ID is required");
    }

    if (plan !== "monthly" && plan !== "yearly") {
      throw new Error("Plan must be either 'monthly' or 'yearly'");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user || !userData.user.id || !userData.user.email) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;

    const { data: bot, error: botError } = await supabaseClient
      .from("bots")
      .select("name, owner_id")
      .eq("id", botId)
      .single();

    if (botError || !bot) {
      throw new Error("Bot not found");
    }

    if (bot.owner_id !== user.id) {
      throw new Error("You can only purchase premium listing for your own bots");
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, discord_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    const planConfig = {
      monthly: {
        amount: 499,
        description: "1 month of premium visibility",
      },
      yearly: {
        amount: 4500,
        description: "12 months of premium visibility",
      },
    } as const;

    const selectedPlan = planConfig[plan];
    const currency = "eur";
    const featuredUntil = calculateFeaturedUntil(plan);
    const isFreeUser = profile.discord_id === "1289423234487549972";
    const isTestUser = profile.discord_id === "1254195552808206429";
    const amount = isFreeUser || isTestUser ? 0 : selectedPlan.amount;

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (isFreeUser) {
      await supabaseService.from("premium_purchases").insert({
        user_id: user.id,
        bot_id: botId,
        stripe_session_id: "free_grant_" + Date.now(),
        amount: 0,
        currency,
        status: "paid",
        plan,
        featured_until: featuredUntil,
      });

      await supabaseService
        .from("bots")
        .update({ featured: true, featured_until: featuredUntil })
        .eq("id", botId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Premium listing granted for free!",
          featured_until: featuredUntil,
          plan,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const successUrl = returnUrl
      ? returnUrl
      : `${req.headers.get("origin")}/premium-success?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Premium Listing - ${bot.name}`,
              description: selectedPlan.description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        botId,
        userId: user.id,
        plan,
        type: "premium_listing",
      },
    });

    await supabaseService.from("premium_purchases").insert({
      user_id: user.id,
      bot_id: botId,
      stripe_session_id: session.id,
      amount,
      currency,
      status: "pending",
      plan,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
