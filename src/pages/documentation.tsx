// deno-lint-ignore-file no-sloppy-imports
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ChevronRight, 
  BookOpen, 
  Menu, 
  X,
  LayoutGrid
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DOCS_PAGES, NAVIGATION } from './docs/content/index';

const Docs = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine which page to show
  const activeId = pageId || 'introduction';
  const PageComponent = DOCS_PAGES[activeId] || DOCS_PAGES['introduction'];

  // Close sidebar when route changes (mobile fix)
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleNavigation = (id: string) => {
    navigate(`/docs/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Mobile Page Header - Only visible on small screens */}
      <div className="lg:hidden sticky top-[64px] z-30 w-full border-b border-border bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-foreground capitalize">{activeId.replace('-', ' ')}</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md text-xs font-bold"
        >
          {isSidebarOpen ? <X size={16} /> : <LayoutGrid size={16} />}
          {isSidebarOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div className="container mx-auto flex">
        {/* Left Sidebar */}
        <aside className={`
          fixed lg:sticky top-[64px] lg:top-[73px] left-0 z-40
          h-[calc(100vh-64px)] lg:h-[calc(100vh-73px)] w-full lg:w-72 
          border-r border-border bg-background lg:bg-card/50 backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible -translate-x-full lg:translate-x-0'}
        `}>
          <ScrollArea className="h-full py-8 px-6">
            {NAVIGATION.map((group, idx) => (
              <div key={idx} className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
                  {group.group}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 lg:py-2 text-sm font-medium rounded-lg transition-colors group ${
                        activeId === item.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeId === item.id ? 'bg-primary scale-110' : 'bg-transparent'}`} />
                        {item.title}
                      </div>
                      <ChevronRight className={`w-3 h-3 transition-opacity ${activeId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-8 lg:py-12 lg:px-12 px-6 text-foreground">
          <div className="max-w-3xl mx-auto">
            {/* Desktop Breadcrumbs - Hidden on mobile because we have the mobile header */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mb-8 capitalize">
              <span>Docs</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{activeId.replace('-', ' ')}</span>
            </div>

            {/* Content Injection */}
            <article className="prose prose-invert prose-headings:font-fredoka prose-headings:font-black max-w-none">
              <PageComponent />
            </article>

            {/* Simple Footer spacing */}
            <div className="h-20 lg:h-32" />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Docs;