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
    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: purchase, error: purchaseError } = await supabaseService
      .from("premium_purchases")
      .select("bot_id, plan")
      .eq("stripe_session_id", sessionId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error("Purchase record not found");
    }

    const plan = purchase.plan || session.metadata?.plan || "monthly";
    const featuredUntil = calculateFeaturedUntil(plan as string);

    const { error: updatePurchaseError } = await supabaseService
      .from("premium_purchases")
      .update({
        status: "paid",
        featured_until: featuredUntil,
      })
      .eq("stripe_session_id", sessionId);

    if (updatePurchaseError) {
      throw new Error("Failed to update purchase record");
    }

    const { error: updateBotError } = await supabaseService
      .from("bots")
      .update({
        featured: true,
        featured_until: featuredUntil,
      })
      .eq("id", purchase.bot_id);

    if (updateBotError) {
      throw new Error("Failed to update bot premium status");
    }

    return new Response(
      JSON.stringify({
        success: true,
        featured_until: featuredUntil,
        plan,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
