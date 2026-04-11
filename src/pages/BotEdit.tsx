import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Bot, ArrowLeft, Copy, ExternalLink, Settings } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface BotData {
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
}

const BotEdit = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [bot, setBot] = useState<BotData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    short_description: '',
    long_description: '',
    invite_url: '',
    support_server_url: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [voteApiConfig, setVoteApiConfig] = useState({
    guildId: '',
    roleId: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (botId) {
      fetchBot();
    }
    fetchTags();
  }, [botId, user]);

  const fetchBot = async () => {
    if (!botId) return;
    
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          *,
          bot_tags (
            tags (id, name, color)
          )
        `)
        .eq('id', botId)
        .single();

      if (error) throw error;

      // Check if user owns this bot
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      if (data.owner_id !== profile?.id) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You can only edit your own bots",
        });
        navigate('/profile');
        return;
      }

      setBot(data);
      setFormData({
        name: data.name,
        client_id: data.client_id,
        short_description: data.short_description,
        long_description: data.long_description,
        invite_url: data.invite_url,
        support_server_url: data.support_server_url || '',
      });
      setSelectedTags(data.bot_tags.map((bt: any) => bt.tags.id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bot data",
      });
      navigate('/profile');
    } finally {
      setLoadingData(false);
    }
  };

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

  const generateVoteApiUrl = () => {
    const baseUrl = 'https://esavcohhdgdqkukirztz.supabase.co/functions/v1/vote-api';
    const params = new URLSearchParams({
      botId: botId || '',
      ...(voteApiConfig.guildId && { guildId: voteApiConfig.guildId }),
      ...(voteApiConfig.roleId && { roleId: voteApiConfig.roleId }),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const copyVoteApiUrl = async () => {
    const url = generateVoteApiUrl();
    await navigator.clipboard.writeText(url);
    toast({
      title: "API URL Copied!",
      description: "The vote API URL has been copied to your clipboard.",
    });
  };

  const copyApiExample = async () => {
    const example = `// Example POST request to record a vote
fetch('${generateVoteApiUrl()}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    botId: '${botId}',
    userId: 'user-uuid-here', // Your app's user ID
    discordUserId: '123456789012345678', // Discord user ID
    ${voteApiConfig.guildId ? `guildId: '${voteApiConfig.guildId}', // Discord server ID` : '// guildId: "server-id", // Optional: Discord server ID'}
    ${voteApiConfig.roleId ? `roleId: '${voteApiConfig.roleId}', // Discord role ID to award` : '// roleId: "role-id", // Optional: Discord role ID to award'}
  })
})
.then(response => response.json())
.then(data => console.log(data));`;

    await navigator.clipboard.writeText(example);
    toast({
      title: "API Example Copied!",
      description: "The API usage example has been copied to your clipboard.",
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
        description: "You must be logged in to edit a bot",
      });
      return;
    }

    try {
      setLoading(true);

      // Update bot
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
        .eq('id', botId);

      if (botError) throw botError;

      // Delete existing bot tags
      const { error: deleteTagsError } = await supabase
        .from('bot_tags')
        .delete()
        .eq('bot_id', botId);

      if (deleteTagsError) throw deleteTagsError;

      // Insert new bot tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          bot_id: botId,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('bot_tags')
          .insert(tagInserts);

      if (tagsError) throw tagsError;
      }

      // Send Discord webhook notification
      try {
        await supabase.functions.invoke('discord-webhook', {
          body: {
            action: 'edited',
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
        description: "Your bot has been updated",
      });

      // Redirect back to profile page
      navigate('/profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update bot",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading bot data...</div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Bot not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="max-w-4xl mx-auto card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span>Edit Bot: {bot.name}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Bot Name *</Label>
                <Input
                  id="name"
                  placeholder="Your bot's name (e.g., Directum)"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Bot Client ID *</Label>
                <Input
                  id="client_id"
                  placeholder="Your bot's client ID (user ID)"
                  value={formData.client_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your Discord Developer Portal
                </p>
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
                  rows={6}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              {/* Vote API Configuration Section */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>Vote API Configuration</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate an API endpoint to record votes and reward Discord roles
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guild_id">Discord Server ID (Optional)</Label>
                      <Input
                        id="guild_id"
                        placeholder="123456789012345678"
                        value={voteApiConfig.guildId}
                        onChange={(e) => setVoteApiConfig(prev => ({ ...prev, guildId: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required for Discord role rewards
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role_id">Discord Role ID (Optional)</Label>
                      <Input
                        id="role_id"
                        placeholder="987654321098765432"
                        value={voteApiConfig.roleId}
                        onChange={(e) => setVoteApiConfig(prev => ({ ...prev, roleId: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Role to award when users vote
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>API Endpoint</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={generateVoteApiUrl()}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyVoteApiUrl}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Usage Example</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyApiExample}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Example
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
{`POST ${generateVoteApiUrl()}
Content-Type: application/json

{
  "botId": "${botId}",
  "userId": "user-uuid-here",
  "discordUserId": "123456789012345678"${voteApiConfig.guildId ? `,
  "guildId": "${voteApiConfig.guildId}"` : ''}${voteApiConfig.roleId ? `,
  "roleId": "${voteApiConfig.roleId}"` : ''}
}`}
                      </pre>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">API Features:</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Records votes with 12-hour cooldown per user</li>
                        <li>• Automatically increments bot vote count</li>
                        <li>• Awards Discord roles when configured</li>
                        <li>• Returns detailed response with vote status</li>
                        <li>• CORS enabled for web applications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Bot'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotEdit;
