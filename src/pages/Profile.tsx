import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCookies } from '@/contexts/CookieContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BotForm } from '@/components/bots/BotForm';
import { Navbar } from '@/components/layout/Navbar';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { Bot, Edit, Trash2, User, Settings, ArrowLeft, Heart, ExternalLink, Bell, Check, Moon, Sun, Share2, Activity, Cookie } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DiscordIcon } from '@/components/icons/DiscordIcon';

interface UserBot {
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
  updated_at: string;
  bot_tags: Array<{
    tags: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_bot_id?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { theme, setTheme, isLoading: themeLoading } = useTheme();
  const { preferences, updatePreferences } = useCookies();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userBots, setUserBots] = useState<UserBot[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<UserBot | null>(null);

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
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserBots();
    fetchUserProfile();
    fetchNotifications();
  }, [user, navigate]);

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
        title: "Error",
        description: "Failed to load profile",
      });
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications",
      });
    }
  };

  const fetchUserBots = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBots(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your bots",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteBot = async (botId: string) => {
    try {
      // Find the bot to get its details for the webhook
      const botToDelete = userBots.find(bot => bot.id === botId);
      
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);

      if (error) throw error;

      // Send Discord webhook notification
      if (botToDelete) {
        try {
          await supabase.functions.invoke('discord-webhook', {
            body: {
              action: 'removed',
              userName: user?.user_metadata?.user_name || user?.user_metadata?.name || 'Unknown User',
              userDiscordId: user?.user_metadata?.provider_id || '',
              botName: botToDelete.name,
              botClientId: botToDelete.client_id,
            }
          });
        } catch (webhookError) {
          console.error('Failed to send Discord webhook:', webhookError);
          // Don't fail the whole operation if webhook fails
        }
      }

      setUserBots(prev => prev.filter(bot => bot.id !== botId));
      toast({
        title: "Bot Deleted",
        description: "Your bot has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bot",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  };

  if (!user) return null;

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={userProfile?.avatar_url || user.user_metadata?.avatar_url} 
                  alt="User avatar"
                  onError={(e) => {
                    console.error('Failed to load user avatar:', userProfile?.avatar_url || user.user_metadata?.avatar_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {userProfile?.username || user.user_metadata?.user_name || 'User'}
                  {userProfile?.discriminator && (
                    <span className="text-muted-foreground">#{userProfile.discriminator}</span>
                  )}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                const profileUrl = `${window.location.origin}/user/${user?.id}`;
                navigator.clipboard.writeText(profileUrl);
                toast({
                  title: "Profile link copied!",
                  description: "Share this link with others to show them your public profile.",
                });
              }}
              variant="outline"
              size="sm"
            >
              <Share2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Share Profile</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue={new URLSearchParams(location.search).get('tab') || 'bots'} className="space-y-6">
          <TabsList>
            <TabsTrigger value="bots" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>My Bots ({userBots.length})</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications {notifications.filter(n => !n.is_read).length > 0 && `(${notifications.filter(n => !n.is_read).length})`}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Bots</h2>
                <Button onClick={() => setEditingBot({} as UserBot)}>
                  <Bot className="w-4 h-4 mr-2" />
                  Add New Bot
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading your bots...</div>
              ) : userBots.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by adding your first bot to Directum
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {userBots.map((bot) => (
                    <Card key={bot.id} className="card-gradient">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} 
                                alt={`${bot.name} avatar`}
                                onError={(e) => {
                                  console.error('Failed to load bot avatar:', bot.avatar_url);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <AvatarFallback>
                                <Bot className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <CardTitle className="text-xl">{bot.name}</CardTitle>
                                <Badge 
                                  variant={getStatusBadgeVariant(bot.status)}
                                  className={getStatusColor(bot.status)}
                                >
                                  {bot.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Client ID: {bot.client_id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Heart className="h-4 w-4" />
                              <span>{bot.votes}</span>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/bot/edit/${bot.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Bot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{bot.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteBot(bot.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {bot.short_description}
                        </p>
                        
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
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => window.open(bot.invite_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Invite
                          </Button>
                          {bot.support_server_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(bot.support_server_url, '_blank')}
                            >
                              <DiscordIcon className="w-4 h-4 mr-1" />
                              Support
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(bot.created_at).toLocaleDateString()}
                          {bot.updated_at !== bot.created_at && (
                            <span> • Updated: {new Date(bot.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Community Activity Section */}
            <div className="space-y-6 mt-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Your Activity
                </h2>
              </div>
              <Card>
                <CardContent className="p-6">
                  <ActivityFeed userId={user?.id} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="notifications">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Notifications</h2>
              
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      You'll see updates about your bots here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`${!notification.is_read ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{notification.title}</h4>
                              {!notification.is_read && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="theme-toggle" className="text-base font-medium">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes. Your preference will be saved automatically.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        id="theme-toggle"
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        disabled={themeLoading}
                      />
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cookie className="h-5 w-5" />
                    Cookie Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your cookie and data collection preferences. Changes are saved automatically.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Necessary Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Required for basic site functionality and security
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Analytics Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Help us understand how you use our site to improve performance
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, analytics: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Marketing Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Used to deliver personalized ads and content
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, marketing: checked })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Functional Cookies</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable enhanced features and personalized experiences
                        </p>
                      </div>
                      <Switch
                        checked={preferences.functional}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, functional: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
                    <div className="space-y-2">
                      <p><strong>Username:</strong> {userProfile?.username || 'Loading...'}</p>
                      {userProfile?.discriminator && (
                        <p><strong>Discriminator:</strong> #{userProfile.discriminator}</p>
                      )}
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Discord ID:</strong> {userProfile?.discord_id || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Profile information is managed through your Discord account. 
                      Changes to your Discord profile will be reflected here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bot Form Modal - Only render when editing */}
      {editingBot && (
        <BotForm 
          onClose={() => setEditingBot(null)} 
          onSuccess={() => {
            setEditingBot(null);
            fetchUserBots();
          }}
        />
      )}
    </div>
  );
};

export default Profile;