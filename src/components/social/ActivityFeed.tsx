import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageSquare, Users, Plus, Star, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  related_bot?: {
    id: string;
    name: string;
    avatar_url?: string;
    client_id: string;
  };
  related_collection?: {
    id: string;
    name: string;
  };
}

interface ActivityFeedProps {
  userId?: string; // If provided, shows activities from this user only
  followingOnly?: boolean; // If true, shows activities from followed users only
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  userId, 
  followingOnly = false, 
  limit = 20 
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId, followingOnly, user]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          ),
          related_bot:related_bot_id (
            id,
            name,
            avatar_url,
            client_id
          ),
          related_collection:related_collection_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (followingOnly && user) {
        // Get activities from followed users
        const { data: follows } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        const followingIds = follows?.map(f => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          // No followed users, return empty result
          setActivities([]);
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bot_submit':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'bot_vote':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'collection_create':
        return <Plus className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'review_create':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `https://cdn.discordapp.com/app-icons/${clientId}/${avatarUrl}.png`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No activities yet</p>
            <p className="text-sm">
              {followingOnly 
                ? "Follow some users to see their activities here"
                : "Activities will appear here as users interact with bots"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar_url} />
                <AvatarFallback>
                  {activity.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {getActivityIcon(activity.activity_type)}
                  <span className="font-medium text-sm">
                    {activity.user.username}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {activity.title.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>

                {/* Related Bot */}
                {activity.related_bot && (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={getBotAvatarUrl(activity.related_bot.avatar_url, activity.related_bot.client_id)} 
                      />
                      <AvatarFallback className="text-xs">
                        {activity.related_bot.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      to={`/bot/${activity.related_bot.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {activity.related_bot.name}
                    </Link>
                  </div>
                )}

                {/* Related Collection */}
                {activity.related_collection && (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    <div className="h-6 w-6 bg-primary/20 rounded flex items-center justify-center">
                      <Plus className="h-3 w-3 text-primary" />
                    </div>
                    <Link 
                      to={`/collection/${activity.related_collection.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {activity.related_collection.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};