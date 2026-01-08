import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Activity, Video, MapPin, Calendar as CalendarIcon, Clock, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const mockDoctor = {
  name: "Dr. Sarah Johnson",
  specialization: "Cardiologist",
  hospital: "City Heart Institute",
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
  onlineFee: 800,
  inPersonFee: 1200,
};

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultationType, setConsultationType] = useState<"online" | "in-person">("online");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    setIsProcessing(true);
    
    try {
      const fee = consultationType === "online" ? mockDoctor.onlineFee : mockDoctor.inPersonFee;
      
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: fee,
          doctorName: mockDoctor.name,
          consultationType: consultationType === "online" ? "Online" : "In-person",
          appointmentDate: selectedDate.toLocaleDateString(),
          appointmentTime: selectedTime,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <Activity className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">MediConnect</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <h2 className="text-3xl font-bold text-foreground mb-8">Book Appointment</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Consultation Type</h3>
              <RadioGroup value={consultationType} onValueChange={(value: any) => setConsultationType(value)}>
                <div className="grid md:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      consultationType === "online"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="w-5 h-5 text-primary" />
                        <span className="font-medium">Online Consultation</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">₹{mockDoctor.onlineFee}</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      consultationType === "in-person"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="in-person" id="in-person" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-medium">In-person Visit</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">₹{mockDoctor.inPersonFee}</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Select Time Slot</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <Badge
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 hover:bg-secondary"
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Reason for Visit (Optional)</h3>
              <Textarea
                placeholder="Describe your symptoms or reason for consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <img
                  src={mockDoctor.image}
                  alt={mockDoctor.name}
                  className="w-16 h-16 rounded-lg"
                />
                <div>
                  <p className="font-semibold">{mockDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{mockDoctor.specialization}</p>
                  <p className="text-xs text-muted-foreground">{mockDoctor.hospital}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Type:</span>
                  <span className="font-medium capitalize">{consultationType}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-semibold">Total Fee:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{consultationType === "online" ? mockDoctor.onlineFee : mockDoctor.inPersonFee}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handlePayment}
                disabled={isProcessing || !selectedDate || !selectedTime}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{consultationType === "online" ? mockDoctor.onlineFee : mockDoctor.inPersonFee}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure payment via Stripe • UPI, Cards & Wallets accepted
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
