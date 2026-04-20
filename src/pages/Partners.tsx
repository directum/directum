import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BotCard } from '@/components/bots/BotCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();

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
      </div>
    </div>
  );
};

export default Partners;