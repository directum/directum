import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Send } from 'lucide-react';

export const SubmitTicket = () => {
  const [discordName, setDiscordName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!discordName.trim() || !email.trim() || !reason.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-ticket', {
        body: {
          discordName: discordName.trim(),
          email: email.trim(),
          reason: reason.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your ticket has been submitted successfully. We'll get back to you soon!",
      });

      // Reset form
      setDiscordName('');
      setEmail('');
      setReason('');
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Ticket className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">Submit a Ticket</h1>
        </div>
        <p className="text-muted-foreground">
          Need help? Submit a support ticket and our team will get back to you as soon as possible.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Request</CardTitle>
          <CardDescription>
            Please provide the following information so we can assist you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="discordName">Discord Name</Label>
              <Input
                id="discordName"
                type="text"
                placeholder="e.g., username#1234 or @username"
                value={discordName}
                onChange={(e) => setDiscordName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ticket</Label>
              <Textarea
                id="reason"
                placeholder="Please describe your issue or question in detail..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          You can also reach us directly on{' '}
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm"
            onClick={() => window.open('https://discord.gg/yr85pkUteU', '_blank')}
          >
            Discord
          </Button>
          {' '}for immediate assistance.
        </p>
      </div>
    </div>
  );
};
