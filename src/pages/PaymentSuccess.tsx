import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Home, Calendar } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const handleDownloadReceipt = () => {
    // Generate receipt content
    const receiptContent = `
=================================
       PAYMENT RECEIPT
=================================
Transaction ID: ${sessionId?.slice(0, 20) || "N/A"}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Status: PAID ✓
=================================

Thank you for choosing MediConnect!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-6">
          Your appointment has been confirmed and payment received.
        </p>

        <div className="bg-secondary/30 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-3">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-xs">
                {sessionId?.slice(0, 16)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Paid</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleDownloadReceipt}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button className="w-full" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/doctors")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Another Appointment
          </Button>
        </div>
      </Card>
    </div>
  );
}
