import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SimpleBotCardProps {
  bot: {
    id: string;
    name: string;
    short_description: string;
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
  };
}

export const SimpleBotCard: React.FC<SimpleBotCardProps> = ({ bot }) => {
  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `https://cdn.discordapp.com/app-icons/${clientId}/${avatarUrl}.png`;
  };

  return (
    <Card className="hover-scale transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
            <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {bot.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              by {bot.owner.username}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{bot.votes}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {bot.short_description}
        </p>
        
        {bot.tags && bot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bot.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.name} 
                variant="outline"
                style={{ borderColor: tag.color, color: tag.color }}
                className="text-xs"
              >
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
          <Button asChild size="sm" className="flex-1">
            <Link to={`/bot/${bot.id}`}>
              View Details
            </Link>
          </Button>
          {bot.invite_url && (
            <Button asChild size="sm" variant="outline">
              <a href={bot.invite_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Invite
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};