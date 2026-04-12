import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';

interface ReviewFormProps {
  botId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

const ReviewForm = ({ botId, onReviewSubmitted, existingReview }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <Card className="card-gradient">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please log in to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment about your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', existingReview.id);

        if (error) throw error;

        toast({
          title: "Review updated!",
          description: "Your review has been successfully updated.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([{ bot_id: botId, user_id: user.id, rating, comment }]);

        if (error) throw error;

        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback.",
        });
      }

      onReviewSubmitted();
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>
          {existingReview ? 'Edit Your Review' : 'Leave a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating *</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Comment *</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this bot..."
              className="min-h-[100px]"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting 
              ? (existingReview ? 'Updating...' : 'Submitting...')
              : (existingReview ? 'Update Review' : 'Submit Review')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;