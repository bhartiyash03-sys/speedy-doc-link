import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, LogOut, Save, Calendar, Clock, Stethoscope } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { format, isPast, parseISO } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadProfile(session.user.id);
        loadBookings(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone_number || "");
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    }
  };

  const loadBookings = async (userId: string) => {
    try {
      setBookingsLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => !isPast(parseISO(b.appointment_date)) && b.status !== "cancelled"
  );
  const pastBookings = bookings.filter(
    (b) => isPast(parseISO(b.appointment_date)) || b.status === "cancelled"
  );

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
    if (paymentStatus === "paid") return <Badge className="bg-green-500">Confirmed</Badge>;
    if (paymentStatus === "pending") return <Badge variant="secondary">Payment Pending</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const BookingTable = ({ bookings, emptyMessage }: { bookings: Booking[]; emptyMessage: string }) => (
    bookings.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="font-medium">{booking.doctor_name}</div>
                <div className="text-sm text-muted-foreground">{booking.doctor_specialization}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(parseISO(booking.appointment_date), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {booking.appointment_time}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  {booking.consultation_type}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(booking.status, booking.payment_status)}</TableCell>
              <TableCell className="text-right font-medium">₹{booking.fee}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Card */}
          <Card className="shadow-elegant">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">My Profile</CardTitle>
              <CardDescription className="text-center">
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Phone number cannot be changed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bookings Card */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Bookings
              </CardTitle>
              <CardDescription>
                View your upcoming and past appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
              ) : (
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastBookings.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upcoming" className="mt-4">
                    <BookingTable bookings={upcomingBookings} emptyMessage="No upcoming appointments" />
                  </TabsContent>
                  <TabsContent value="past" className="mt-4">
                    <BookingTable bookings={pastBookings} emptyMessage="No past appointments" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
