import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, XCircle, Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function BookingCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = searchParams.get("booking_id");
  const [isResuming, setIsResuming] = useState(false);

  const handleResumePayment = async () => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "No booking found to resume.",
        variant: "destructive",
      });
      return;
    }

    setIsResuming(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-booking-checkout", {
        body: { bookingId },
      });

      if (error) throw error;

      if (data?.alreadyPaid) {
        toast({
          title: "Already Paid",
          description: "This booking has already been paid.",
        });
        navigate(`/booking-success?booking_id=${bookingId}`);
        return;
      }

      if (data?.url) {
        const url = data.url as string;
        const isEmbedded = (() => {
          try {
            return window.self !== window.top;
          } catch {
            return true;
          }
        })();

        if (isEmbedded) {
          const newTab = window.open(url, "_blank", "noopener,noreferrer");
          if (!newTab) {
            window.location.href = url;
          } else {
            toast({
              title: "Checkout opened",
              description: "Complete payment in the new tab.",
            });
          }
        } else {
          window.location.href = url;
        }
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Resume payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resume payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResuming(false);
    }
  };

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
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</h2>
            <p className="text-muted-foreground mb-8">
              Your payment was cancelled and the booking was not completed. No charges were made.
            </p>

            <div className="space-y-3">
              {bookingId && (
                <Button 
                  className="w-full" 
                  onClick={handleResumePayment}
                  disabled={isResuming}
                >
                  {isResuming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resuming...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Resume Payment
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate("/doctors")}>
                Browse Doctors
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
