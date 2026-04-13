import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme on component mount and when user changes
  useEffect(() => {
    loadTheme();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const loadTheme = async () => {
    setIsLoading(true);
    
    if (!user) {
      // Default to dark theme for unauthenticated users
      setThemeState('dark');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const savedTheme = data?.theme_preference as Theme || 'dark';
      setThemeState(savedTheme);
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemeState('dark'); // Fallback to dark theme
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    if (!user) {
      // For unauthenticated users, just apply locally
      setThemeState(newTheme);
      return;
    }

    try {
      setThemeState(newTheme);
      
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Wanted to switch themes?",
        description: `Dark mode only :)`,
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Revert the theme state if save failed
      setThemeState(theme);
      toast({
        variant: "destructive",
        title: "Error Saving Theme Preference",
        description: error.message || "Failed to save theme preference",
      });
    }
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};