import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Markdown } from '@/components/ui/markdown';
import { Copy, ExternalLink, Share2, Bot } from 'lucide-react';
import { DiscordIcon } from '@/components/icons/DiscordIcon';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  discord_id: string;
}

interface UserBot {
  id: string;
  name: string;
  avatar_url: string | null;
  short_description: string;
  long_description: string;
  votes: number;
  invite_url: string;
  support_server_url: string | null;
  status: string;
  created_at: string;
  tags: Array<{ name: string; color: string }>;
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bots, setBots] = useState<UserBot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, discord_id')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        navigate('/404');
        return;
      }

      setProfile(profileData);

      // Fetch user's approved bots with tags
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select(`
          id,
          name,
          avatar_url,
          short_description,
          long_description,
          votes,
          invite_url,
          support_server_url,
          status,
          created_at,
          bot_tags!inner(
            tags!inner(
              name,
              color
            )
          )
        `)
        .eq('owner_id', userId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (botsError) {
        console.error('Error fetching bots:', botsError);
      } else {
        const formattedBots = botsData?.map(bot => ({
          ...bot,
          tags: bot.bot_tags?.map((bt: any) => bt.tags) || []
        })) || [];
        setBots(formattedBots);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBotAvatarUrl = (bot: UserBot) => {
    if (bot.avatar_url?.startsWith('http')) {
      return bot.avatar_url;
    }
    return bot.avatar_url ? `/lovable-uploads/${bot.avatar_url}` : '/placeholder.svg';
  };

  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.username}'s Discord Bots`,
          text: `Check out ${profile?.username}'s Discord bots on Directum`,
          url: profileUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: "Profile link copied!",
          description: "Share this link with others to show them this profile.",
        });
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Profile link copied!",
        description: "Share this link with others to show them this profile.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <Button onClick={() => navigate('https://directium.org')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  <p className="text-muted-foreground">
                    {bots.length} published bot{bots.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button onClick={handleShareProfile} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Published Bots */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Published Bots</h2>
          
          {bots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {profile.username} hasn't published any bots yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <Card key={bot.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getBotAvatarUrl(bot)} />
                        <AvatarFallback>{bot.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {bot.votes} votes
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      <Markdown content={bot.short_description} />
                    </div>
                    
                    {bot.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bot.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {bot.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{bot.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/bot/${bot.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {bot.support_server_url && (
                        <Button
                          onClick={() => window.open(bot.support_server_url!, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <DiscordIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
