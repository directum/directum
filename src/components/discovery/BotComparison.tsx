import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, ExternalLink, Users, Star, Calendar, Globe } from 'lucide-react';
import { Markdown } from '@/components/ui/markdown';

interface Bot {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  avatar_url?: string;
  client_id: string;
  votes: number;
  created_at: string;
  invite_url: string;
  support_server_url?: string;
  server_count?: number;
  language?: string;
  permissions?: string[];
  tags?: Array<{ name: string; color: string }>;
  categories?: Array<{ name: string; color: string }>;
  owner: {
    username: string;
    avatar_url?: string;
  };
}

interface BotComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  bots: Bot[];
  onRemoveBot: (botId: string) => void;
}

export const BotComparison: React.FC<BotComparisonProps> = ({
  isOpen,
  onClose,
  bots,
  onRemoveBot,
}) => {
  const getBotAvatarUrl = (avatarUrl?: string, clientId?: string) => {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `https://cdn.discordapp.com/app-icons/${clientId}/${avatarUrl}.png`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!isOpen || bots.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Compare Bots ({bots.length})</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => onRemoveBot(bot.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <CardHeader className="text-center space-y-2">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage src={getBotAvatarUrl(bot.avatar_url, bot.client_id)} />
                  <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  by {bot.owner.username}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{bot.votes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{formatNumber(bot.server_count)} servers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(bot.created_at).getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="uppercase">{bot.language || 'EN'}</span>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bot.short_description}
                  </p>
                </div>
                
                {/* Categories */}
                {bot.categories && bot.categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-1">
                      {bot.categories.map((category) => (
                        <Badge 
                          key={category.name} 
                          variant="secondary"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                          className="text-xs"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {bot.tags && bot.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
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
                          +{bot.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Permissions */}
                {bot.permissions && bot.permissions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Permissions</h4>
                    <div className="text-xs space-y-1">
                      {bot.permissions.slice(0, 3).map((permission) => (
                        <div key={permission} className="bg-muted px-2 py-1 rounded">
                          {permission}
                        </div>
                      ))}
                      {bot.permissions.length > 3 && (
                        <div className="text-muted-foreground">
                          +{bot.permissions.length - 3} more permissions
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <a href={bot.invite_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Invite
                    </a>
                  </Button>
                  {bot.support_server_url && (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={bot.support_server_url} target="_blank" rel="noopener noreferrer">
                        Support
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {bots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No bots selected for comparison.</p>
            <p className="text-sm mt-2">Add bots to compare their features side by side.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};