import { useCookies } from '@/contexts/CookieContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings } from 'lucide-react';
import { useState } from 'react';

export const CookieBanner = () => {
  const { showBanner, preferences, acceptAll, rejectAll, updatePreferences, dismissBanner } = useCookies();
  const [showDetails, setShowDetails] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    updatePreferences(tempPreferences);
    setShowDetails(false);
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50">
        <Card className="border-border bg-background/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cookie className="h-4 w-4" />
              Cookie Preferences
            </CardTitle>
            <CardDescription className="text-sm">
              We use cookies to enhance your experience and analyze site usage. You can customize your preferences or accept all.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0 gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="w-full sm:w-auto"
            >
              <Settings className="h-3 w-3 mr-1" />
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="w-full sm:w-auto"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="w-full sm:w-auto"
            >
              Accept All
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you'd like to accept. Necessary cookies are required for the site to function.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Necessary</Label>
                <p className="text-xs text-muted-foreground">Required for basic site functionality</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Analytics</Label>
                <p className="text-xs text-muted-foreground">Help us understand site usage</p>
              </div>
              <Switch
                checked={tempPreferences.analytics}
                onCheckedChange={(checked) =>
                  setTempPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Marketing</Label>
                <p className="text-xs text-muted-foreground">Personalized ads and content</p>
              </div>
              <Switch
                checked={tempPreferences.marketing}
                onCheckedChange={(checked) =>
                  setTempPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Functional</Label>
                <p className="text-xs text-muted-foreground">Enhanced features and preferences</p>
              </div>
              <Switch
                checked={tempPreferences.functional}
                onCheckedChange={(checked) =>
                  setTempPreferences(prev => ({ ...prev, functional: checked }))
                }
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(false)} className="flex-1">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};