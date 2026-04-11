import { useState, useEffect } from 'react';
import { BotCard } from './BotCard';
import { FeatureBotModal } from './FeatureBotModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Star, Zap } from 'lucide-react';

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

interface PremiumListingsProps {
  onVote: (botId: string) => Promise<void>;
  userVotes: Set<string>;
  votingStates: Set<string>;
}

export const PremiumListings = ({ 
  onVote, 
  userVotes, 
  votingStates 
}: PremiumListingsProps) => {
  const [premiumBots, setPremiumBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  useEffect(() => {
    fetchPremiumBots();
  }, []);

  const fetchPremiumBots = async () => {
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
        .not('featured_until', 'is', null)
        .gte('featured_until', new Date().toISOString())
        .order('votes', { ascending: false })
        .limit(6);

      if (error) throw error;

      const transformedBots = data?.map(bot => ({
        ...bot,
        owner: bot.profiles,
        tags: bot.bot_tags.map((bt: any) => bt.tags),
      })) || [];

      setPremiumBots(transformedBots);
    } catch (error) {
      console.error('Error fetching premium bots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Show preview section even when no premium bots exist
  if (premiumBots.length === 0) {
    return (
      <div className="mb-12">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50" />
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Premium Featured Bots
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Top-quality bots from verified developers
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="border-primary/50 hover:bg-primary/10"
                onClick={() => setShowFeatureModal(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Get Featured
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg inline-block mb-4">
                <Crown className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Be the First Featured Bot!</h3>
              <p className="text-muted-foreground mb-6">
                Get your bot featured here for maximum visibility and reach thousands of Discord users.
              </p>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary text-white"
                onClick={() => setShowFeatureModal(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Purchase Premium Listing
              </Button>
            </div>
          </CardContent>
        </Card>
        <FeatureBotModal 
          open={showFeatureModal} 
          onOpenChange={setShowFeatureModal} 
        />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        {/* Premium Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  Premium Featured Bots
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Top-quality bots from verified developers
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-primary/50 hover:bg-primary/10"
              onClick={() => setShowFeatureModal(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Get Featured
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumBots.map((bot) => (
              <div key={bot.id} className="relative">
                {/* Premium Badge Overlay */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
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
      <FeatureBotModal 
        open={showFeatureModal} 
        onOpenChange={setShowFeatureModal} 
      />
    </div>
  );
};