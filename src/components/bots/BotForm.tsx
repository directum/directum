import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Bot, X, RefreshCw } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface BotFormProps {
  onClose: () => void;
  onSuccess: () => void;
  bot?: {
    id: string;
    name: string;
    client_id: string;
    short_description: string;
    long_description: string;
    invite_url: string;
    support_server_url?: string;
    bot_tags: Array<{
      tags: {
        id: string;
        name: string;
        color: string;
      };
    }>;
  };
}

export const BotForm = ({ onClose, onSuccess, bot }: BotFormProps) => {
  const [formData, setFormData] = useState({
    name: bot?.name || '',
    client_id: bot?.client_id || '',
    short_description: bot?.short_description || '',
    long_description: bot?.long_description || '',
    invite_url: bot?.invite_url || '',
    support_server_url: bot?.support_server_url || '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(bot?.bot_tags.map(bt => bt.tags.id) || []);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [fetchingBotInfo, setFetchingBotInfo] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags",
      });
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchBotInfo = async (clientId: string, updateDatabase = false) => {
    if (!clientId || clientId.length < 17) return; // Discord IDs are at least 17 digits
    
    setFetchingBotInfo(true);
    try {
      // Use Discord's public API to fetch bot information
      const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/rpc`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const botData = await response.json();
        
        // Construct proper avatar URL if icon exists
        let avatarUrl: string | null = null;
        if (botData.icon) {
          avatarUrl = `https://cdn.discordapp.com/app-icons/${botData.id}/${botData.icon}.png`;
        }
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          name: botData.name || prev.name,
        }));
        
        // If we're in edit mode and updateDatabase is true, update the database
        if (bot && updateDatabase) {
          try {
            const { error: updateError } = await supabase
              .from('bots')
              .update({
                name: botData.name,
                avatar_url: avatarUrl,
              })
              .eq('id', bot.id);

            if (updateError) throw updateError;

            toast({
              title: "Bot Info Updated",
              description: `Successfully refreshed info for ${botData.name}. Avatar and name updated.`,
            });
          } catch (updateError: any) {
            toast({
              variant: "destructive",
              title: "Update Error",
              description: `Failed to update database: ${updateError.message}`,
            });
          }
        } else {
          toast({
            title: "Bot Info Fetched",
            description: `Found bot: ${botData.name}`,
          });
        }
      } else {
        // Try alternative endpoint for public bot info
        const publicResponse = await fetch(`https://discord.com/api/v10/users/${clientId}`, {
          method: 'GET',
        });
        
        if (publicResponse.ok) {
          const userData = await publicResponse.json();
          if (userData.bot) {
            setFormData(prev => ({
              ...prev,
              name: userData.username || prev.name,
            }));
            
            // If we're in edit mode and updateDatabase is true, update the database
            if (bot && updateDatabase) {
              try {
                const { error: updateError } = await supabase
                  .from('bots')
                  .update({
                    name: userData.username,
                    // Note: User endpoint doesn't provide icon info, so we keep existing avatar
                  })
                  .eq('id', bot.id);

                if (updateError) throw updateError;

                toast({
                  title: "Bot Info Updated",
                  description: `Successfully refreshed name for ${userData.username}.`,
                });
              } catch (updateError: any) {
                toast({
                  variant: "destructive",
                  title: "Update Error",
                  description: `Failed to update database: ${updateError.message}`,
                });
              }
            } else {
              toast({
                title: "Bot Info Fetched",
                description: `Found bot: ${userData.username}`,
              });
            }
          }
        } else {
          throw new Error('Unable to fetch bot information from Discord API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch bot info:', error);
      toast({
        variant: "destructive",
        title: updateDatabase ? "Refresh Failed" : "Info",
        description: updateDatabase 
          ? "Could not refresh bot info from Discord API. Please try again."
          : "Could not auto-fetch bot info. Please enter the name manually.",
      });
    } finally {
      setFetchingBotInfo(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else if (prev.length < 5) {
        return [...prev, tagId];
      } else {
        toast({
          variant: "destructive",
          title: "Tag Limit",
          description: "You can select a maximum of 5 tags",
        });
        return prev;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length < 3) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least 3 tags",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a bot",
      });
      return;
    }

    try {
      setLoading(true);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (bot) {
        // Update existing bot
        const { error: botError } = await supabase
          .from('bots')
          .update({
            name: formData.name,
            client_id: formData.client_id,
            short_description: formData.short_description,
            long_description: formData.long_description,
            invite_url: formData.invite_url,
            support_server_url: formData.support_server_url || null,
          })
          .eq('id', bot.id);

        if (botError) throw botError;

        // Delete existing bot tags
        const { error: deleteTagsError } = await supabase
          .from('bot_tags')
          .delete()
          .eq('bot_id', bot.id);

        if (deleteTagsError) throw deleteTagsError;

        // Insert new bot tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            bot_id: bot.id,
            tag_id: tagId,
          }));

          const { error: tagsError } = await supabase
            .from('bot_tags')
            .insert(tagInserts);

          if (tagsError) throw tagsError;
        }

        toast({
          title: "Success!",
          description: "Your bot has been updated",
        });
      } else {
        // Create new bot
        const botName = formData.name;
        
        // Fetch proper avatar URL from Discord API
        let avatarUrl: string | null = null;
        try {
          const discordResponse = await fetch(`https://discord.com/api/v10/applications/${formData.client_id}/rpc`);
          if (discordResponse.ok) {
            const discordApp = await discordResponse.json();
            if (discordApp.icon) {
              avatarUrl = `https://cdn.discordapp.com/app-icons/${discordApp.id}/${discordApp.icon}.png`;
            }
          }
        } catch (error) {
          console.error('Failed to fetch bot avatar:', error);
          // Continue with null avatar_url - will show fallback icon
        }

        // Insert bot
        const { data: newBot, error: botError } = await supabase
          .from('bots')
          .insert({
            owner_id: user.id,
            client_id: formData.client_id,
            name: botName,
            avatar_url: avatarUrl,
            short_description: formData.short_description,
            long_description: formData.long_description,
            invite_url: formData.invite_url,
            support_server_url: formData.support_server_url || null,
          })
          .select()
          .single();

        if (botError) throw botError;

        // Insert bot tags
        const tagInserts = selectedTags.map(tagId => ({
          bot_id: newBot.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('bot_tags')
          .insert(tagInserts);

        if (tagsError) throw tagsError;

        // Send Discord webhook notification
        try {
          await supabase.functions.invoke('discord-webhook', {
            body: {
              action: 'submitted',
              userName: user?.user_metadata?.user_name || user?.user_metadata?.name || 'Unknown User',
              userDiscordId: user?.user_metadata?.provider_id || '',
              botName: formData.name,
              botClientId: formData.client_id,
            }
          });
        } catch (webhookError) {
          console.error('Failed to send Discord webhook:', webhookError);
          // Don't fail the whole operation if webhook fails
        }

        toast({
          title: "Success!",
          description: "Your bot has been submitted for review",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit bot",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[95vw] h-[95vh] max-w-[1000px] max-h-[1000px] flex flex-col card-gradient">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span>{bot ? 'Edit Bot' : 'Add Your Bot'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <Input
                id="name"
                placeholder="Your bot's name (e.g., DirectSum)"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              {bot && (
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchBotInfo(formData.client_id, true)}
                    disabled={fetchingBotInfo || !formData.client_id}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${fetchingBotInfo ? 'animate-spin' : ''}`} />
                    <span>{fetchingBotInfo ? 'Refreshing...' : 'Refresh Info'}</span>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Updates bot name and avatar from Discord
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Bot Client ID *</Label>
              <Input
                id="client_id"
                placeholder="Your bot's client ID (Application ID)"
                value={formData.client_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, client_id: e.target.value }));
                  // Auto-fetch bot info when client ID is entered
                  if (e.target.value.length >= 17) {
                    fetchBotInfo(e.target.value);
                  }
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can find this in your Discord Developer Portal → Your App → General Information → Application ID
              </p>
              {fetchingBotInfo && (
                <p className="text-xs text-blue-500">Fetching bot information...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description *</Label>
              <Input
                id="short_description"
                placeholder="Brief description of your bot (max 120 characters)"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description">Long Description *</Label>
              <Textarea
                id="long_description"
                placeholder="Detailed description of your bot's features and capabilities"
                value={formData.long_description}
                onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite_url">Bot Invite URL *</Label>
              <Input
                id="invite_url"
                type="url"
                placeholder="https://discord.com/api/oauth2/authorize?client_id=..."
                value={formData.invite_url}
                onChange={(e) => setFormData(prev => ({ ...prev, invite_url: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_server_url">Support Server URL</Label>
              <Input
                id="support_server_url"
                type="url"
                placeholder="https://discord.gg/..."
                value={formData.support_server_url}
                onChange={(e) => setFormData(prev => ({ ...prev, support_server_url: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Tags * (Select 3-5)</Label>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedTags.length}/5 (minimum 3 required)
              </p>
              {loadingTags ? (
                <div>Loading tags...</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                        disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 5}
                      />
                      <Label
                        htmlFor={tag.id}
                        className="text-sm cursor-pointer"
                        style={{ color: tag.color }}
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (bot ? 'Updating...' : 'Submitting...') : (bot ? 'Update Bot' : 'Submit Bot')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
