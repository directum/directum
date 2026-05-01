// deno-lint-ignore-file no-sloppy-imports
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CookieProvider } from "@/contexts/CookieContext";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Management from "./pages/Management";
import BotEdit from "./pages/BotEdit";
import BotDetail from "./pages/BotDetail";
import Legal from "./pages/Legal";

import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import ApiDocs from "./pages/docs/content/ApiDocs.tsx";
import MyBots from "./pages/MyBots";
import PremiumSuccess from "./pages/PremiumSuccess";
import NotFound from "./pages/NotFound";
import Partners from "./pages/Partners";
// Import the Docs component we created
import Docs from "./pages/documentation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <CookieProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CookieBanner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<PublicProfile />} />
                <Route path="/management" element={<Management />} />
                <Route path="/bot/edit/:botId" element={<BotEdit />} />
                <Route path="/bot/:botId" element={<BotDetail />} />
                <Route path="/legal" element={<Legal />} />
                
                <Route path="/collections" element={<Collections />} />
                <Route path="/collection/:collectionId" element={<CollectionDetail />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/my-bots" element={<MyBots />} />

                {/* Documentation Routes */}
                {/* This handles /docs */}
                <Route path="/docs" element={<Docs />} />
                {/* This handles /docs/introduction, /docs/guidelines, etc */}
                <Route path="/docs/:pageId" element={<Docs />} />
                
                <Route path="/premium-success" element={<PremiumSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </TooltipProvider>
        </CookieProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;