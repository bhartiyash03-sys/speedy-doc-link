import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft, Home } from "lucide-react";

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Canceled
        </h1>
        <p className="text-muted-foreground mb-6">
          Your payment was not completed. Don't worry, no charges were made.
        </p>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
