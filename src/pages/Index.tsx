import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      } else {
        setIsLoading(false);
      }
    });
  }, [navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Leaf className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Carbon Footprint Calculator</CardTitle>
          <CardDescription className="text-base">
            Track and reduce your environmental impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Features:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Calculate your monthly carbon footprint</li>
              <li>• Track electricity, fuel, travel, and waste</li>
              <li>• Save and view calculation history</li>
              <li>• Get tips to reduce emissions</li>
            </ul>
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
