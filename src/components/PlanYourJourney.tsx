import { useState, useCallback, useEffect } from "react";
import { Calendar, DollarSign, Plane, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface LocationField {
  id: string;
  value: string;
  fromPin: boolean;
}

interface PlanYourJourneyProps {
  pins?: Array<{ lat: number; lng: number; name?: string }>;
}

export const PlanYourJourney: React.FC<PlanYourJourneyProps> = ({ pins = [] }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
  });

  const [locationFields, setLocationFields] = useState<LocationField[]>(() => {
    const initial: LocationField[] = pins.slice(0, 3).map((pin, index) => ({
      id: `pin-${index}`,
      value: pin.name || `Location ${pin.lat.toFixed(2)}, ${pin.lng.toFixed(2)}`,
      fromPin: true
    }));
    
    if (initial.length === 0) {
      initial.push({ id: 'manual-1', value: '', fromPin: false });
    }
    
    return initial;
  });

  // Sync location fields when map pins change
  useEffect(() => {
    setLocationFields(prev => {
      const pinFields: LocationField[] = pins.slice(0, 3).map((pin, index) => ({
        id: `pin-${index}`,
        value: pin.name || `Location ${pin.lat.toFixed(2)}, ${pin.lng.toFixed(2)}`,
        fromPin: true
      }));
      const manualFields = prev.filter(f => !f.fromPin);
      const combined = [...pinFields, ...manualFields].slice(0, 3);
      if (combined.length === 0) {
        combined.push({ id: 'manual-1', value: '', fromPin: false });
      }
      return combined;
    });
  }, [pins]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = useCallback((id: string, value: string) => {
    setLocationFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, value } : field
      )
    );
  }, []);

  const addLocationField = useCallback(() => {
    if (locationFields.length < 3) {
      const newId = `manual-${Date.now()}`;
      setLocationFields(prev => [...prev, { id: newId, value: '', fromPin: false }]);
    }
  }, [locationFields.length]);

  const removeLocationField = useCallback((id: string) => {
    setLocationFields(prev => prev.filter(field => field.id !== id));
  }, []);

  const handleGenerateTrip = () => {
    const filledLocations = locationFields.filter(field => field.value.trim());
    
    if (!formData.startDate || !formData.endDate || !formData.budget || filledLocations.length === 0) {
      toast.error("Please fill in all required fields and at least one location!");
      return;
    }

    toast.success("🎉 Your amazing trip is being generated!");
    // Here you would typically handle the trip generation logic
  };

  const isFormValid = formData.startDate && formData.endDate && formData.budget && 
                     locationFields.some(field => field.value.trim());

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-2 border-border/50 shadow-warm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Plan Your Journey
            </h2>
            <p className="text-muted-foreground">
              Tell us your dates, budget, and destinations for the perfect itinerary
            </p>
          </div>

          <div className="space-y-6">
            {/* Dynamic Location Fields */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Destinations {locationFields.length > 0 && `(${locationFields.filter(f => f.value.trim()).length})`}
              </Label>
              
              {locationFields.map((field) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder={field.fromPin ? "Location from map pin" : "Enter destination manually"}
                    value={field.value}
                    onChange={(e) => handleLocationChange(field.id, e.target.value)}
                    className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
                  />
                  {field.fromPin && (
                    <div className="flex-shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      From Map
                    </div>
                  )}
                  {!field.fromPin && locationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocationField(field.id)}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {locationFields.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLocationField}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Destination
                </Button>
              )}
            </div>

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
            {formData.startDate && formData.endDate && formData.budget && locationFields.some(f => f.value.trim()) && (
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
                  <div>
                    📍 Destinations: {locationFields.filter(f => f.value.trim()).map(f => f.value.trim()).join(', ')}
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