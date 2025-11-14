import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Star,
  MapPin,
  Video,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Clock,
} from "lucide-react";

// Mock data - in a real app, this would come from an API
const mockDoctor = {
  id: "1",
  name: "Dr. Sarah Johnson",
  specialization: "Cardiologist",
  experience: 15,
  rating: 4.8,
  reviews: 234,
  hospital: "City Heart Institute",
  location: "Mumbai, Maharashtra",
  consultationType: "Both" as const,
  onlineFee: 800,
  inPersonFee: 1200,
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop",
  bio: "Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating cardiovascular diseases. She specializes in interventional cardiology and has performed over 2000 successful procedures. She is passionate about preventive cardiology and patient education.",
  qualifications: [
    "MBBS - All India Institute of Medical Sciences, 2005",
    "MD (Internal Medicine) - AIIMS, 2008",
    "DM (Cardiology) - AIIMS, 2011",
    "Fellowship in Interventional Cardiology - USA, 2013",
  ],
  specializations: [
    "Interventional Cardiology",
    "Preventive Cardiology",
    "Heart Failure Management",
    "Cardiac Rehabilitation",
  ],
  availableSlots: {
    today: ["10:00 AM", "2:00 PM", "4:30 PM"],
    tomorrow: ["9:00 AM", "11:30 AM", "3:00 PM", "5:00 PM"],
  },
};

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

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

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={mockDoctor.image}
                  alt={mockDoctor.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {mockDoctor.name}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-3">
                    {mockDoctor.specialization}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-medium">{mockDoctor.rating}</span>
                      <span className="text-muted-foreground">({mockDoctor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-5 h-5" />
                      <span>{mockDoctor.experience} years experience</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>{mockDoctor.hospital}, {mockDoctor.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Video className="w-3 h-3" />
                      Online Consultation
                    </Badge>
                    <Badge variant="outline">In-person Visit</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                About
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {mockDoctor.bio}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Qualifications
              </h3>
              <ul className="space-y-2">
                {mockDoctor.qualifications.map((qual, index) => (
                  <li key={index} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {mockDoctor.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-primary" />
                    <span className="font-medium">Online Consultation</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{mockDoctor.onlineFee}</p>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">In-person Visit</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{mockDoctor.inPersonFee}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Available Today
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mockDoctor.availableSlots.today.map((slot, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Tomorrow
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mockDoctor.availableSlots.tomorrow.map((slot, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate(`/booking/${id}`)}
              >
                Book Appointment
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                You'll be able to choose your preferred date and time in the next step
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
