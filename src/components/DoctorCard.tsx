import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Video, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  hospital: string;
  location: string;
  consultationType: "Online" | "In-person" | "Both";
  fee: number;
  image: string;
  availableSlots: number;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 bg-card">
      <div className="p-6">
        <div className="flex gap-4">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-card-foreground truncate">
              {doctor.name}
            </h3>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">({doctor.reviews})</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{doctor.experience} years exp</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{doctor.hospital}, {doctor.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {(doctor.consultationType === "Online" || doctor.consultationType === "Both") && (
              <Badge variant="secondary" className="gap-1">
                <Video className="w-3 h-3" />
                Online
              </Badge>
            )}
            {(doctor.consultationType === "In-person" || doctor.consultationType === "Both") && (
              <Badge variant="outline">In-person</Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Clock className="w-4 h-4" />
              <span>{doctor.availableSlots} slots</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Consultation Fee</span>
            <p className="text-xl font-semibold text-primary">₹{doctor.fee}</p>
          </div>
          <Button onClick={() => navigate(`/doctor/${doctor.id}`)}>
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};
