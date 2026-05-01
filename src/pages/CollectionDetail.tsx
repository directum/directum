// deno-lint-ignore-file no-sloppy-imports
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SimpleBotCard } from '@/components/collections/SimpleBotCard';
import { Navbar } from '@/components/layout/Navbar';
import { CollectionForm } from '@/components/collections/CollectionForm';
import { FollowButton } from '@/components/social/FollowButton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Share2, 
  Eye, 
  Lock, 
  Users, 
  Calendar,
  Grid,
  List
} from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  short_description: string;
  long_description?: string;
  avatar_url?: string;
  client_id: string;
  votes: number;
  created_at: string;
  invite_url?: string;
  support_server_url?: string;
  tags?: Array<{ name: string; color: string }>;
  owner: {
    username: string;
    avatar_url?: string;
  };
  added_at?: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

const CollectionDetail: React.FC = () => {
  const { collectionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddBot, setShowAddBot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableBots, setAvailableBots] = useState<Bot[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
      fetchCollectionBots();
    }
  }, [collectionId]);

  const fetchCollection = async () => {
    if (!collectionId) return;

    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', collectionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          navigate('/collections');
          return;
        }
        throw error;
      }

      setCollection(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      toast({
        title: "Error Loading Collection",
        description: error.message || "Failed to load collection",
        variant: "destructive",
      });
      navigate('/collections');
    }
  };

  const fetchCollectionBots = async () => {
    if (!collectionId) return;

    try {
      const { data, error } = await supabase
        .from('collection_bots')
        .select(`
          bot_id,
          added_at,
          bots!inner (
            id,
            name,
            short_description,
            avatar_url,
            client_id,
            votes,
            created_at,
            owner:owner_id (
              username,
              avatar_url
            )
          )
        `)
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const formattedBots = data?.map(item => ({
        ...item.bots,
        added_at: item.added_at,
      })) || [];

      setBots(formattedBots);
    } catch (error) {
      console.error('Error fetching collection bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select(`
          id,
          name,
          short_description,
          avatar_url,
          client_id,
          votes,
          created_at,
          owner:owner_id (
            username,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .not('id', 'in', `(${bots.map(b => b.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .order('votes', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAvailableBots(data || []);
    } catch (error) {
      console.error('Error fetching available bots:', error);
    }
  };

  const addBotToCollection = async (botId: string) => {
    if (!collectionId || !user) return;

    try {
      const { error } = await supabase
        .from('collection_bots')
        .insert({
          collection_id: collectionId,
          bot_id: botId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bot added to collection",
      });

      fetchCollectionBots();
      setShowAddBot(false);
    } catch (error) {
      console.error('Error adding bot to collection:', error);
      toast({
        title: "Error Adding Bot to Collection",
        description: error.message || "Failed to add bot to collection",
        variant: "destructive",
      });
    }
  };

  const removeBotFromCollection = async (botId: string) => {
    if (!collectionId || !user) return;

    try {
      const { error } = await supabase
        .from('collection_bots')
        .delete()
        .eq('collection_id', collectionId)
        .eq('bot_id', botId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bot removed from collection",
      });

      fetchCollectionBots();
    } catch (error) {
      console.error('Error removing bot from collection:', error);
      toast({
        title: "Error Removing Bot from Collection",
        description: error.message || "Failed to remove bot from collection",
        variant: "destructive",
      });
    }
  };

  const deleteCollection = async () => {
    if (!collectionId || !user || !collection) return;

    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });

      navigate('/collections');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: "Error Deleting Collection",
        description: error.message || "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  const shareCollection = async () => {
    const url = globalThis.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection?.name,
          text: collection?.description || `Check out this bot collection: ${collection?.name}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Collection link copied to clipboard",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Error Copying Link",
          description: error.message || "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `https://cdn.discordapp.com/app-icons/${clientId}/${avatarUrl}.png`;
  };

  const isOwner = user && collection && user.id === collection.user.id;
  const filteredAvailableBots = availableBots.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
          <Button asChild>
            <Link to="/collections">Back to Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/collections')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        {/* Collection Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{collection.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {collection.is_public ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge variant={collection.is_public ? "secondary" : "outline"}>
                      {collection.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={collection.user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {collection.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      to={`/user/${collection.user.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {collection.user.username}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{bots.length} bots</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {collection.description && (
                  <p className="text-muted-foreground">{collection.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <FollowButton userId={collection.user.id} />
                <Button variant="outline" size="sm" onClick={shareCollection}>
                  <Share2 className="h-4 w-4" />
                </Button>
                {isOwner && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={deleteCollection}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bots Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bots in this collection</h2>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            {isOwner && (
              <Button onClick={() => {
                fetchAvailableBots();
                setShowAddBot(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bot
              </Button>
            )}
          </div>
        </div>

        {bots.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {bots.map((bot) => (
              <div key={bot.id} className="relative group">
                <SimpleBotCard bot={bot} />
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeBotFromCollection(bot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No bots in this collection yet</p>
                <p className="text-sm">
                  {isOwner 
                    ? "Add some bots to get started" 
                    : "This collection doesn't have any bots yet"
                  }
                </p>
                {isOwner && (
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      fetchAvailableBots();
                      setShowAddBot(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Bot
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Collection Form */}
      <CollectionForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={() => {
          fetchCollection();
          setShowEditForm(false);
        }}
        collection={{
          ...collection,
          description: collection.description || ''
        }}
      />

      {/* Add Bot Dialog */}
      <Dialog open={showAddBot} onOpenChange={setShowAddBot}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Bot to Collection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredAvailableBots.map((bot) => (
                <Card key={bot.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                        <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{bot.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bot.short_description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {bot.votes} votes
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => addBotToCollection(bot.id)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAvailableBots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bots found matching your search.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionDetail;