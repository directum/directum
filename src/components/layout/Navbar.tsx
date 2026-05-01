import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { Bot, Plus, User, LogOut, Settings, Menu, Ticket, Code, Layers, Users, FileText, BookOpen } from 'lucide-react';
import { DiscordLogin } from '@/components/auth/DiscordLogin';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { DiscordIcon } from '@/components/icons/DiscordIcon';
import { isAdminDiscordId } from '@/config/admin';

interface NavbarProps {
  onAddBot?: () => void;
}

export const Navbar = ({ onAddBot }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const isAdmin = (): boolean => isAdminDiscordId(userProfile?.discord_id);

  const handleAddBot = () => {
    if (onAddBot) {
      onAddBot();
    } else {
      navigate('/my-bots');
    }
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 soft-shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="p-2 rounded-xl">
                <img src="/lovable-uploads/5420916f-cb8a-4c2b-8be2-ae87fcf516df.png" alt="Directum Logo" className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-black gradient-text font-fredoka">Directum</h1>
            </button>

            {!isMobile && (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/collections')}>Collections</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/partners')}>Partners</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/Docs')}>Docs</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/legal')}>Legal</Button>
              </div>
            )}
          </div>

          {/* Desktop Right Side */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {user && onAddBot && (
                <Button onClick={handleAddBot} className="bubbly-button text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Add Bot
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => window.open('https://discord.gg/UHeWA6mXxS', '_blank')}>
                <DiscordIcon className="w-4 h-4" />
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bots')}><Bot className="mr-2 h-4 w-4" />My Bots</DropdownMenuItem>
                    {isAdmin() && <DropdownMenuItem onClick={() => navigate('/management')}><Settings className="mr-2 h-4 w-4" />Management</DropdownMenuItem>}
                    <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild><Button variant="outline">Sign In</Button></DialogTrigger>
                  <DialogContent><DiscordLogin /></DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bots')}><Bot className="mr-2 h-4 w-4" />My Bots</DropdownMenuItem>
                    {isAdmin() && <DropdownMenuItem onClick={() => navigate('/management')}><Settings className="mr-2 h-4 w-4" />Management</DropdownMenuItem>}
                    <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild><Button variant="outline" size="sm">Sign In</Button></DialogTrigger>
                  <DialogContent><DiscordLogin /></DialogContent>
                </Dialog>
              )}

              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm"><Menu className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-lg border-l border-border">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header Branding */}
                    <div className="flex items-center space-x-3 mb-8 pt-4">
                      <img src="/lovable-uploads/5420916f-cb8a-4c2b-8be2-ae87fcf516df.png" alt="Logo" className="h-8 w-8" />
                      <span className="text-2xl font-black gradient-text font-fredoka">Directum</span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {user && onAddBot && (
                        <Button 
                          onClick={() => { handleAddBot(); setShowMobileMenu(false); }} 
                          className="bubbly-button w-full text-white font-bold mb-4"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Bot
                        </Button>
                      )}

                      <Button variant="ghost" className="justify-start h-12 px-4 hover:bg-primary/10" onClick={() => { navigate('/collections'); setShowMobileMenu(false); }}>
                        <Layers className="w-5 h-5 mr-3 text-primary" /> Collections
                      </Button>
                      
                      <Button variant="ghost" className="justify-start h-12 px-4 hover:bg-primary/10" onClick={() => { navigate('/partners'); setShowMobileMenu(false); }}>
                        <Users className="w-5 h-5 mr-3 text-primary" /> Partners
                      </Button>

                      <Button variant="ghost" className="justify-start h-12 px-4 hover:bg-primary/10" onClick={() => { navigate('/Docs'); setShowMobileMenu(false); }}>
                        <BookOpen className="w-5 h-5 mr-3 text-primary" /> Documentation
                      </Button>

                      <Button variant="ghost" className="justify-start h-12 px-4 hover:bg-primary/10" onClick={() => { navigate('/legal'); setShowMobileMenu(false); }}>
                        <FileText className="w-5 h-5 mr-3 text-primary" /> Legal
                      </Button>

                      <Separator className="my-4 opacity-50" />

                      <Button variant="ghost" className="justify-start h-12 px-4 hover:bg-secondary" onClick={() => window.open('https://discord.gg/UHeWA6mXxS', '_blank')}>
                        <DiscordIcon className="w-5 h-5 mr-3" /> Community Discord
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Helper for mobile menu separator
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-border ${className}`} />
);