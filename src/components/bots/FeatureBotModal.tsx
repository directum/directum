import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Crown, CreditCard } from 'lucide-react';
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

export const FeatureBotModal = ({ open, onOpenChange }: FeatureBotModalProps) => {
  const [userBots, setUserBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
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
    } catch (error) {
      console.error('Error fetching user bots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your bots',
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
          returnUrl: window.location.origin + '/premium-success'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: 'Redirecting to payment...',
        description: 'Complete your payment to feature your bot!',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start payment process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

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
            <div className="text-3xl font-bold text-primary">£10.00</div>
            <p className="text-sm text-muted-foreground">30-day featured listing</p>
          </div>

          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Please log in to feature your bots</p>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
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