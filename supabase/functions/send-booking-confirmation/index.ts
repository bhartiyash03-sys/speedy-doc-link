import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.log("[SEND-BOOKING-CONFIRMATION] RESEND_API_KEY not configured, skipping email");
    return new Response(JSON.stringify({ success: true, message: "Email service not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const resend = new Resend(resendKey);

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
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Booking ID is required");

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Get user profile for name
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    const patientName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : "Patient";

    console.log("[SEND-BOOKING-CONFIRMATION] Sending confirmation email to:", user.email);

    const emailResponse = await resend.emails.send({
      from: "MediConnect <onboarding@resend.dev>",
      to: [user.email],
      subject: `Booking Confirmed - ${booking.doctor_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <p style="font-size: 16px; color: #334155;">Dear ${patientName},</p>
            
            <p style="font-size: 16px; color: #334155;">
              Your appointment has been successfully booked. Here are your booking details:
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="color: #0ea5e9; margin-top: 0;">Appointment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Doctor:</td>
                  <td style="padding: 8px 0; color: #334155; font-weight: bold;">${booking.doctor_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Specialization:</td>
                  <td style="padding: 8px 0; color: #334155;">${booking.doctor_specialization}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Date:</td>
                  <td style="padding: 8px 0; color: #334155; font-weight: bold;">${new Date(booking.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Time:</td>
                  <td style="padding: 8px 0; color: #334155; font-weight: bold;">${booking.appointment_time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Type:</td>
                  <td style="padding: 8px 0; color: #334155;">${booking.consultation_type === 'online' ? '🖥️ Online Consultation' : '🏥 In-person Visit'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Fee Paid:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">₹${booking.fee}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 14px; color: #64748b;">
              ${booking.consultation_type === 'online' 
                ? 'You will receive a video call link before your appointment.' 
                : 'Please arrive 10 minutes before your scheduled appointment time.'}
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Booking Reference: <strong>${booking.id}</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              If you need to cancel or reschedule, please contact us at least 24 hours before your appointment.
            </p>
          </div>
          
          <div style="background: #1e293b; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">© 2024 MediConnect. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("[SEND-BOOKING-CONFIRMATION] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[SEND-BOOKING-CONFIRMATION] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
