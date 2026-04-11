import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthContext';
import { Bot, Search, Plus, User, LogOut, Settings, Menu, ChevronDown, Ticket, Code } from 'lucide-react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { DiscordIcon } from '@/components/icons/DiscordIcon';

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
  const location = useLocation();

  // Define admin Discord IDs
  const ADMIN_DISCORD_IDS = [
    '1374705890565029988',
    '1230645006440595614',
    // Add more admin Discord IDs as needed
  ];

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

  const isAdmin = (): boolean => {
    return userProfile && ADMIN_DISCORD_IDS.includes(userProfile.discord_id);
  };


  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 soft-shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-3 floating-animation hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="p-2 rounded-xl">
                <img src="/lovable-uploads/5420916f-cb8a-4c2b-8be2-ae87fcf516df.png" alt="Directum Logo" className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-black gradient-text font-fredoka">Directum</h1>
            </button>

            {/* Desktop Navigation Buttons */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Support
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => window.open('https://discord.gg/SVuaYxB4gq', '_blank')}>
                      <DiscordIcon className="mr-2 h-4 w-4" />
                      Discord
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/submit-ticket')}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/collections')}
                >
                  Collections
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/legal')}
                >
                  Legal
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/api-docs')}
                >
                  API
                </Button>
              </div>
            )}
          </div>

          {/* Right Side - Desktop Actions */}
          {!isMobile && (
              <div className="flex items-center space-x-4">
                {user && (
                  <Button 
                    onClick={onAddBot} 
                    className="bubbly-button text-white font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bot
                  </Button>
                )}
                
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-56" align="end" forceMount>
                       <DropdownMenuItem onClick={() => navigate('/profile')}>
                         <User className="mr-2 h-4 w-4" />
                         <span>Profile</span>
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => navigate('/my-bots')}>
                         <Bot className="mr-2 h-4 w-4" />
                         <span>My Bots</span>
                       </DropdownMenuItem>
                      {isAdmin() && (
                        <DropdownMenuItem onClick={() => navigate('/management')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Management</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Dialog open={showLogin} onOpenChange={setShowLogin}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Sign In
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogTitle className="sr-only">Sign in to DirectSum</DialogTitle>
                      <DialogDescription className="sr-only">Sign in with your Discord account to access all features</DialogDescription>
                      <DiscordLogin />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {/* Mobile user avatar/login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem onClick={() => navigate('/profile')}>
                       <User className="mr-2 h-4 w-4" />
                       <span>Profile</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate('/my-bots')}>
                       <Bot className="mr-2 h-4 w-4" />
                       <span>My Bots</span>
                     </DropdownMenuItem>
                    {isAdmin() && (
                      <DropdownMenuItem onClick={() => navigate('/management')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Management</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">Sign in to DirectSum</DialogTitle>
                    <DialogDescription className="sr-only">Sign in with your Discord account to access all features</DialogDescription>
                    <DiscordLogin />
                  </DialogContent>
                </Dialog>
              )}

              {/* Mobile menu trigger */}
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-6 mt-6">

                    {/* Add Bot/Server Button */}
                    {user && (
                      <Button 
                        onClick={() => {
                          onAddBot?.();
                          setShowMobileMenu(false);
                        }} 
                        className="glow-effect w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Bot
                      </Button>
                    )}

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground px-3">Support</span>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => {
                            window.open('https://discord.gg/yr85pkUteU', '_blank');
                            setShowMobileMenu(false);
                          }}
                        >
                          <DiscordIcon className="w-4 h-4 mr-2" />
                          Discord
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => {
                            navigate('/submit-ticket');
                            setShowMobileMenu(false);
                          }}
                        >
                          <Ticket className="w-4 h-4 mr-2" />
                          Ticket
                        </Button>
                       </div>
                       {user && (
                         <Button 
                           variant="ghost" 
                           className="justify-start"
                           onClick={() => {
                             navigate('/my-bots');
                             setShowMobileMenu(false);
                           }}
                         >
                           <Bot className="w-4 h-4 mr-2" />
                           My Bots
                         </Button>
                       )}
                       <Button 
                         variant="ghost" 
                         className="justify-start"
                         onClick={() => {
                           navigate('/collections');
                           setShowMobileMenu(false);
                         }}
                       >
                         Collections
                       </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/legal');
                          setShowMobileMenu(false);
                        }}
                      >
                        Legal
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/api-docs');
                          setShowMobileMenu(false);
                        }}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        API
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
