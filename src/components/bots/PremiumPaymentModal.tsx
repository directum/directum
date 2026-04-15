import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PremiumPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId?: string;
  botName?: string;
}

type PremiumPlan = 'monthly' | 'yearly';

const planOptions: Array<{
  value: PremiumPlan;
  title: string;
  price: string;
  subtitle: string;
  description: string;
}> = [
  {
    value: 'monthly',
    title: 'Monthly',
    price: '€4.99',
    subtitle: '1 month of premium visibility',
    description: 'Perfect for a short boost in visibility.',
  },
  {
    value: 'yearly',
    title: 'Yearly',
    price: '€45.00',
    subtitle: '12 months of premium visibility',
    description: 'Best value for long-term exposure.',
  },
];

export const PremiumPaymentModal = ({ isOpen, onClose, botId, botName }: PremiumPaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PremiumPlan>('monthly');
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!botId) {
      toast({
        title: "Error",
        description: "No bot selected for premium listing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-premium-checkout', {
        body: {
          botId,
          plan,
          returnUrl: window.location.origin + '/premium-success?session_id={CHECKOUT_SESSION_ID}'
        }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      onClose();
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = planOptions.find((option) => option.value === plan)!;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Premium Listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-full w-fit mx-auto">
                  <Star className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">Feature Your Bot</h3>
                  <p className="text-muted-foreground">
                    Get maximum visibility for {botName || "your bot"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedPlan.price}</div>
                  <div className="text-sm text-muted-foreground">{selectedPlan.subtitle}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Choose your plan
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {planOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlan(option.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    plan === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{option.title}</div>
                      <div className="text-xs text-muted-foreground">{option.subtitle}</div>
                    </div>
                    <div className={`h-5 w-5 rounded-full border ${
                      plan === option.value ? 'border-primary bg-primary' : 'border-border'
                    }`} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              What you get
            </h4>
            <div className="space-y-2">
              {[
                'Premium placement at the top of search results',
                'Featured badge on your bot listing',
                'Enhanced visibility for your chosen plan length',
                'Priority exposure to more users'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
            >
              {isLoading ? "Processing..." : "Purchase Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};