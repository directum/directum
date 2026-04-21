import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { Bot, Check, X, ArrowLeft, Eye, Clock, AlertCircle, User, Trash2, Search, Settings, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADMIN_DISCORD_IDS } from '@/config/admin';

interface PendingBot {
  id: string;
  name: string;
  avatar_url?: string;
  short_description: string;
  long_description: string;
  votes: number;
  invite_url: string;
  support_server_url?: string;
  featured?: boolean;
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
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'pending' | 'edit' | 'users' | 'alerts'>('pending');
  
  // User & auth states
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Pending bot states
  const [pendingBots, setPendingBots] = useState<PendingBot[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<PendingBot | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewShortDescription, setReviewShortDescription] = useState('');
  const [reviewLongDescription, setReviewLongDescription] = useState('');
  const [reviewInviteUrl, setReviewInviteUrl] = useState('');
  const [reviewSupportServerUrl, setReviewSupportServerUrl] = useState('');
  const [reviewFeatured, setReviewFeatured] = useState(false);

  // Edit bot states
  const [approvedBots, setApprovedBots] = useState<PendingBot[]>([]);
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [selectedBotForEdit, setSelectedBotForEdit] = useState<PendingBot | null>(null);
  const [editName, setEditName] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editLongDescription, setEditLongDescription] = useState('');
  const [editInviteUrl, setEditInviteUrl] = useState('');
  const [editSupportServerUrl, setEditSupportServerUrl] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Bot removal states
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [selectedBotForRemoval, setSelectedBotForRemoval] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [removingBot, setRemovingBot] = useState(false);

  // User management states
  const [userSearchId, setUserSearchId] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [userSearching, setUserSearching] = useState(false);
  
  // Alert states
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'warning' | 'critical'>('warning');
  const [alertLoading, setAlertLoading] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<any>(null);

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
      fetchApprovedBots();
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

  const openReview = (bot: PendingBot) => {
    setSelectedBot(bot);
    setApprovalNotes('');
    setRejectionNotes('');
    setReviewName(bot.name);
    setReviewShortDescription(bot.short_description);
    setReviewLongDescription(bot.long_description);
    setReviewInviteUrl(bot.invite_url);
    setReviewSupportServerUrl(bot.support_server_url || '');
    setReviewFeatured(!!bot.featured);
  };

  const openEditBot = (bot: PendingBot) => {
    setSelectedBotForEdit(bot);
    setEditName(bot.name);
    setEditShortDescription(bot.short_description);
    setEditLongDescription(bot.long_description);
    setEditInviteUrl(bot.invite_url);
    setEditSupportServerUrl(bot.support_server_url || '');
    setEditFeatured(!!bot.featured);
  };

  const clearEditState = () => {
    setSelectedBotForEdit(null);
    setEditName('');
    setEditShortDescription('');
    setEditLongDescription('');
    setEditInviteUrl('');
    setEditSupportServerUrl('');
    setEditFeatured(false);
    setEditSearchQuery('');
  };

  const handleSaveEdit = async () => {
    if (!selectedBotForEdit) return;

    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('bots')
        .update({
          name: editName,
          short_description: editShortDescription,
          long_description: editLongDescription,
          invite_url: editInviteUrl,
          support_server_url: editSupportServerUrl || null,
          featured: editFeatured,
        })
        .eq('id', selectedBotForEdit.id);

      if (error) throw error;

      toast({
        title: 'Bot updated',
        description: `${selectedBotForEdit.name} has been updated successfully.`,
      });

      await fetchApprovedBots();
      clearEditState();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving bot',
        description: error.message || 'Failed to update the bot.',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const clearReviewState = () => {
    setSelectedBot(null);
    setApprovalNotes('');
    setRejectionNotes('');
    setReviewName('');
    setReviewShortDescription('');
    setReviewLongDescription('');
    setReviewInviteUrl('');
    setReviewSupportServerUrl('');
    setReviewFeatured(false);
  };

  const filteredPendingBots = pendingBots.filter((bot) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      bot.name.toLowerCase().includes(query) ||
      bot.client_id.toLowerCase().includes(query) ||
      bot.id.toLowerCase().includes(query)
    );
  });

  const filteredApprovedBots = approvedBots.filter((bot) => {
    const query = approvedSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      bot.name.toLowerCase().includes(query) ||
      bot.client_id.toLowerCase().includes(query) ||
      bot.id.toLowerCase().includes(query)
    );
  });

  const filteredEditableBots = approvedBots.filter((bot) => {
    const query = editSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      bot.name.toLowerCase().includes(query) ||
      bot.client_id.toLowerCase().includes(query) ||
      bot.id.toLowerCase().includes(query)
    );
  });

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

  const searchUserById = async () => {
    if (!userSearchId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a user ID to search.",
      });
      return;
    }

    setUserSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSearchId)
        .single();

      if (error) throw error;
      setFoundUser(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "User Not Found",
        description: "Could not find a user with that ID.",
      });
      setFoundUser(null);
    } finally {
      setUserSearching(false);
    }
  };

  const handleSignOutUser = async () => {
    if (!foundUser?.id) return;

    try {
      const { error } = await supabase.auth.admin.signOut(foundUser.id, true);
      if (error) throw error;

      toast({
        title: "User signed out",
        description: `${foundUser.username} has been signed out from all sessions.`,
      });
      
      setFoundUser(null);
      setUserSearchId('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out user.",
      });
    }
  };

  const handleSaveAlert = async () => {
    if (!alertMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an alert message.",
      });
      return;
    }

    setAlertLoading(true);
    try {
      // For now, we'll store alerts in localStorage until we create a database table
      // In production, this should be in the database
      const alert = {
        id: Date.now().toString(),
        message: alertMessage,
        type: alertType,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('site_alert', JSON.stringify(alert));
      setCurrentAlert(alert);

      toast({
        title: "Alert saved",
        description: "The alert banner will now display on the home page.",
      });

      setAlertMessage('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save alert.",
      });
    } finally {
      setAlertLoading(false);
    }
  };

  const handleClearAlert = async () => {
    try {
      localStorage.removeItem('site_alert');
      setCurrentAlert(null);
      setAlertMessage('');

      toast({
        title: "Alert cleared",
        description: "The alert banner has been removed from the home page.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to clear alert.",
      });
    }
  };

  const fetchCurrentAlert = () => {
    try {
      const stored = localStorage.getItem('site_alert');
      if (stored) {
        setCurrentAlert(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load alert:', error);
    }
  };

  useEffect(() => {
    fetchCurrentAlert();
  }, []);

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
          approval_notes: approvalNotes || null,
          name: reviewName,
          short_description: reviewShortDescription,
          long_description: reviewLongDescription,
          invite_url: reviewInviteUrl,
          support_server_url: reviewSupportServerUrl || null,
          featured: reviewFeatured,
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
      clearReviewState();
      
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
      clearReviewState();
      
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
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Staff Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === 'pending'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Review
                    {pendingBots.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {pendingBots.length}
                      </Badge>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === 'edit'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Edit Bots
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === 'users'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User Profiles
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === 'alerts'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alert Banner
                  </span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Pending Review Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Pending Review</h2>
                      <p className="text-sm text-muted-foreground">Search and review pending bots before they go live.</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pendingBots.length} pending approvals
                    </div>
                  </div>

                  <div className="mb-6 max-w-xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pending bots by name or ID..."
                        className="pl-10"
                      />
                    </div>
                  </div>
          <Card>
            <CardContent className="text-center py-12">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                There are no pending bots to review at this time.
              </p>
            </CardContent>
          </Card>
        ) : filteredPendingBots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No bots matched your search</h3>
              <p className="text-muted-foreground">
                Try a different name or ID to find the bot you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredPendingBots.map((bot) => (
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
                          <Button variant="outline" size="sm" onClick={() => openReview(bot)}>
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
                              <h4 className="font-semibold mb-2">Bot Name</h4>
                              <Input
                                value={reviewName}
                                onChange={(e) => setReviewName(e.target.value)}
                                placeholder="Bot name"
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="font-semibold mb-2">Short Description</h4>
                                <Input
                                  value={reviewShortDescription}
                                  onChange={(e) => setReviewShortDescription(e.target.value)}
                                  placeholder="Short description"
                                />
                              </div>
                              <div className="flex flex-col justify-end">
                                <label className="text-sm font-semibold mb-2">Featured</label>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={reviewFeatured}
                                    onCheckedChange={(checked) => setReviewFeatured(Boolean(checked))}
                                  />
                                  <span className="text-sm">Featured listing</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Long Description</h4>
                              <Textarea
                                value={reviewLongDescription}
                                onChange={(e) => setReviewLongDescription(e.target.value)}
                                placeholder="Long description"
                                rows={5}
                              />
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
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="font-semibold mb-2">Invite URL</h4>
                                <Input
                                  value={reviewInviteUrl}
                                  onChange={(e) => setReviewInviteUrl(e.target.value)}
                                  placeholder="Invite URL"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Support Server</h4>
                                <Input
                                  value={reviewSupportServerUrl}
                                  onChange={(e) => setReviewSupportServerUrl(e.target.value)}
                                  placeholder="Support server URL"
                                />
                              </div>
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

            {/* Edit Bots Tab */}
            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="mb-10 rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Edit Registered Bot</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Search approved bots by name or ID and update their listing data.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => fetchApprovedBots()}>
                      Refresh approved bots
                    </Button>
                  </div>

                  <div className="grid gap-4 mt-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
              <Input
                value={editSearchQuery}
                onChange={(e) => setEditSearchQuery(e.target.value)}
                placeholder="Search approved bots by name or ID..."
                className="pl-10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select a bot to edit</label>
              <Select value={selectedBotForEdit?.id || ''} onValueChange={(value) => {
                const bot = approvedBots.find((bot) => bot.id === value);
                if (bot) openEditBot(bot);
                else clearEditState();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a bot..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredEditableBots.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      No approved bots match your search.
                    </div>
                  ) : (
                    filteredEditableBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        <div className="flex flex-col gap-1 text-left">
                          <span>{bot.name}</span>
                          <span className="text-xs text-muted-foreground">ID: {bot.client_id}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedBotForEdit ? (
              <Card>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Bot Name</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Bot name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Short Description</label>
                      <Input value={editShortDescription} onChange={(e) => setEditShortDescription(e.target.value)} placeholder="Short description" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Long Description</label>
                      <Textarea value={editLongDescription} onChange={(e) => setEditLongDescription(e.target.value)} rows={5} placeholder="Long description" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Invite URL</label>
                        <Input value={editInviteUrl} onChange={(e) => setEditInviteUrl(e.target.value)} placeholder="Invite URL" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Support Server URL</label>
                        <Input value={editSupportServerUrl} onChange={(e) => setEditSupportServerUrl(e.target.value)} placeholder="Support server URL" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={editFeatured} onCheckedChange={(checked) => setEditFeatured(Boolean(checked))} />
                      <span className="text-sm">Featured listing</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleSaveEdit} disabled={editLoading} className="w-full sm:w-auto">
                      {editLoading ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button variant="outline" onClick={clearEditState} className="w-full sm:w-auto">
                      Clear selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-sm text-muted-foreground">
                  Use the search field above to find an approved bot and edit its information.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

            {/* User Profiles Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold">User Profile Lookup</h2>
                    <p className="text-sm text-muted-foreground mt-1">Search for users by ID and manage their accounts.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={userSearchId}
                        onChange={(e) => setUserSearchId(e.target.value)}
                        placeholder="Enter user ID to search..."
                        onKeyDown={(e) => e.key === 'Enter' && searchUserById()}
                      />
                      <Button onClick={searchUserById} disabled={userSearching}>
                        {userSearching ? 'Searching...' : 'Search'}
                      </Button>
                    </div>

                    {foundUser ? (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={foundUser.avatar_url} />
                              <AvatarFallback>
                                <User className="h-8 w-8" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <CardTitle className="text-2xl">{foundUser.username}</CardTitle>
                              <p className="text-sm text-muted-foreground">ID: {foundUser.id}</p>
                              <p className="text-sm text-muted-foreground">Discord ID: {foundUser.discord_id}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Joined</label>
                              <p className="text-sm text-muted-foreground">
                                {new Date(foundUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Last Updated</label>
                              <p className="text-sm text-muted-foreground">
                                {new Date(foundUser.updated_at || foundUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Staff Actions</h4>
                            <Button
                              variant="destructive"
                              onClick={handleSignOutUser}
                              className="w-full"
                            >
                              Sign Out User From All Sessions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8 text-sm text-muted-foreground">
                          Enter a user ID above to view their profile and manage their account.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alert Banner Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Site Alert Banner</h2>
                    <p className="text-sm text-muted-foreground mt-1">Set an alert banner to display on the home page.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Alert Type</label>
                      <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warning">
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Caution / Warning (Yellow)
                            </span>
                          </SelectItem>
                          <SelectItem value="critical">
                            <span className="flex items-center gap-2">
                              <AlertOctagon className="h-4 w-4" />
                              Critical Alert (Red)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Alert Message</label>
                      <Textarea
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        placeholder="Enter the alert message that will be displayed on the home page..."
                        rows={4}
                      />
                    </div>

                    {currentAlert && (
                      <Card className={`p-4 ${currentAlert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20' : 'bg-red-50 border-red-200 dark:bg-red-950/20'}`}>
                        <div className="flex gap-3">
                          <div>
                            {currentAlert.type === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                            ) : (
                              <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Current Alert Active:</p>
                            <p className="text-sm mt-1">{currentAlert.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Set on {new Date(currentAlert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={handleSaveAlert} disabled={alertLoading} className="flex-1">
                        {alertLoading ? 'Saving...' : 'Save Alert'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleClearAlert}
                        disabled={!currentAlert}
                        className="flex-1"
                      >
                        Clear Alert
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
                <label className="text-sm font-medium mb-2 block">Search Approved Bots</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                  <Input
                    value={approvedSearchQuery}
                    onChange={(e) => setApprovedSearchQuery(e.target.value)}
                    placeholder="Search approved bots by name or ID..."
                    className="pl-10"
                  />
                </div>
                <label className="text-sm font-medium mb-2 block">Select Bot to Remove</label>
                <Select value={selectedBotForRemoval} onValueChange={setSelectedBotForRemoval}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredApprovedBots.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No approved bots match your search.
                      </div>
                    ) : filteredApprovedBots.map((bot) => (
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