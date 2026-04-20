import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BotReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  botName: string;
  botLink: string;
}

export const BotReportModal = ({
  open,
  onOpenChange,
  botId,
  botName,
  botLink,
}: BotReportModalProps) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to report a bot.',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a reason for reporting this bot.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const embed = {
        title: '🚩 Bot Report',
        color: 0xff0000, // Red color
        fields: [
          {
            name: 'Bot Name',
            value: botName,
            inline: true,
          },
          {
            name: 'Bot ID',
            value: botId,
            inline: true,
          },
          {
            name: 'Reporter ID',
            value: user.id,
            inline: true,
          },
          {
            name: 'Bot Link',
            value: botLink,
            inline: false,
          },
          {
            name: 'Report Description',
            value: description,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Directum Bot Reporting System',
        },
      };

      const webhookUrl =
        'https://discord.com/api/webhooks/1495818335059972248/a3UQ4-itHN-c42pjTOKrJbfEd_ZLdLGYX6C7g-v01qCXo-_SK1HiKNbet-3iE2JhIhm9';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord webhook failed:', response.status, errorText);
        throw new Error(`Failed to submit report: ${response.status}`);
      }

      toast({
        title: 'Report submitted',
        description: 'Thank you for reporting this bot. Our team will review it shortly.',
      });

      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error submitting report',
        description: error instanceof Error ? error.message : 'An error occurred while submitting your report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Bot</DialogTitle>
          <DialogDescription>
            Report <span className="font-semibold text-foreground">{botName}</span> for policy violations or inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              Your user ID will be submitted with this report to help us track abuse. Please provide a detailed description of why you're reporting this bot.
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Report Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe why you're reporting this bot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
