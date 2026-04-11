import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { botId } = await req.json();
    if (!botId) {
      throw new Error("Bot ID is required");
    }

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Verify bot exists and get bot details
    const { data: bot, error: botError } = await supabaseClient
      .from("bots")
      .select("name, owner_id")
      .eq("id", botId)
      .single();

    if (botError || !bot) {
      throw new Error("Bot not found");
    }

    // Verify user owns the bot and get profile info
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("id, discord_id")
      .eq("id", user.id)
      .single();

    if (bot.owner_id !== profile?.id) {
      throw new Error("You can only purchase premium listing for your own bots");
    }

    // Check if this is the free premium user - bypass payment entirely
    const isFreeUser = profile?.discord_id === "1289423234487549972";
    
    if (isFreeUser) {
      // Grant premium listing directly without payment
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 30);

      // Update bot with featured status
      await supabaseService
        .from("bots")
        .update({
          featured: true,
          featured_until: featuredUntil.toISOString(),
        })
        .eq("id", botId);

      // Create purchase record
      await supabaseService.from("premium_purchases").insert({
        user_id: user.id,
        bot_id: botId,
        stripe_session_id: "free_grant_" + Date.now(),
        amount: 0,
        status: "paid",
        featured_until: featuredUntil.toISOString(),
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Premium listing granted for free!",
        featured_until: featuredUntil.toISOString() 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if this is the test user - zero cost for testing
    const isTestUser = profile?.discord_id === "1374705890565029988";
    const amount = isTestUser ? 0 : 1000;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session for 30-day premium listing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `Premium Listing - ${bot.name}`,
              description: "30-day premium listing with enhanced visibility"
            },
            unit_amount: amount, // £10.00 for 30 days (or £0 for test user)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        botId: botId,
        userId: user.id,
        type: "premium_listing"
      }
    });

    // Create purchase record in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("premium_purchases").insert({
      user_id: user.id,
      bot_id: botId,
      stripe_session_id: session.id,
      amount: amount,
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
  console.error("Error creating checkout session:", error);
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
  }
});