import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Calculation {
  id: string;
  total_carbon_kg: number;
  created_at: string;
}

interface CalculationHistoryProps {
  userId: string;
}

const CalculationHistory = ({ userId }: CalculationHistoryProps) => {
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalculations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("calculations")
      .select("id, total_carbon_kg, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setCalculations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCalculations();
  }, [userId]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("calculations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete calculation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Calculation removed successfully.",
    });
    fetchCalculations();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calculations</CardTitle>
        <CardDescription>Your last 5 carbon footprint calculations</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : calculations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No calculations yet</p>
        ) : (
          <div className="space-y-2">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <p className="font-medium">{calc.total_carbon_kg.toFixed(2)} kg CO₂</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(calc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(calc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalculationHistory;
