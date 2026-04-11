import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { CheckCircle, Crown, ArrowLeft, Calendar } from 'lucide-react';

const PremiumSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-premium-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      setPaymentDetails(data);
      
      toast({
        title: "Payment Successful!",
        description: "Your bot is now featured as a premium listing.",
      });
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Verifying Payment</h3>
                <p className="text-muted-foreground">
                  Please wait while we confirm your premium listing purchase...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                  <Crown className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Premium Listing Activated!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <p className="text-green-700 dark:text-green-300">
                Congratulations! Your bot is now featured as a premium listing and will receive enhanced visibility.
              </p>

              {paymentDetails?.featured_until && (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Featured until:</span>
                    <span>{new Date(paymentDetails.featured_until).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200">What happens next?</h4>
                <div className="text-left space-y-2 text-green-700 dark:text-green-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                    <span>Your bot now appears in the Premium Featured section</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                    <span>Enhanced visibility in search results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                    <span>Premium badge displayed on your bot listing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                    <span>Priority placement for 30 days</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  View Premium Section
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/my-bots')}
                >
                  Manage My Bots
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumSuccess;