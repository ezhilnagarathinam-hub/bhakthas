import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const bhakthaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  age: z.number().min(1, "Age is required").max(150, "Invalid age"),
  contact: z.string().trim().optional(),
});

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
});

interface Temple {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

type DarshanType = "standard_100" | "standard_500" | "vip_1000" | "free";

const darshanOptions = [
  { type: "standard_100" as DarshanType, label: "Standard Darshan", price: 100 },
  { type: "standard_500" as DarshanType, label: "Premium Darshan", price: 500 },
  { type: "vip_1000" as DarshanType, label: "Special VIP Darshan", price: 1000 },
  { type: "free" as DarshanType, label: "Free Darshan", price: 0 },
];

const DarshanBooking = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DarshanType | null>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [bhakthas, setBhakthas] = useState([{ name: "", age: 0, contact: "" }]);
  const [mainBhakthaIndex, setMainBhakthaIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (templeId) {
      fetchTemple();
    }
  }, [templeId]);

  const fetchTemple = async () => {
    try {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .eq("id", templeId)
        .single();

      if (error) throw error;
      setTemple(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load temple details",
        variant: "destructive",
      });
      navigate("/darshan");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTicketChange = (newCount: number) => {
    setNumberOfTickets(newCount);
    const updatedBhakthas = [...bhakthas];
    if (newCount > bhakthas.length) {
      for (let i = bhakthas.length; i < newCount; i++) {
        updatedBhakthas.push({ name: "", age: 0, contact: "" });
      }
    } else {
      updatedBhakthas.splice(newCount);
    }
    setBhakthas(updatedBhakthas);
    if (mainBhakthaIndex >= newCount) {
      setMainBhakthaIndex(Math.max(0, newCount - 1));
    }
  };

  const handleBhakthaChange = (index: number, field: string, value: string | number) => {
    const updated = [...bhakthas];
    updated[index] = { ...updated[index], [field]: value };
    setBhakthas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption || !date) {
      toast({
        title: "Missing information",
        description: "Please select darshan type and date",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const validation = bookingSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    // Validate bhaktha details
    for (let i = 0; i < bhakthas.length; i++) {
      const bhakthaValidation = bhakthaSchema.safeParse({
        ...bhakthas[i],
        age: Number(bhakthas[i].age) || 0,
      });
      if (!bhakthaValidation.success) {
        const firstError = bhakthaValidation.error.errors[0];
        toast({
          title: `Bhaktha ${i + 1} Validation Error`,
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book darshan",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const selectedDarshan = darshanOptions.find(opt => opt.type === selectedOption);
      
      // Generate cryptographically secure invoice number
      const randomBytes = new Uint8Array(8);
      crypto.getRandomValues(randomBytes);
      const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const invoiceNumber = `INV-${format(new Date(), "yyyyMMdd")}-${randomHex.substring(0, 12).toUpperCase()}`;

      const { data: booking, error } = await supabase
        .from("darshan_bookings")
        .insert({
          user_id: user.id,
          temple_id: templeId,
          darshan_type: selectedOption,
          amount_paid: selectedDarshan?.price || 0,
          darshan_date: format(date, "yyyy-MM-dd"),
          darshan_time: time,
          invoice_number: invoiceNumber,
          customer_name: validation.data.name,
          customer_email: validation.data.email,
          customer_phone: validation.data.phone,
          status: "awaiting",
          number_of_tickets: numberOfTickets,
          bhaktha_details: bhakthas.map(b => ({
            name: b.name,
            age: Number(b.age),
            contact: b.contact || "",
          })),
          main_bhaktha_index: mainBhakthaIndex,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking created!",
        description: "Your darshan booking has been created",
      });

      // If free darshan, go directly to ticket
      if (selectedOption === "free") {
        navigate(`/darshan/ticket/${booking.id}`);
      } else {
        // For paid options, go to payment page
        navigate(`/darshan/payment/${booking.id}`);
      }
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!temple) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            Book Darshan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{temple.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Darshan Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Darshan Type</CardTitle>
              <CardDescription>Choose the darshan package that suits you best</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {darshanOptions.map((option) => (
                <Card
                  key={option.type}
                  className={`cursor-pointer transition-all ${
                    selectedOption === option.type
                      ? "ring-2 ring-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedOption(option.type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                        <p className="text-2xl font-bold text-primary mt-2">
                          ₹{option.price}
                          {option.price === 0 && <span className="text-sm text-muted-foreground ml-2">(Free)</span>}
                        </p>
                      </div>
                      {selectedOption === option.type && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Darshan Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Darshan Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tickets">Number of Tickets</Label>
                <Input
                  id="tickets"
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfTickets}
                  onChange={(e) => handleTicketChange(Number(e.target.value))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Bhaktha Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bhaktha Details</CardTitle>
              <CardDescription>Please provide details for all bhakthas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bhakthas.map((bhaktha, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Bhaktha {index + 1}</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mainBhaktha"
                        checked={mainBhakthaIndex === index}
                        onChange={() => setMainBhakthaIndex(index)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">Main Bhaktha</span>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`bhaktha-name-${index}`}>Name *</Label>
                      <Input
                        id={`bhaktha-name-${index}`}
                        required
                        value={bhaktha.name}
                        onChange={(e) => handleBhakthaChange(index, "name", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`bhaktha-age-${index}`}>Age *</Label>
                      <Input
                        id={`bhaktha-age-${index}`}
                        type="number"
                        min="1"
                        max="150"
                        required
                        value={bhaktha.age || ""}
                        onChange={(e) => handleBhakthaChange(index, "age", Number(e.target.value))}
                        placeholder="Age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`bhaktha-contact-${index}`}>Contact</Label>
                      <Input
                        id={`bhaktha-contact-${index}`}
                        value={bhaktha.contact}
                        onChange={(e) => handleBhakthaChange(index, "contact", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  {mainBhakthaIndex === index && (
                    <p className="text-xs text-primary">
                      ✓ Confirmation and contact will be sent to this bhaktha
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="sacred"
            size="lg"
            className="w-full"
            disabled={loading || !selectedOption || !date}
          >
            {loading ? "Processing..." : "Proceed to Book"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DarshanBooking;
