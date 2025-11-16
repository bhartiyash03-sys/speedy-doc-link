import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Heart,
  Stethoscope,
  Brain,
  Baby,
  Bone,
  Sparkles,
  Activity,
  Eye,
  User,
  LogOut,
} from "lucide-react";

const categories = [
  { icon: Heart, title: "Cardiologist", count: 150, specialty: "Cardiologist" },
  { icon: Stethoscope, title: "General Physician", count: 200, specialty: "General Physician" },
  { icon: Brain, title: "Neurologist", count: 80, specialty: "Neurologist" },
  { icon: Baby, title: "Pediatrician", count: 120, specialty: "Pediatrician" },
  { icon: Bone, title: "Orthopedic", count: 95, specialty: "Orthopedic" },
  { icon: Sparkles, title: "Dermatologist", count: 110, specialty: "Dermatologist" },
  { icon: Activity, title: "Gynecologist", count: 130, specialty: "Gynecologist" },
  { icon: Eye, title: "Ophthalmologist", count: 75, specialty: "Ophthalmologist" },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    setIsAuthenticated(false);
  };

  const handleSearch = () => {
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategoryClick = (specialty: string) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">MediConnect</h1>
            </div>
            <nav className="flex gap-2 items-center">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/doctors")}>
                Find Doctors
              </Button>
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Button variant="ghost" onClick={() => navigate("/profile")} size="sm">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button variant="ghost" onClick={handleLogout} size="sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => navigate("/auth")} size="sm">
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Find & Book Appointments with Top Doctors
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced healthcare professionals. Online consultations and in-person visits available.
            </p>
            <div className="flex justify-center pt-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Browse by Specialization
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={category.title} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CategoryCard
                  icon={category.icon}
                  title={category.title}
                  count={category.count}
                  onClick={() => handleCategoryClick(category.specialty)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-lg">Verified Doctors</h4>
              <p className="text-muted-foreground">
                All doctors are verified and highly qualified professionals
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-lg">Easy Booking</h4>
              <p className="text-muted-foreground">
                Book appointments in just a few clicks, available 24/7
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-lg">Quality Care</h4>
              <p className="text-muted-foreground">
                Get the best healthcare services from top specialists
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
