import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: "online" | "in-person";
  fee: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const bookingData: BookingRequest = await req.json();
    console.log("[CREATE-BOOKING-CHECKOUT] Booking data received:", bookingData);

    // Create booking record with pending status
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        user_id: user.id,
        doctor_id: bookingData.doctorId,
        doctor_name: bookingData.doctorName,
        doctor_specialization: bookingData.doctorSpecialization,
        appointment_date: bookingData.appointmentDate,
        appointment_time: bookingData.appointmentTime,
        consultation_type: bookingData.consultationType,
        fee: bookingData.fee,
        notes: bookingData.notes || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("[CREATE-BOOKING-CHECKOUT] Error creating booking:", bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    console.log("[CREATE-BOOKING-CHECKOUT] Booking created:", booking.id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Consultation with ${bookingData.doctorName}`,
              description: `${bookingData.consultationType === "online" ? "Online" : "In-person"} consultation on ${bookingData.appointmentDate} at ${bookingData.appointmentTime}`,
            },
            unit_amount: bookingData.fee * 100, // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking-success?booking_id=${booking.id}`,
      cancel_url: `${origin}/booking-cancelled?booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        user_id: user.id,
      },
    });

    // Update booking with Stripe session ID
    await supabaseClient
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    console.log("[CREATE-BOOKING-CHECKOUT] Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, bookingId: booking.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-BOOKING-CHECKOUT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
