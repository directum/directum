import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Markdown } from '@/components/ui/markdown';
import { Heart, ExternalLink, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DiscordIcon } from '@/components/icons/DiscordIcon';
import { cn } from '@/lib/utils';

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    avatar_url?: string;
    short_description: string;
    long_description: string;
    votes: number;
    invite_url: string;
    support_server_url?: string;
    client_id: string;
    featured?: boolean;
    owner: {
      username: string;
      avatar_url?: string;
    };
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  onVote?: (botId: string) => void;
  canVote?: boolean;
  isVoting?: boolean;
}

export const BotCard = ({ bot, onVote, canVote = true, isVoting = false }: BotCardProps) => {
  const navigate = useNavigate();

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

  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bot.invite_url, '_blank');
  };

  const handleSupport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bot.support_server_url) {
      window.open(bot.support_server_url, '_blank');
    }
  };

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote?.(bot.id);
  };

  const handleCardClick = () => {
    navigate(`/bot/${bot.id}`);
  };

  return (
    <Card 
      className={cn(
        "bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl soft-shadow hover:bubble-shadow transition-all duration-500 group cursor-pointer hover:scale-105 min-h-[320px] flex flex-col",
        bot.featured && "border-yellow-300/50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40"> 
                <AvatarImage 
                  src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} 
                  alt={`${bot.name} avatar`}
                />
                <AvatarFallback className="bubble-gradient">
                  <Bot className="h-7 w-7 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bubble-gradient rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">✨</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl font-fredoka text-foreground group-hover:gradient-text transition-all duration-300">{bot.name}</h3>
              <p className="text-sm text-muted-foreground font-medium">
                by {bot.owner.username}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={!canVote || isVoting}
              className={`flex items-center space-x-1 rounded-full px-3 py-2 transition-all duration-300 ${
                canVote 
                  ? 'hover:bg-primary/10 hover:text-primary hover:scale-110' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Heart className={`h-4 w-4 ${isVoting ? 'animate-pulse' : ''} ${canVote ? 'group-hover:fill-current' : ''}`} />
              <span className="font-bold">{bot.votes}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 flex-1 flex flex-col">
        <div className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed flex-1">
          <Markdown content={bot.short_description} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {bot.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs rounded-full px-3 py-1 font-semibold transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: tag.color + '20', 
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex space-x-1">
          <Button 
            onClick={handleInvite}
            className="flex-1 bubbly-button text-white font-bold rounded-full"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Invite Bot
          </Button>
          {bot.support_server_url && (
            <Button
              variant="outline"
              onClick={handleSupport}
              size="sm"
              className="rounded-full px-4 hover:bg-bubble-secondary/20 hover:border-bubble-secondary transition-all duration-300 hover:scale-110"
            >
              <DiscordIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};