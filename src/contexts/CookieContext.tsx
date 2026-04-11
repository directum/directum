import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  showBanner: boolean;
  updatePreferences: (preferences: CookiePreferences) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  dismissBanner: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  functional: false,
};

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie-preferences');
    const consentStatus = localStorage.getItem('cookie-consent');
    
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
    
    if (consentStatus) {
      setHasConsented(true);
    } else {
      setShowBanner(true);
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    const updatedPreferences = { ...newPreferences, necessary: true };
    setPreferences(updatedPreferences);
    localStorage.setItem('cookie-preferences', JSON.stringify(updatedPreferences));
    localStorage.setItem('cookie-consent', 'true');
    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    updatePreferences(allAccepted);
  };

  const rejectAll = () => {
    updatePreferences(defaultPreferences);
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented,
        showBanner,
        updatePreferences,
        acceptAll,
        rejectAll,
        dismissBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

export const useCookies = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
};