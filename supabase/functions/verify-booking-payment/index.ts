import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("[VERIFY-BOOKING-PAYMENT] Verifying payment for booking:", bookingId);

    // Get booking record
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      console.error("[VERIFY-BOOKING-PAYMENT] Booking not found:", bookingError);
      throw new Error("Booking not found");
    }

    if (booking.payment_status === "paid") {
      console.log("[VERIFY-BOOKING-PAYMENT] Payment already verified");
      return new Response(JSON.stringify({ success: true, booking }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!booking.stripe_session_id) {
      throw new Error("No Stripe session found for this booking");
    }

    // Initialize Stripe and verify payment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
    console.log("[VERIFY-BOOKING-PAYMENT] Stripe session status:", session.payment_status);

    if (session.payment_status === "paid") {
      // Update booking to confirmed and paid
      const { data: updatedBooking, error: updateError } = await supabaseClient
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (updateError) {
        console.error("[VERIFY-BOOKING-PAYMENT] Error updating booking:", updateError);
        throw new Error("Failed to update booking status");
      }

      console.log("[VERIFY-BOOKING-PAYMENT] Payment verified and booking confirmed");

      return new Response(JSON.stringify({ success: true, booking: updatedBooking }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[VERIFY-BOOKING-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
