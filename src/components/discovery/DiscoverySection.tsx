import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Star, Users, Shuffle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Bot {
  id: string;
  name: string;
  short_description: string;
  avatar_url?: string;
  client_id: string;
  votes: number;
  created_at: string;
  updated_at: string;
  featured: boolean;
  server_count?: number;
  owner: {
    username: string;
    avatar_url?: string;
  };
  tags?: Array<{ name: string; color: string }>;
}

interface DiscoverySectionProps {
  onBotClick?: (bot: Bot) => void;
}

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({ onBotClick }) => {
  const [featuredBots, setFeaturedBots] = useState<Bot[]>([]);
  const [trendingBots, setTrendingBots] = useState<Bot[]>([]);
  const [recentBots, setRecentBots] = useState<Bot[]>([]);
  const [randomBot, setRandomBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiscoveryData();
  }, []);

  const fetchDiscoveryData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchFeaturedBots(),
        fetchTrendingBots(),
        fetchRecentBots(),
        fetchRandomBot(),
      ]);
    } catch (error) {
      console.error('Error fetching discovery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_url
          ),
          bot_tags!inner (
            tags!inner (
              name,
              color
            )
          )
        `)
        .eq('status', 'approved')
        .eq('featured', true)
        .order('featured_until', { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedBots = data?.map(bot => ({
        ...bot,
        tags: bot.bot_tags?.map(bt => bt.tags) || [],
      })) || [];

      setFeaturedBots(formattedBots);
    } catch (error) {
      console.error('Error fetching featured bots:', error);
    }
  };

  const fetchTrendingBots = async () => {
    try {
      // Get bots with votes in the last 7 days to determine trending
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_url
          ),
          bot_tags (
            tags (
              name,
              color
            )
          )
        `)
        .eq('status', 'approved')
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('votes', { ascending: false })
        .limit(4);

      if (error) throw error;

      const formattedBots = data?.map(bot => ({
        ...bot,
        tags: bot.bot_tags?.map(bt => bt.tags) || [],
      })) || [];

      setTrendingBots(formattedBots);
    } catch (error) {
      console.error('Error fetching trending bots:', error);
    }
  };

  const fetchRecentBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_url
          ),
          bot_tags (
            tags (
              name,
              color
            )
          )
        `)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      const formattedBots = data?.map(bot => ({
        ...bot,
        tags: bot.bot_tags?.map(bt => bt.tags) || [],
      })) || [];

      setRecentBots(formattedBots);
    } catch (error) {
      console.error('Error fetching recent bots:', error);
    }
  };

  const fetchRandomBot = async () => {
    try {
      // Get total count first
      const { count } = await supabase
        .from('bots')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (!count || count === 0) return;

      // Generate random offset
      const randomOffset = Math.floor(Math.random() * count);

      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_url
          ),
          bot_tags (
            tags (
              name,
              color
            )
          )
        `)
        .eq('status', 'approved')
        .range(randomOffset, randomOffset)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const bot = {
          ...data[0],
          tags: data[0].bot_tags?.map(bt => bt.tags) || [],
        };
        setRandomBot(bot);
      }
    } catch (error) {
      console.error('Error fetching random bot:', error);
    }
  };

  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `https://cdn.discordapp.com/app-icons/${clientId}/${avatarUrl}.png`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Featured Section Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Other sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Bots */}
      {featuredBots.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Featured Bots</h2>
            <Badge variant="secondary" className="ml-2">
              Staff Picks
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBots.map((bot) => (
              <Card key={bot.id} className="hover-scale transition-all duration-300 hover:shadow-xl border-2 border-yellow-500/20">
                <CardHeader className="relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-yellow-50">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-16 w-16 border-2 border-yellow-500/30">
                      <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                      <AvatarFallback className="text-lg">{bot.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{bot.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {bot.owner.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{bot.votes}</span>
                        </div>
                        {bot.server_count && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">{formatNumber(bot.server_count)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {bot.short_description}
                  </p>
                  {bot.tags && bot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {bot.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag.name} 
                          variant="outline"
                          style={{ borderColor: tag.color, color: tag.color }}
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <Link to={`/bot/${bot.id}`}>
                      View Bot
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Bots */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold">Trending This Week</h3>
          </div>
          <div className="space-y-3">
            {trendingBots.map((bot, index) => (
              <Card key={bot.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-500 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                      <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link to={`/bot/${bot.id}`} className="font-medium hover:underline truncate block">
                        {bot.name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">
                        {bot.short_description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>{bot.votes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recently Updated */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Recently Updated</h3>
          </div>
          <div className="space-y-3">
            {recentBots.map((bot) => (
              <Card key={bot.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                      <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link to={`/bot/${bot.id}`} className="font-medium hover:underline truncate block">
                        {bot.name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">
                        by {bot.owner.username}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(bot.updated_at)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{bot.votes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Random Discovery */}
      {randomBot && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-purple-500" />
              <h3 className="text-xl font-semibold">Discover Something Random</h3>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRandomBot}>
              <Shuffle className="h-4 w-4 mr-2" />
              New Random
            </Button>
          </div>
          <Card className="hover:shadow-lg transition-shadow border-2 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16 border-2 border-purple-500/30">
                  <AvatarImage src={getBotAvatarUrl(randomBot.avatar_url, randomBot.client_id)} />
                  <AvatarFallback className="text-lg">{randomBot.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold">{randomBot.name}</h4>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                      <Zap className="h-3 w-3 mr-1" />
                      Random Pick
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {randomBot.owner.username}
                  </p>
                  <p className="text-sm mb-4 line-clamp-2">
                    {randomBot.short_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{randomBot.votes} votes</span>
                      </div>
                      {randomBot.server_count && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{formatNumber(randomBot.server_count)} servers</span>
                        </div>
                      )}
                    </div>
                    <Button asChild>
                      <Link to={`/bot/${randomBot.id}`}>
                        Explore Bot
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
