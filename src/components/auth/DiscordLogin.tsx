import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

export const DiscordLogin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Directum</h1>
          </div>
          <p className="text-muted-foreground">The ultimate Discord bot directory</p>
        </div>

        <Card className="card-gradient elegant-shadow">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to list your bots and discover new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDiscordLogin}
              disabled={loading}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              size="lg"
            >
              <Bot className="w-5 h-5 mr-2" />
              Continue with Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};