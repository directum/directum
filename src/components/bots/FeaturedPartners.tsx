import { useState, useEffect } from 'react';
import { BotCard } from './BotCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Star, Sparkles, Zap } from 'lucide-react';

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
  featured_until?: string;
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

interface FeaturedPartnersProps {
  onVote: (botId: string) => Promise<void>;
  userVotes: Set<string>;
  votingStates: Set<string>;
}

export const FeaturedPartners = ({ 
  onVote, 
  userVotes, 
  votingStates 
}: FeaturedPartnersProps) => {
  const [featuredBots, setFeaturedBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  const discordInviteUrl = 'https://discord.gg/yr85pkUteU';

  const openDiscord = () => {
    if (typeof globalThis !== 'undefined' && 'open' in globalThis) {
      (globalThis as unknown as { open: (url: string, target?: string) => Window | null }).open(discordInviteUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchFeaturedBots();
  }, []);

  const fetchFeaturedBots = async () => {
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
        .order('votes', { ascending: false })
        .limit(6);

      if (error) throw error;

      const transformedBots = data?.map(bot => ({
        ...bot,
        owner: bot.profiles,
        tags: bot.bot_tags?.map((bt: { tags: { id: string; name: string; color: string } }) => bt.tags) || [],
      })) || [];

      setFeaturedBots(transformedBots);
    } catch (error) {
      console.error('Error fetching featured partners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Show preview section if no featured partners exist yet
  if (featuredBots.length === 0) {
    return (
      <div className="mb-12">
        <Card className="border-2 border-yellow-400/20 bg-gradient-to-br from-yellow-50/30 to-transparent relative overflow-hidden shadow-[0_0_0_1px_rgba(245,158,11,0.15)]">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-transparent to-transparent opacity-70" />
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-lg shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Featured Bots
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Partner
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Top partner bots selected by our community.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                onClick={openDiscord}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Partner with us on Discord
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-100 rounded-lg inline-block mb-4 shadow-sm">
                <Crown className="h-12 w-12 text-yellow-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Become a Featured Partner</h3>
              <p className="text-muted-foreground mb-6">
                Connect with us on Discord to join the partner program and get top-tier visibility.
              </p>
              <ul className="space-y-2 text-left mx-auto mb-6 max-w-md text-sm text-foreground/80">
                <li>• Priority showcase in the partner section</li>
                <li>• Exclusive Discord partner support</li>
                <li>• Early access to new features</li>
              </ul>
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white"
                onClick={openDiscord}
              >
                <Zap className="h-4 w-4 mr-2" />
                Join our partner Discord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <Card className="border-2 border-yellow-400/20 bg-gradient-to-br from-yellow-50/30 to-transparent relative overflow-hidden shadow-[0_0_0_1px_rgba(245,158,11,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-transparent to-transparent opacity-70" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-lg shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  Featured Bots
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Partner
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Top partner bots selected by our community.
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
              onClick={openDiscord}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Partner with us on Discord
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="rounded-2xl border border-yellow-200/70 bg-yellow-50/70 p-5 mb-6">
            <h3 className="text-lg font-semibold mb-3">Why partner with us?</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• Priority partner placement in the featured area</li>
              <li>• Exclusive partner support and community access</li>
              <li>• Early access to new Directum features</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBots.map((bot) => (
              <div key={bot.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Partner
                  </Badge>
                </div>
                
                <BotCard
                  bot={bot}
                  onVote={onVote}
                  canVote={!userVotes.has(bot.id)}
                  isVoting={votingStates.has(bot.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};