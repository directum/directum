import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { PremiumPaymentModal } from '@/components/bots/PremiumPaymentModal';
import { Bot, ArrowLeft, Crown, Star, Calendar, Plus, Edit } from 'lucide-react';

interface UserBot {
  id: string;
  name: string;
  avatar_url?: string;
  short_description: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  featured_until?: string;
  created_at: string;
  bot_tags: Array<{
    tags: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

const MyBots = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userBots, setUserBots] = useState<UserBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<UserBot | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserBots();
  }, [user, navigate]);

  const fetchUserBots = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBots(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Bots",
        description: error.message || "Failed to load your bots",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumPurchase = (bot: UserBot) => {
    if (bot.status !== 'approved') {
      toast({
        variant: "destructive",
        title: "Bot Not Approved",
        description: "Only approved bots can be featured as premium listings.",
      });
      return;
    }
    
    setSelectedBot(bot);
    setPaymentModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isPremiumActive = (bot: UserBot): boolean => {
    if (!bot.featured || !bot.featured_until) return false;
    return new Date(bot.featured_until) > new Date();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">My Bots</h1>
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>{userBots.length} Total</span>
              </Badge>
            </div>
            
            <Button onClick={() => navigate('/submit')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Bot
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your bots...</div>
        ) : userBots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
              <p className="text-muted-foreground mb-4">
                Submit your first bot to get started!
              </p>
              <Button onClick={() => navigate('/submit')}>
                <Plus className="w-4 h-4 mr-2" />
                Submit a Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {userBots.map((bot) => (
              <Card key={bot.id} className="card-gradient">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={bot.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{bot.name}</CardTitle>
                          {isPremiumActive(bot) && (
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(bot.status)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {bot.votes}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(bot.created_at).toLocaleDateString()}
                        </p>
                        {bot.featured_until && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Featured until: {new Date(bot.featured_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/bot/edit/${bot.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      {bot.status === 'approved' && !isPremiumActive(bot) && (
                        <Button 
                          size="sm"
                          onClick={() => handlePremiumPurchase(bot)}
                          className="bg-gradient-to-r from-primary to-secondary text-white"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Get Premium
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {bot.short_description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {bot.bot_tags.slice(0, 5).map((botTag) => (
                      <Badge
                        key={botTag.tags.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ 
                          backgroundColor: botTag.tags.color + '20', 
                          color: botTag.tags.color 
                        }}
                      >
                        {botTag.tags.name}
                      </Badge>
                    ))}
                    {bot.bot_tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{bot.bot_tags.length - 5} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <PremiumPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedBot(null);
          }}
          botId={selectedBot?.id}
          botName={selectedBot?.name}
        />
      </div>
    </div>
  );
};

export default MyBots;