import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Crown, CreditCard, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Bot {
  id: string;
  name: string;
  avatar_url?: string;
  short_description: string;
  client_id: string;
  status: string;
}

interface FeatureBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PremiumPlan = 'monthly' | 'yearly';

const planOptions: Array<{
  value: PremiumPlan;
  title: string;
  price: string;
  subtitle: string;
}> = [
  {
    value: 'monthly',
    title: 'Monthly',
    price: '€4.99',
    subtitle: '1 month of premium visibility',
  },
  {
    value: 'yearly',
    title: 'Yearly',
    price: '€45.00',
    subtitle: '12 months of premium visibility',
  },
];

export const FeatureBotModal = ({ open, onOpenChange }: FeatureBotModalProps) => {
  const [userBots, setUserBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [plan, setPlan] = useState<PremiumPlan>('monthly');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchUserBots();
    }
  }, [open, user]);

  const fetchUserBots = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('bots')
        .select('id, name, avatar_url, short_description, client_id, status')
        .eq('owner_id', profile.id)
        .eq('status', 'approved');

      if (error) throw error;
      setUserBots(data || []);
    } catch (error: any) {
      console.error('Error fetching user bots:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load your bots. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return null;
  };

  const handlePurchase = async () => {
    if (!selectedBot || !user) return;

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-premium-checkout', {
        body: {
          botId: selectedBot.id,
          plan,
          returnUrl: window.location.origin + '/premium-success?session_id={CHECKOUT_SESSION_ID}'
        }
      });

      if (error) throw error;

      window.open(data.url, '_blank');

      toast({
        title: 'Redirecting to payment...',
        description: 'Complete your payment to feature your bot!',
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error Creating Checkout Session',
        description: error.message || 'Failed to create checkout session.',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const selectedPlan = planOptions.find((option) => option.value === plan)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Feature Your Bot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Premium Featured Listing</h3>
            <p className="text-muted-foreground mb-4">
              Get your bot featured at the top of the directory for maximum visibility
            </p>
            <div className="text-3xl font-bold text-primary">{selectedPlan.price}</div>
            <p className="text-sm text-muted-foreground">{selectedPlan.subtitle}</p>
          </div>

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
                </button>
              ))}
            </div>
          </div>

          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Please log in to feature your bots</p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your bots...</p>
            </div>
          ) : userBots.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                You don't have any approved bots to feature yet.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-semibold mb-3">Select a bot to feature:</h4>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {userBots.map((bot) => (
                    <Card
                      key={bot.id}
                      className={`cursor-pointer transition-all ${
                        selectedBot?.id === bot.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedBot(bot)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{bot.name}</h5>
                          <p className="text-sm text-muted-foreground truncate">
                            {bot.short_description}
                          </p>
                        </div>
                        <Badge variant="secondary">Approved</Badge>
                        {selectedBot?.id === bot.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={!selectedBot || purchasing}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Featured Listing
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
