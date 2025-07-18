import { useState } from "react";
import { Calendar, DollarSign, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const TravelForm = () => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateTrip = () => {
    if (!formData.startDate || !formData.endDate || !formData.budget) {
      toast.error("Please fill in all fields to generate your trip!");
      return;
    }

    toast.success("🎉 Your amazing trip is being generated!");
    // Here you would typically handle the trip generation logic
  };

  const isFormValid = formData.startDate && formData.endDate && formData.budget;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-2 border-border/50 shadow-warm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Plan Your Journey
            </h2>
            <p className="text-muted-foreground">
              Tell us your dates and budget, and we'll create the perfect itinerary
            </p>
          </div>

          <div className="space-y-6">
            {/* Travel Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="startDate" 
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  Departure Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="endDate" 
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-secondary" />
                  Return Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="bg-background border-border focus:border-secondary focus:ring-secondary/20 transition-all duration-200"
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label 
                htmlFor="budget" 
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-accent" />
                Budget (USD)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter your budget"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                className="bg-background border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                min="0"
                step="100"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Budget includes flights, accommodation & activities</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                onClick={handleGenerateTrip}
                disabled={!isFormValid}
                className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                  isFormValid
                    ? 'bg-gradient-hero hover:shadow-travel hover:scale-[1.02] active:scale-[0.98]'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Plane className="w-5 h-5 mr-2" />
                Generate My Trip
              </Button>
            </div>

            {/* Trip preview */}
            {formData.startDate && formData.endDate && formData.budget && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50 animate-slide-up">
                <h3 className="font-semibold text-foreground mb-2">Trip Preview</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>
                    📅 {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    💰 Budget: ${parseInt(formData.budget).toLocaleString()}
                  </div>
                  <div>
                    🗓️ Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};