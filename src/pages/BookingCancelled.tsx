import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, XCircle } from "lucide-react";

export default function BookingCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");

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
              <Button className="w-full" onClick={() => navigate(-1)}>
                Try Again
              </Button>
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
