import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Bot } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RefreshAvatarsButton = () => {
  const [isRefreshingAvatars, setIsRefreshingAvatars] = useState(false);
  const [isRefreshingProfiles, setIsRefreshingProfiles] = useState(false);
  const [isRefreshingBots, setIsRefreshingBots] = useState(false);
  const { toast } = useToast();

  const handleRefreshAvatars = async () => {
    setIsRefreshingAvatars(true);
    
    try {
      console.log('Calling refresh-bot-avatars edge function...');
      
      const { data, error } = await supabase.functions.invoke('refresh-bot-avatars');
      
      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error",
          description: "Failed to refresh bot avatars. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Edge function response:', data);
      
      toast({
        title: "Success",
        description: `Avatar refresh completed! ${data?.successful || 0} bots updated successfully.`,
      });

      // Refresh the page to see updated avatars
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingAvatars(false);
    }
  };

  const handleRefreshProfiles = async () => {
    setIsRefreshingProfiles(true);
    
    try {
      console.log('Calling refresh-user-profiles edge function...');
      
      const { data, error } = await supabase.functions.invoke('refresh-user-profiles');
      
      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error",
          description: "Failed to refresh user profiles. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Edge function response:', data);
      
      toast({
        title: "Success",
        description: `Profile refresh completed! ${data?.successful || 0} profiles updated successfully.`,
      });

      // Refresh the page to see updated profiles
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingProfiles(false);
    }
  };

  const handleRefreshBots = async () => {
    setIsRefreshingBots(true);
    
    try {
      console.log('Calling refresh-bot-info edge function...');
      
      const { data, error } = await supabase.functions.invoke('refresh-bot-info');
      
      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error",
          description: "Failed to refresh bot information. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Edge function response:', data);
      
      toast({
        title: "Success",
        description: `Bot info refresh completed! ${data?.successful || 0} bots updated successfully.`,
      });

      // Refresh the page to see updated bot info
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingBots(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleRefreshAvatars}
        disabled={isRefreshingAvatars}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshingAvatars ? 'animate-spin' : ''}`} />
        <span>{isRefreshingAvatars ? 'Refreshing...' : 'Refresh Bot Avatars'}</span>
      </Button>
      
      <Button
        onClick={handleRefreshProfiles}
        disabled={isRefreshingProfiles}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Users className={`h-4 w-4 ${isRefreshingProfiles ? 'animate-spin' : ''}`} />
        <span>{isRefreshingProfiles ? 'Refreshing...' : 'Refresh User Profiles'}</span>
      </Button>
      
      <Button
        onClick={handleRefreshBots}
        disabled={isRefreshingBots}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Bot className={`h-4 w-4 ${isRefreshingBots ? 'animate-spin' : ''}`} />
        <span>{isRefreshingBots ? 'Refreshing...' : 'Refresh Bot Info'}</span>
      </Button>
    </div>
  );
};