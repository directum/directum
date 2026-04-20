import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BotCard } from '@/components/bots/BotCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2, Sparkles, Zap, Star } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  avatar_url?: string;
  short_description: string;
  long_description: string;
  votes: number;
  invite_url: string;
  support_server_url?: string;
  client_id: string;
  created_at: string;
  updated_at?: string;
  featured?: boolean;
  server_count?: number;
  language?: string;
  permissions?: string[];
  owner: {
    username: string;
    avatar_url?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const Partners = () => {
  const [partners, setPartners] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [votingStates, setVotingStates] = useState<Set<string>>(new Set());
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const { toast } = useToast();

  const discordInviteUrl = 'https://discord.gg/UHeWA6mXxS';

  const openDiscord = () => {
    if (typeof globalThis !== 'undefined' && 'open' in globalThis) {
      (globalThis as unknown as { open: (url: string, target?: string) => Window | null }).open(discordInviteUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          profiles:owner_id (username, avatar_url),
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('status', 'approved')
        .eq('featured', true)
        .order('votes', { ascending: false });

      if (error) throw error;

      const transformedBots = data?.map(bot => ({
        ...bot,
        owner: bot.profiles,
        tags: bot.bot_tags?.map((bt: { tags: { id: string; name: string; color: string } }) => bt.tags) || [],
      })) || [];

      setPartners(transformedBots);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading partners",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (botId: string) => {
    // Similar vote handling as in Index.tsx
    // For brevity, I'll implement a basic version
    toast({
      title: "Voting not implemented",
      description: "Please vote from the main page",
    });
  };

  return (
    <div className="min-h-screen bg-background font-nunito">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="floating-animation">
            <h1 className="text-6xl md:text-7xl font-black gradient-text font-fredoka leading-tight">
              Our Partners
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Discover our featured partner bots that make Discord amazing! ✨
          </p>
        </div>

        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bubble-gradient rounded-full p-6 mb-6 pulse-glow">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
              <p className="text-xl font-semibold text-muted-foreground font-fredoka">
                Loading partners... ✨
              </p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-20">
              <div className="bubble-gradient rounded-full p-8 w-24 h-24 mx-auto mb-8 floating-animation">
                <Crown className="h-12 w-12 text-white mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-fredoka">
                No partners yet
              </h3>
              <p className="text-lg text-muted-foreground">
                Check back soon for amazing partner bots!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {partners.map((bot, index) => (
                <div
                  key={bot.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BotCard
                    bot={bot}
                    onVote={handleVote}
                    canVote={false} // Disable voting on partners page for simplicity
                    isVoting={votingStates.has(bot.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden shadow-[0_0_0_1px_rgba(245,158,11,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-40" />
            
            <CardHeader className="relative text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg floating-animation">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-2 justify-center">
                    Become a Partner
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Star className="h-4 w-4 mr-1" />
                      Exclusive
                    </Badge>
                  </CardTitle>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our elite partner program and get your bot featured prominently across Directum!
              </p>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                    <Crown className="h-6 w-6 text-primary mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-2">Partner Badge</h4>
                  <p className="text-sm text-muted-foreground">Exclusive partner tag for your bot</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                    <Star className="h-6 w-6 text-primary mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-2">Top Visibility</h4>
                  <p className="text-sm text-muted-foreground">Priority placement in featured sections</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                    <Zap className="h-6 w-6 text-primary mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-2">Early Access</h4>
                  <p className="text-sm text-muted-foreground">Get early access to new features</p>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                    <Sparkles className="h-6 w-6 text-primary mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-2">Community Access</h4>
                  <p className="text-sm text-muted-foreground">Exclusive partners-only Discord lounge</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg px-8 py-4 bubbly-button"
                  onClick={() => setShowPartnerModal(true)}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Apply for Partnership
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Join our Discord to start the application process
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Modal */}
        <Dialog open={showPartnerModal} onOpenChange={setShowPartnerModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Become a Partner!
              </DialogTitle>
              <DialogDescription>
                Join our Discord to apply for our partner program and unlock exclusive benefits!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span>Partner tag for your bot</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>Priority listing in the featured bots section</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Access to partners-only lounge on the Discord</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Partner role on the Discord</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>Early access to new Directum features</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPartnerModal(false)}>
                Close
              </Button>
              <Button onClick={openDiscord} className="bg-gradient-to-r from-primary to-secondary text-white">
                Join Discord
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Partners;