import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Markdown } from '@/components/ui/markdown';
import { Heart, ExternalLink, Bot, ArrowLeft, Calendar, User, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';
import { FollowButton } from '@/components/social/FollowButton';
import { DiscordIcon } from '@/components/icons/DiscordIcon';

interface BotDetailData {
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
  owner: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

const BotDetail = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bot, setBot] = useState<BotDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canVote, setCanVote] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  // Helper function to get the correct Discord bot avatar URL
  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    // If the URL is the default app-icons/CLIENT_ID/icon.png format, it means no custom avatar
    // These URLs will 404 if the bot doesn't have a custom avatar set
    if (!avatarUrl || 
        avatarUrl.includes('/app-icons/') && avatarUrl.endsWith('/icon.png')) {
      return null; // Use fallback icon
    }
    return avatarUrl;
  };

  useEffect(() => {
    if (botId) {
      fetchBot();
      if (user) {
        checkVoteEligibility();
        fetchUserReview();
      }
    }
  }, [botId, user]);

  const fetchBot = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          owner:profiles!bots_owner_id_fkey (
            id,
            username,
            avatar_url
          ),
          bot_tags (
            tag:tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('id', botId)
        .eq('status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching bot:', error);
        navigate('/');
        return;
      }

      if (data) {
        const transformedBot: BotDetailData = {
          ...data,
          owner: data.owner,
          tags: data.bot_tags?.map((bt: any) => bt.tag) || [],
        };
        setBot(transformedBot);
      }
    } catch (error) {
      console.error('Error fetching bot:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteEligibility = async () => {
    if (!user || !botId) return;

    try {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      console.log('Checking vote eligibility for user:', user.id, 'bot:', botId, 'cutoff:', twelveHoursAgo.toISOString());

      // First check if there are ANY votes for this user-bot combination
      const { data: allVotes, error: allVotesError } = await supabase
        .from('votes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (allVotesError) {
        console.error('Error checking all votes:', allVotesError);
        return;
      }

      console.log('All votes for this user-bot:', allVotes);

      // Then check for recent votes (within 12 hours)
      const { data: recentVotes, error } = await supabase
        .from('votes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .gt('created_at', twelveHoursAgo.toISOString());

      if (error) {
        console.error('Error checking vote eligibility:', error);
        return;
      }

      console.log('Recent votes found:', recentVotes);
      setCanVote(recentVotes.length === 0);
    } catch (error) {
      console.error('Error checking vote eligibility:', error);
    }
  };

  const handleVote = async () => {
    if (!user || !bot) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote for bots.",
        variant: "destructive",
      });
      return;
    }

    if (!canVote) {
      toast({
        title: "Vote limit reached",
        description: "You can only vote for this bot once every 12 hours.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);

    try {
      // Check if a vote already exists for this user-bot combination
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('bot_id', bot.id)
        .maybeSingle();

      let voteError;
      
      if (existingVote) {
        // Update the existing vote's timestamp
        const { error } = await supabase
          .from('votes')
          .update({ created_at: new Date().toISOString() })
          .eq('id', existingVote.id);
        voteError = error;
      } else {
        // Insert a new vote
        const { error } = await supabase
          .from('votes')
          .insert([{ user_id: user.id, bot_id: bot.id }]);
        voteError = error;
      }

      if (voteError) throw voteError;

      const { error: updateError } = await supabase
        .from('bots')
        .update({ votes: bot.votes + 1 })
        .eq('id', bot.id);

      if (updateError) throw updateError;

      setBot(prev => prev ? { ...prev, votes: prev.votes + 1 } : null);
      setCanVote(false);

      toast({
        title: "Vote recorded!",
        description: `You voted for ${bot.name}. You can vote again in 12 hours.`,
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error voting",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user || !botId) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user review:', error);
        return;
      }

      setUserReview(data);
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleReviewSubmitted = () => {
    fetchUserReview();
    setReviewsRefreshTrigger(prev => prev + 1);
  };

  const handleInvite = () => {
    if (bot) {
      window.open(bot.invite_url, '_blank');
    }
  };

  const handleSupport = () => {
    if (bot?.support_server_url) {
      window.open(bot.support_server_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bot details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Bot not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Bots
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bot Header */}
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} 
                      alt={`${bot.name} avatar`}
                      onError={(e) => {
                        console.error('Failed to load bot avatar:', bot.avatar_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback>
                      <Bot className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold gradient-text">{bot.name}</h1>
                    <div className="text-muted-foreground mt-2">
                      <Markdown content={bot.short_description} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {bot.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>About this Bot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed">
                  <Markdown content={bot.long_description} />
                </div>
              </CardContent>
            </Card>

            {/* Bot Information */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Bot Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bot ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{bot.client_id}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Added</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ReviewForm 
                  botId={bot.id} 
                  onReviewSubmitted={handleReviewSubmitted}
                  existingReview={userReview}
                />
                <Separator />
                <ReviewsList 
                  botId={bot.id} 
                  refreshTrigger={reviewsRefreshTrigger}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleInvite} className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Invite Bot
                </Button>
                {bot.support_server_url && (
                  <Button
                    variant="outline"
                    onClick={handleSupport}
                    className="w-full"
                  >
                    <DiscordIcon className="w-4 h-4 mr-1" />
                    Support Server
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleVote}
                  disabled={!canVote || isVoting}
                  className="w-full"
                >
                  <Heart className={`w-4 h-4 mr-1 ${isVoting ? 'animate-pulse' : ''}`} />
                  {isVoting ? 'Voting...' : canVote ? 'Vote' : 'Vote Cooldown'} ({bot.votes})
                </Button>
              </CardContent>
            </Card>

            {/* Owner */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={bot.owner.avatar_url} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{bot.owner.username}</p>
                      <p className="text-sm text-muted-foreground">Bot Owner</p>
                    </div>
                  </div>
                  {user && user.id !== bot.owner.id && (
                    <FollowButton userId={bot.owner.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotDetail;