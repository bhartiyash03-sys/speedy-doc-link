import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  ArrowLeft,
  Video,
  MapPin,
  Clock,
  CreditCard,
  CalendarDays,
  User,
  Loader2,
} from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";

// Mock doctor data - in production, fetch from API
const mockDoctors: Record<string, {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  location: string;
  onlineFee: number;
  inPersonFee: number;
  image: string;
  availableSlots: string[];
}> = {
  "1": {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "City Heart Institute",
    location: "Mumbai, Maharashtra",
    onlineFee: 800,
    inPersonFee: 1200,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
  },
  "2": {
    id: "2",
    name: "Dr. Rajesh Patel",
    specialization: "Neurologist",
    hospital: "Brain & Spine Center",
    location: "Delhi",
    onlineFee: 1000,
    inPersonFee: 1500,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    availableSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM"],
  },
  "3": {
    id: "3",
    name: "Dr. Priya Sharma",
    specialization: "Pediatrician",
    hospital: "Children's Care Hospital",
    location: "Bangalore",
    onlineFee: 600,
    inPersonFee: 900,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    availableSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"],
  },
  "4": {
    id: "4",
    name: "Dr. Amit Verma",
    specialization: "Orthopedic",
    hospital: "Bone & Joint Clinic",
    location: "Pune",
    onlineFee: 900,
    inPersonFee: 1300,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    availableSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
  },
  "5": {
    id: "5",
    name: "Dr. Meera Reddy",
    specialization: "Dermatologist",
    hospital: "Skin Care Specialists",
    location: "Hyderabad",
    onlineFee: 500,
    inPersonFee: 800,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
  },
  "6": {
    id: "6",
    name: "Dr. Arjun Kapoor",
    specialization: "General Physician",
    hospital: "Community Health Center",
    location: "Chennai",
    onlineFee: 400,
    inPersonFee: 600,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop",
    availableSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"],
  },
};

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<"online" | "in-person">("online");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const doctor = mockDoctors[id || "1"];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setCheckingAuth(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Doctor not found</h2>
          <Button onClick={() => navigate("/doctors")}>Browse Doctors</Button>
        </div>
      </div>
    );
  }

  const fee = consultationType === "online" ? doctor.onlineFee : doctor.inPersonFee;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book an appointment.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select date and time",
        description: "Please select a date and time slot for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-booking-checkout", {
        body: {
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorSpecialization: doctor.specialization,
          appointmentDate: format(selectedDate, "yyyy-MM-dd"),
          appointmentTime: selectedTime,
          consultationType,
          fee,
          notes: notes.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const url = data.url as string;
        const isEmbedded = (() => {
          try {
            return window.self !== window.top;
          } catch {
            return true;
          }
        })();

        // Stripe Checkout cannot render inside an iframe, so in preview we open a new tab.
        if (isEmbedded) {
          const newTab = window.open(url, "_blank", "noopener,noreferrer");
          if (!newTab) {
            // Popup blocked; fall back to same-tab navigation.
            window.location.href = url;
          } else {
            toast({
              title: "Checkout opened",
              description: "Complete payment in the new tab. After payment you’ll be redirected to confirmation.",
            });
          }
        } else {
          window.location.href = url;
        }
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disabledDays = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/doctors")}>
                Find Doctors
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Book Appointment</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Doctor Info */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    <p className="text-xs text-muted-foreground">{doctor.hospital}</p>
                  </div>
                </div>
              </Card>

              {/* Consultation Type */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Consultation Type
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setConsultationType("online")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      consultationType === "online"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Video className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground">Online</p>
                    <p className="text-lg font-bold text-primary">₹{doctor.onlineFee}</p>
                  </button>
                  <button
                    onClick={() => setConsultationType("in-person")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      consultationType === "in-person"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground">In-person</p>
                    <p className="text-lg font-bold text-primary">₹{doctor.inPersonFee}</p>
                  </button>
                </div>
              </Card>

              {/* Date Selection */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-md border"
                />
              </Card>

              {/* Time Selection */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Select Time
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {doctor.availableSlots.map((slot) => (
                    <Badge
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      className={`cursor-pointer py-2 justify-center transition-all ${
                        selectedTime === slot
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Additional Notes (Optional)</h3>
                <Textarea
                  placeholder="Describe your symptoms or reason for visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="md:col-span-1">
              <Card className="p-6 sticky top-4">
                <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium text-foreground">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground capitalize">{consultationType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedTime || "Not selected"}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-xl text-primary">₹{fee}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₹{fee}
                    </>
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You'll need to sign in to complete your booking
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
