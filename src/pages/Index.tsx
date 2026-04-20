import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { BotCard } from '@/components/bots/BotCard';
import { BotForm } from '@/components/bots/BotForm';
import { AdvancedFilters } from '@/components/discovery/AdvancedFilters';
import { BotComparison } from '@/components/discovery/BotComparison';
import { DiscoverySection } from '@/components/discovery/DiscoverySection';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { FeaturedPartners } from '@/components/bots/FeaturedPartners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Star, Users, Search, GitCompare, Activity, AlertTriangle, AlertOctagon, X } from 'lucide-react';

interface BotFromDB {
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
  profiles: {
    username: string;
    avatar_url?: string;
  };
  bot_tags: Array<{
    tags: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  bot_categories: Array<{
    categories: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

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
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBotForm, setShowBotForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [votingStates, setVotingStates] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [comparisonBots, setComparisonBots] = useState<Bot[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    language: 'all',
    serverCount: [0] as [number],
    permissions: [] as string[],
    featured: false,
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const { toast } = useToast();
  const [siteAlert, setSiteAlert] = useState<any>(null);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  useEffect(() => {
    fetchBots();
    fetchCategories();
    if (user) {
      fetchUserVotes();
    }
    
    // Load alert from localStorage
    try {
      const stored = localStorage.getItem('site_alert');
      if (stored) {
        setSiteAlert(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load alert:', error);
    }
  }, [user]);

  useEffect(() => {
    // Listen for bot removal events
    const handleBotRemoved = (event: CustomEvent) => {
      console.log('Bot removed event received:', event.detail);
      // Remove the bot from the local state immediately
      setBots(prev => prev.filter(bot => bot.id !== event.detail.botId));
      toast({
        title: "Bot Removed",
        description: `${event.detail.botName} has been removed from the platform.`,
      });
    };

    window.addEventListener('botRemoved', handleBotRemoved as EventListener);
    
    return () => {
      window.removeEventListener('botRemoved', handleBotRemoved as EventListener);
    };
  }, [toast]);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          profiles:owner_id (username, avatar_url),
          bot_tags (
            tags (id, name, color)
          ),
          bot_categories (
            categories (id, name, color)
          )
        `)
        .eq('status', 'approved')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedBots = (data as BotFromDB[])?.map(bot => ({
        ...bot,
        owner: bot.profiles,
        tags: bot.bot_tags.map(bt => bt.tags),
        categories: bot.bot_categories?.map(bc => bc.categories) || [],
      })) || [];

      setBots(transformedBots);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading bots",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('bot_id, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter votes that are within the last 12 hours
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const recentVotes = data?.filter(vote => 
        new Date(vote.created_at) > twelveHoursAgo
      ) || [];

      setUserVotes(new Set(recentVotes.map(vote => vote.bot_id)));
    } catch (error: any) {
      console.error('Failed to fetch user votes:', error);
    }
  };

  const handleVote = async (botId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to vote for bots",
      });
      return;
    }

    if (userVotes.has(botId)) {
      toast({
        variant: "destructive",
        title: "Already Voted",
        description: "You can only vote for a bot once every 12 hours",
      });
      return;
    }

    setVotingStates(prev => new Set([...prev, botId]));

    try {
      // Check if user has voted recently (within 12 hours)
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const { data: existingVotes, error: voteCheckError } = await supabase
        .from('votes')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .gte('created_at', twelveHoursAgo.toISOString());

      if (voteCheckError) throw voteCheckError;

      if (existingVotes && existingVotes.length > 0) {
        toast({
          variant: "destructive",
          title: "Already Voted",
          description: "You can only vote for a bot once every 12 hours",
        });
        return;
      }

      // Insert new vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert({ user_id: user.id, bot_id: botId });

      if (insertError) throw insertError;

      // Update bot votes count
      const currentBot = bots.find(b => b.id === botId);
      const { error: updateError } = await supabase
        .from('bots')
        .update({ votes: (currentBot?.votes || 0) + 1 })
        .eq('id', botId);

      if (updateError) throw updateError;

      // Update local state
      setBots(prev => 
        prev.map(bot => 
          bot.id === botId 
            ? { ...bot, votes: bot.votes + 1 }
            : bot
        )
      );

      setUserVotes(prev => new Set([...prev, botId]));

      toast({
        title: "Voted!",
        description: "Thanks for voting!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Voting",
        description: error.message || "Failed to vote",
      });
    } finally {
      setVotingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(botId);
        return newSet;
      });
    }
  };

  const addToComparison = (bot: Bot) => {
    if (comparisonBots.length >= 5) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 5 bots at once",
        variant: "destructive",
      });
      return;
    }
    
    if (comparisonBots.find(b => b.id === bot.id)) {
      toast({
        title: "Already in comparison",
        description: "This bot is already selected for comparison",
        variant: "destructive",
      });
      return;
    }
    
    setComparisonBots(prev => [...prev, bot]);
    toast({
      title: "Added to comparison",
      description: `${bot.name} added to comparison (${comparisonBots.length + 1}/5)`,
    });
  };

  const removeFromComparison = (botId: string) => {
    setComparisonBots(prev => prev.filter(b => b.id !== botId));
  };

  const applyFilters = (bots: Bot[]) => {
    return bots.filter(bot => {
      // Search query filter
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (!bot.categories.some(cat => cat.id === filters.category)) return false;
      }

      // Language filter
      if (filters.language && filters.language !== 'all') {
        if (bot.language !== filters.language) return false;
      }

      // Server count filter
      if (filters.serverCount[0] > 0) {
        if (!bot.server_count || bot.server_count < filters.serverCount[0]) return false;
      }

      // Featured filter
      if (filters.featured) {
        if (!bot.featured) return false;
      }

      // Permissions filter
      if (filters.permissions.length > 0) {
        if (!bot.permissions || !filters.permissions.every(p => bot.permissions?.includes(p))) return false;
      }

      return true;
    });
  };

  const filteredBots = applyFilters(bots);


  return (
    <div className="min-h-screen bg-background font-nunito">
      <Navbar 
        onAddBot={() => setShowBotForm(true)}
      />
      
      {/* Site Alert Banner */}
      {siteAlert && !dismissedAlert && (
        <div className={`border-b ${
          siteAlert.type === 'warning'
            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
            : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <div>
                {siteAlert.type === 'warning' ? (
                  <AlertTriangle className={`h-5 w-5 ${siteAlert.type === 'warning' ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-600 dark:text-red-500'}`} />
                ) : (
                  <AlertOctagon className={`h-5 w-5 text-red-600 dark:text-red-500`} />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  siteAlert.type === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-200'
                    : 'text-red-900 dark:text-red-200'
                }`}>
                  {siteAlert.message}
                </p>
              </div>
              <button
                onClick={() => setDismissedAlert(true)}
                className={`flex-shrink-0 ${
                  siteAlert.type === 'warning'
                    ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-500'
                    : 'text-red-600 hover:text-red-700 dark:text-red-500'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section with Bubbly Design */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16 animate-fade-in">
          <div className="floating-animation">
            <h1 className="text-6xl md:text-7xl font-black gradient-text font-fredoka leading-tight">
              Discover Amazing Discord Bots!
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Find the perfect bots to make your Discord server more fun, engaging, and awesome! ✨
          </p>
          
          {/* Bubbly Stats Cards */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            <div className="bubble-gradient rounded-3xl p-6 soft-shadow bounce-gentle">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-left text-white">
                  <div className="text-2xl font-bold">{bots.length}</div>
                  <div className="text-sm opacity-90">Amazing Bots</div>
                </div>
              </div>
            </div>
            
            <div className="bubble-gradient rounded-3xl p-6 soft-shadow bounce-gentle" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-left text-white">
                  <div className="text-2xl font-bold">{bots.reduce((sum, bot) => sum + bot.votes, 0)}</div>
                  <div className="text-sm opacity-90">Happy Votes</div>
                </div>
              </div>
            </div>
            
            <div className="bubble-gradient rounded-3xl p-6 soft-shadow bounce-gentle" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left text-white">
                  <div className="text-2xl font-bold">Active</div>
                  <div className="text-sm opacity-90">Community</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
        {/* Main Content Container */}
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="flex justify-center mb-12">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60 z-10 pointer-events-none" />
              <Input
                placeholder="Search amazing bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-2xl bg-card/50 backdrop-blur-sm"
              />
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex justify-center mb-8">
            <AdvancedFilters
              isOpen={showAdvancedFilters}
              onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>

          {/* Premium Listings Section */}
          <FeaturedPartners
            onVote={handleVote}
            userVotes={userVotes}
            votingStates={votingStates}
          />

          {/* Comparison Bar */}
          {comparisonBots.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="bg-card border rounded-lg p-4 shadow-lg max-w-4xl w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5" />
                    <span className="font-medium">
                      Comparing {comparisonBots.length} bot{comparisonBots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(true)}
                      disabled={comparisonBots.length < 2}
                    >
                      Compare Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setComparisonBots([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {comparisonBots.map((bot) => (
                    <div key={bot.id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                      <span className="truncate max-w-20">{bot.name}</span>
                      <button
                        onClick={() => removeFromComparison(bot.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Discovery Section - Show when no search query */}
          {!searchQuery && (
            <div className="mb-16">
              <DiscoverySection />
            </div>
          )}

          {/* Main Bot Grid Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results (${filteredBots.length})` : 'All Bots'}
            </h2>
            <div className="flex items-center gap-2">
              {comparisonBots.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  disabled={comparisonBots.length < 2}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare ({comparisonBots.length})
                </Button>
              )}
            </div>
          </div>

          {/* Bot Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bubble-gradient rounded-full p-6 mb-6 pulse-glow">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
              <p className="text-xl font-semibold text-muted-foreground font-fredoka">
                Loading amazing bots... ✨
              </p>
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="text-center py-20">
              <div className="bubble-gradient rounded-full p-8 w-24 h-24 mx-auto mb-8 floating-animation">
              </div>
              <h3 className="text-2xl font-bold mb-4 font-fredoka">
                {searchQuery ? 'Oops! No bots found 🔍' : 'Ready to add the first bot? 🚀'}
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try a different search term or explore our amazing collection!' 
                  : 'Be a pioneer and share your awesome bot with the community!'
                }
              </p>
              {!searchQuery && user && (
                <Button 
                  onClick={() => setShowBotForm(true)}
                  className="bubbly-button text-white font-bold text-lg px-8 py-4"
                >
                  🎉 Add the First Bot!
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredBots.map((bot, index) => (
                <div 
                  key={bot.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BotCard
                    bot={bot}
                    onVote={handleVote}
                    canVote={!userVotes.has(bot.id)}
                    isVoting={votingStates.has(bot.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partnership Footer */}
        <div className="py-8 pb-24 text-center border-t border-border mt-16">
          <p className="text-muted-foreground text-sm">
            Working in partnership with Soulnet and Ghostlabs
          </p>
        </div>

      {/* Bot Form Modal */}
      {showBotForm && (
        <BotForm
          onClose={() => setShowBotForm(false)}
          onSuccess={() => fetchBots()}
        />
      )}

      {/* Bot Comparison Modal */}
      <BotComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        bots={comparisonBots}
        onRemoveBot={removeFromComparison}
      />
    </div>
  );
};

export default Index;
