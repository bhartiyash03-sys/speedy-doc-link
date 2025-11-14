import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DoctorCard, Doctor } from "@/components/DoctorCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, SlidersHorizontal } from "lucide-react";

// Mock data - in a real app, this would come from an API
const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    experience: 15,
    rating: 4.8,
    reviews: 234,
    hospital: "City Heart Institute",
    location: "Mumbai",
    consultationType: "Both",
    fee: 800,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    availableSlots: 5,
  },
  {
    id: "2",
    name: "Dr. Rajesh Patel",
    specialization: "Neurologist",
    experience: 12,
    rating: 4.9,
    reviews: 189,
    hospital: "Brain & Spine Center",
    location: "Delhi",
    consultationType: "Both",
    fee: 1000,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    availableSlots: 3,
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    specialization: "Pediatrician",
    experience: 10,
    rating: 4.7,
    reviews: 312,
    hospital: "Children's Care Hospital",
    location: "Bangalore",
    consultationType: "Both",
    fee: 600,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    availableSlots: 8,
  },
  {
    id: "4",
    name: "Dr. Amit Verma",
    specialization: "Orthopedic",
    experience: 18,
    rating: 4.9,
    reviews: 267,
    hospital: "Bone & Joint Clinic",
    location: "Pune",
    consultationType: "In-person",
    fee: 900,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    availableSlots: 4,
  },
  {
    id: "5",
    name: "Dr. Meera Reddy",
    specialization: "Dermatologist",
    experience: 8,
    rating: 4.6,
    reviews: 198,
    hospital: "Skin Care Specialists",
    location: "Hyderabad",
    consultationType: "Online",
    fee: 500,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
    availableSlots: 12,
  },
  {
    id: "6",
    name: "Dr. Arjun Kapoor",
    specialization: "General Physician",
    experience: 14,
    rating: 4.8,
    reviews: 421,
    hospital: "Community Health Center",
    location: "Chennai",
    consultationType: "Both",
    fee: 400,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop",
    availableSlots: 15,
  },
];

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "all");
  const [consultationType, setConsultationType] = useState("all");
  const [location, setLocation] = useState("all");
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);

  useEffect(() => {
    let filtered = [...mockDoctors];

    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (specialty !== "all") {
      filtered = filtered.filter((doc) => doc.specialization === specialty);
    }

    if (consultationType !== "all") {
      filtered = filtered.filter(
        (doc) =>
          doc.consultationType === consultationType ||
          doc.consultationType === "Both"
      );
    }

    if (location !== "all") {
      filtered = filtered.filter((doc) => doc.location === location);
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, specialty, consultationType, location]);

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

      {/* Search Section */}
      <section className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
          />
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Filters</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Specialization</label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                        <SelectItem value="Neurologist">Neurologist</SelectItem>
                        <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                        <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                        <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                        <SelectItem value="General Physician">General Physician</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Consultation Type</label>
                    <Select value={consultationType} onValueChange={setConsultationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="In-person">In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {filteredDoctors.length} Doctors Found
                </h2>
              </div>

              <div className="grid gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No doctors found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
