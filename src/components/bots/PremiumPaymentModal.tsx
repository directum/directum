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

export const PremiumPaymentModal = ({ isOpen, onClose, botId, botName }: PremiumPaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
        body: { botId }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      onClose();
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  <div className="text-3xl font-bold">$10.00</div>
                  <div className="text-sm text-muted-foreground">for 30 days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              What you get:
            </h4>
            <div className="space-y-2">
              {[
                "Premium placement at the top of search results",
                "Featured badge on your bot listing",
                "Enhanced visibility for 30 days",
                "Priority in recommendation algorithms"
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