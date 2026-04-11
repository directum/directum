import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Lock, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string;
    is_public: boolean;
    created_at: string;
    user: {
      username: string;
      avatar_url?: string;
    };
    bot_count?: number;
  };
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <Card className="hover-scale transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {collection.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={collection.user.avatar_url} />
                <AvatarFallback className="text-xs">
                  {collection.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                by {collection.user.username}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {collection.is_public ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{collection.bot_count || 0} bots</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={collection.is_public ? "secondary" : "outline"}>
              {collection.is_public ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
        
        <Button asChild className="w-full">
          <Link to={`/collection/${collection.id}`}>
            View Collection
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};