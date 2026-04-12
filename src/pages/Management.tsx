import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { Bot, Check, X, ArrowLeft, Eye, Clock, AlertCircle, User, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define admin Discord IDs
const ADMIN_DISCORD_IDS = [
  '1374705890565029988',
  '1230645006440595614',
  // Add more admin Discord IDs as needed
];

interface PendingBot {
  id: string;
  name: string;
  avatar_url?: string;
  short_description: string;
  long_description: string;
  votes: number;
  invite_url: string;
  support_server_url?: string;
  client_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  owner_id: string;
  profiles: {
    username: string;
    avatar_url?: string;
    discord_id: string;
  };
  bot_tags: Array<{
    tags: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

const Management = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingBots, setPendingBots] = useState<PendingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<PendingBot | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  
  // Bot removal states
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [approvedBots, setApprovedBots] = useState<PendingBot[]>([]);
  const [selectedBotForRemoval, setSelectedBotForRemoval] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [removingBot, setRemovingBot] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (userProfile && !isAdmin()) {
      navigate('/');
      return;
    }
    if (userProfile && isAdmin()) {
      fetchPendingBots();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Profile",
        description: error.message || "Failed to load profile",
      });
      navigate('/');
    }
  };

  const isAdmin = (): boolean => {
    return userProfile && ADMIN_DISCORD_IDS.includes(userProfile.discord_id);
  };

  const fetchPendingBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          profiles:owner_id (username, avatar_url, discord_id),
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingBots(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Pending Bots",
        description: error.message || "Failed to load pending bots",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          profiles:owner_id (username, avatar_url, discord_id),
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('status', 'approved')
        .order('name', { ascending: true });

      if (error) throw error;
      setApprovedBots(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Approved Bots",
        description: error.message || "Failed to load approved bots",
      });
    }
  };

  const handleRemoveBot = async () => {
    if (!selectedBotForRemoval || !removalReason.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a bot and provide a removal reason.",
      });
      return;
    }

    setRemovingBot(true);
    try {
      const selectedBot = approvedBots.find(bot => bot.id === selectedBotForRemoval);
      if (!selectedBot) {
        throw new Error('Bot not found');
      }

      console.log('Attempting to remove bot:', selectedBot.name, selectedBot.id);

      // Delete the bot from the database
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', selectedBotForRemoval);

      if (error) {
        console.error('Error deleting bot:', error);
        throw error;
      }

      console.log('Bot successfully deleted from database');

      // Create notification for bot owner
      await createNotification(
        selectedBot.owner_id,
        'bot_removed',
        'Bot Removed',
        `Your bot "${selectedBot.name}" has been removed from Directum. Reason: ${removalReason}`,
        selectedBot.id
      );

      console.log('Notification sent to bot owner');

      // Trigger a broadcast to notify other parts of the app
      window.dispatchEvent(new CustomEvent('botRemoved', { 
        detail: { botId: selectedBotForRemoval, botName: selectedBot.name } 
      }));

      // Reset form and close modal
      setSelectedBotForRemoval('');
      setRemovalReason('');
      setShowRemovalModal(false);
      
      toast({
        title: "Bot Removed",
        description: `${selectedBot.name} has been removed and the owner has been notified.`,
      });
    } catch (error: any) {
      console.error('Failed to remove bot:', error);
      toast({
        variant: "destructive",
        title: "Error Removing Bot",
        description: error.message,
      });
    } finally {
      setRemovingBot(false);
    }
  };

  const openRemovalModal = async () => {
    await fetchApprovedBots();
    setShowRemovalModal(true);
  };

  const createNotification = async (userId: string, type: string, title: string, message: string, botId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          related_bot_id: botId,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleApproveBot = async (bot: PendingBot) => {
    setActionLoading(bot.id);
    try {
      const { error } = await supabase
        .from('bots')
        .update({ 
          status: 'approved',
          approval_notes: approvalNotes || null
        })
        .eq('id', bot.id);

      if (error) throw error;

      // Create notification for bot owner
      await createNotification(
        bot.owner_id,
        'bot_approved',
        'Bot Approved!',
        `Your bot "${bot.name}" has been approved and is now live on Directum!${approvalNotes ? ` Admin notes: ${approvalNotes}` : ''}`,
        bot.id
      );

      setPendingBots(prev => prev.filter(b => b.id !== bot.id));
      setApprovalNotes('');
      setSelectedBot(null);
      
      toast({
        title: "Bot Approved",
        description: `${bot.name} has been approved and the owner has been notified.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Approving Bot",
        description: error.message || "Failed to approve bot",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBot = async (bot: PendingBot) => {
    if (!rejectionNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Rejection Notes Required",
        description: "Please provide notes explaining why the bot was rejected.",
      });
      return;
    }

    setActionLoading(bot.id);
    try {
      const { error } = await supabase
        .from('bots')
        .update({ 
          status: 'rejected',
          approval_notes: rejectionNotes
        })
        .eq('id', bot.id);

      if (error) throw error;

      // Create notification for bot owner
      await createNotification(
        bot.owner_id,
        'bot_rejected',
        'Bot Rejected',
        `Your bot "${bot.name}" has been rejected. Reason: ${rejectionNotes}`,
        bot.id
      );

      setPendingBots(prev => prev.filter(b => b.id !== bot.id));
      setRejectionNotes('');
      setSelectedBot(null);
      
      toast({
        title: "Bot Rejected",
        description: `${bot.name} has been rejected and the owner has been notified.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Rejecting Bot",
        description: error.message || "Failed to reject bot",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
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
                <h1 className="text-3xl font-bold">Bot Management</h1>
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{pendingBots.length} Pending</span>
              </Badge>
            </div>
            
            <Button 
              onClick={openRemovalModal}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove a Bot</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading pending bots...</div>
        ) : pendingBots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                There are no pending bots to review at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingBots.map((bot) => (
              <Card key={bot.id} className="card-gradient">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={bot.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{bot.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {bot.profiles.username} • Client ID: {bot.client_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(bot.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedBot(bot)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Bot: {bot.name}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={bot.avatar_url} />
                                <AvatarFallback>
                                  <Bot className="h-8 w-8" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold">{bot.name}</h3>
                                <p className="text-muted-foreground">Client ID: {bot.client_id}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={bot.profiles.avatar_url} />
                                    <AvatarFallback>
                                      <User className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">Owner: {bot.profiles.username}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Short Description</h4>
                              <p className="text-sm text-muted-foreground">{bot.short_description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Long Description</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bot.long_description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {bot.bot_tags.map((botTag) => (
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
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Invite URL</h4>
                                <a 
                                  href={bot.invite_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {bot.invite_url}
                                </a>
                              </div>
                              {bot.support_server_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Support Server</h4>
                                  <a 
                                    href={bot.support_server_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline break-all"
                                  >
                                    {bot.support_server_url}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t pt-6 space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Approval Notes (optional)</h4>
                                <Textarea
                                  placeholder="Add any notes for the bot owner (visible to them)..."
                                  value={approvalNotes}
                                  onChange={(e) => setApprovalNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Rejection Reason (required if rejecting)</h4>
                                <Textarea
                                  placeholder="Explain why this bot is being rejected..."
                                  value={rejectionNotes}
                                  onChange={(e) => setRejectionNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button 
                                  onClick={() => handleApproveBot(bot)}
                                  disabled={actionLoading === bot.id}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  {actionLoading === bot.id ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectBot(bot)}
                                  disabled={actionLoading === bot.id}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  {actionLoading === bot.id ? 'Rejecting...' : 'Reject'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {bot.short_description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {bot.bot_tags.slice(0, 3).map((botTag) => (
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
                    {bot.bot_tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{bot.bot_tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bot Removal Modal */}
        <Dialog open={showRemovalModal} onOpenChange={setShowRemovalModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                <span>Remove Bot</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Bot to Remove</label>
                <Select value={selectedBotForRemoval} onValueChange={setSelectedBotForRemoval}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={bot.avatar_url} />
                            <AvatarFallback>
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{bot.name}</span>
                          <span className="text-xs text-muted-foreground">by {bot.profiles.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Removal Reason</label>
                <Textarea
                  placeholder="Explain why this bot is being removed..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRemovalModal(false);
                    setSelectedBotForRemoval('');
                    setRemovalReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleRemoveBot}
                  disabled={removingBot || !selectedBotForRemoval || !removalReason.trim()}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {removingBot ? 'Removing...' : 'Remove Bot'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Management;