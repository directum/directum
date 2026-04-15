import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Ticket } from 'lucide-react';

export const SubmitTicket = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Ticket className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">Submit a Ticket</h1>
          </div>
          <p className="text-muted-foreground">
            Our support ticket system is currently unavailable through this form.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Support Ticket</CardTitle>
            <CardDescription>
              At this time, tickets are only available through our Discord server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-lg">
              Our staff there will be happy to help!
            </p>
            <Button
              variant="secondary"
              onClick={() => window.open('https://discord.gg/yr85pkUteU', '_blank')}
            >
              Open Discord Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
