import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import CalculationHistory from "@/components/CalculationHistory";

const Calculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const [electricity, setElectricity] = useState("");
  const [fuel, setFuel] = useState("");
  const [travel, setTravel] = useState("");
  const [waste, setWaste] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const calculateCarbon = () => {
    // Simple carbon calculation formula
    // Electricity: 0.5 kg CO2 per kWh
    // Fuel: 2.3 kg CO2 per liter
    // Travel: 0.2 kg CO2 per km
    // Waste: 0.5 kg CO2 per kg

    const electricityCarbon = (parseFloat(electricity) || 0) * 0.5;
    const fuelCarbon = (parseFloat(fuel) || 0) * 2.3;
    const travelCarbon = (parseFloat(travel) || 0) * 0.2;
    const wasteCarbon = (parseFloat(waste) || 0) * 0.5;

    const total = electricityCarbon + fuelCarbon + travelCarbon + wasteCarbon;
    return total;
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      const totalCarbon = calculateCarbon();
      setResult(totalCarbon);

      if (user) {
        const { error } = await supabase.from("calculations").insert({
          user_id: user.id,
          electricity_kwh: parseFloat(electricity) || null,
          fuel_liters: parseFloat(fuel) || null,
          travel_km: parseFloat(travel) || null,
          waste_kg: parseFloat(waste) || null,
          total_carbon_kg: totalCarbon,
        });

        if (error) throw error;

        toast({
          title: "Calculation saved!",
          description: "Your carbon footprint has been recorded.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setElectricity("");
    setFuel("");
    setTravel("");
    setWaste("");
    setResult(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Carbon Footprint Calculator</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Usage</CardTitle>
              <CardDescription>
                Fill in your monthly usage data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="electricity">Electricity Usage (kWh)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 250"
                    value={electricity}
                    onChange={(e) => setElectricity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Consumption (Liters)</Label>
                  <Input
                    id="fuel"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel">Travel Distance (km)</Label>
                  <Input
                    id="travel"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={travel}
                    onChange={(e) => setTravel(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waste">Waste Produced (kg)</Label>
                  <Input
                    id="waste"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 20"
                    value={waste}
                    onChange={(e) => setWaste(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isCalculating}>
                    {isCalculating ? "Calculating..." : "Calculate"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {result !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Result</CardTitle>
                  <CardDescription>Monthly carbon footprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <p className="text-4xl font-bold text-primary">
                      {result.toFixed(2)} kg
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      CO₂ emissions per month
                    </p>
                    {result > 0 && (
                      <div className="mt-4 text-left space-y-2 text-sm">
                        <p className="font-medium">Tips to reduce:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Use energy-efficient appliances</li>
                          <li>Consider public transport</li>
                          <li>Reduce, reuse, and recycle waste</li>
                          <li>Switch to renewable energy</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <CalculationHistory userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
