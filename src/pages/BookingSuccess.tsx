import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  doctor_name: string;
  doctor_specialization: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  fee: number;
  status: string;
}

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = searchParams.get("booking_id");
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyAndFetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        setVerifying(false);
        return;
      }

      try {
        // Verify payment
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
          "verify-booking-payment",
          { body: { bookingId } }
        );

        if (verifyError) {
          console.error("Verification error:", verifyError);
        } else if (verifyData?.booking) {
          setBooking(verifyData.booking);
          
          // Send confirmation email
          await supabase.functions.invoke("send-booking-confirmation", {
            body: { bookingId },
          });

          toast({
            title: "Booking confirmed!",
            description: "A confirmation email has been sent to you.",
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyAndFetchBooking();
  }, [bookingId, toast]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find your booking. Please check your email for confirmation or contact support.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MediConnect</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8">
              Your appointment has been successfully booked and confirmed.
            </p>

            <div className="bg-secondary/30 rounded-lg p-6 text-left space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium text-foreground">{booking.doctor_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.doctor_specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(booking.appointment_date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{booking.appointment_time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.consultation_type === "online" ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Type</p>
                  <p className="font-medium text-foreground capitalize">{booking.consultation_type}</p>
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-xl font-bold text-green-600">₹{booking.fee}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Booking Reference: <span className="font-mono">{booking.id.slice(0, 8)}</span>
            </p>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/profile")}>
                View My Bookings
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
