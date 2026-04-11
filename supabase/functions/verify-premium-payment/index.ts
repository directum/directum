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
    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate featured_until date (30 days from now)
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);

    // Update purchase record
    const { data: purchase, error: purchaseError } = await supabaseService
      .from("premium_purchases")
      .update({
        status: "paid",
        featured_until: featuredUntil.toISOString(),
      })
      .eq("stripe_session_id", sessionId)
      .select("bot_id")
      .single();

    if (purchaseError) {
      throw new Error("Failed to update purchase record");
    }

    // Update bot with featured status
    await supabaseService
      .from("bots")
      .update({
        featured: true,
        featured_until: featuredUntil.toISOString(),
      })
      .eq("id", purchase.bot_id);

    return new Response(JSON.stringify({ 
      success: true, 
      featured_until: featuredUntil.toISOString() 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    // Fixed: Using unknown + type checking to satisfy the "any type not allowed" rule
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});