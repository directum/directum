import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Settings, 
  Clock, 
  Eye, 
  Check, 
  X, 
  Bot, 
  User, 
  Trash2, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Megaphone,
  Users,
  SearchX,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { isAdminDiscordId } from '@/config/admin';

type BotRow = any;

const Management: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'edit' | 'users' | 'alerts'>('pending');

  // Admin verification state
  const [adminDiscordId, setAdminDiscordId] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // pending review
  const [pendingBots, setPendingBots] = useState<BotRow[]>([]);
  const [filteredPending, setFilteredPending] = useState<BotRow[]>([]);
  const [pendingQuery, setPendingQuery] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBot, setReviewBot] = useState<BotRow | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewRejection, setReviewRejection] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // edit bots
  const [approvedBots, setApprovedBots] = useState<BotRow[]>([]);
  const [editQuery, setEditQuery] = useState('');
  const [selectedEditBot, setSelectedEditBot] = useState<BotRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editShort, setEditShort] = useState('');
  const [editLong, setEditLong] = useState('');
  const [editInvite, setEditInvite] = useState('');
  const [editSupport, setEditSupport] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // users
  const [userSearchId, setUserSearchId] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [userSearching, setUserSearching] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

  // alerts
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'warning' | 'critical'>('warning');
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [alertLoading, setAlertLoading] = useState(false);

  // removal
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [selectedRemovalBot, setSelectedRemovalBot] = useState<string>('');
  const [removalReason, setRemovalReason] = useState('');
  const [removingBot, setRemovingBot] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('discord_id')
          .eq('id', user.id)
          .single();

        const discordId = data?.discord_id;

        if (error || !discordId || !isAdminDiscordId(discordId)) {
          console.error("Access denied: Not an admin or no Discord ID found.");
          navigate('/');
          return;
        }

        setAdminDiscordId(discordId);
        await loadAll();
      } catch (e) {
        navigate('/');
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  function isAdmin() {
    return adminDiscordId ? isAdminDiscordId(adminDiscordId) : false;
  }

  function getUserDiscordId() {
    return adminDiscordId || undefined;
  }

  async function loadAll() {
    await Promise.all([fetchPending(), fetchApproved(), loadAlertFromStorage()]);
  }

  async function fetchPending() {
    try {
      const { data } = await supabase.from('bots').select('*, profiles(*)').eq('status', 'pending').order('created_at', { ascending: false }).limit(200);
      setPendingBots((data as any[]) || []);
      setFilteredPending((data as any[]) || []);
    } catch (e) {
      setPendingBots([]);
      setFilteredPending([]);
    }
  }

  async function fetchApproved() {
    try {
      const { data } = await supabase.from('bots').select('*, profiles(*)').eq('status', 'approved').order('created_at', { ascending: false }).limit(200);
      setApprovedBots((data as any[]) || []);
    } catch (e) {
      setApprovedBots([]);
    }
  }

  useEffect(() => {
    if (!pendingQuery) return setFilteredPending(pendingBots);
    const q = pendingQuery.toLowerCase();
    setFilteredPending(pendingBots.filter((b) => (b.name || '')?.toLowerCase().includes(q) || (b.client_id || '')?.toLowerCase().includes(q)));
  }, [pendingQuery, pendingBots]);

  function openReview(bot: BotRow) {
    setReviewBot(bot);
    setReviewNotes('');
    setReviewRejection('');
    setReviewOpen(true);
  }

  async function handleApproveBot() {
    if (!reviewBot) return;
    if (!isAdmin()) { toast({ title: 'Unauthorized', description: 'You are not authorized to approve bots.', variant: 'destructive' }); return; }
    setActionLoading(reviewBot.id);
    try {
      await supabase.from('bots').update({ status: 'approved' }).eq('id', reviewBot.id);
      toast({ title: 'Approved', description: `${reviewBot.name} approved.` });
      setReviewOpen(false);
      await fetchPending();
      await fetchApproved();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectBot() {
    if (!reviewBot) return;
    if (!isAdmin()) { toast({ title: 'Unauthorized', description: 'You are not authorized to reject bots.', variant: 'destructive' }); return; }
    if (!reviewRejection) { toast({ title: 'Rejection reason required' }); return; }
    setActionLoading(reviewBot.id);
    try {
      await supabase.from('bots').update({ status: 'rejected' }).eq('id', reviewBot.id);
      toast({ title: 'Rejected', description: `${reviewBot.name} rejected.` });
      setReviewOpen(false);
      await fetchPending();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }

  function openEdit(bot: BotRow) {
    setSelectedEditBot(bot);
    setEditName(bot.name || '');
    setEditShort(bot.short_description || '');
    setEditLong(bot.long_description || '');
    setEditInvite(bot.invite_url || '');
    setEditSupport(bot.support_server_url || '');
    setEditFeatured(Boolean(bot.featured));
  }

  async function saveEdit() {
    if (!selectedEditBot) return;
    if (!isAdmin()) { toast({ title: 'Unauthorized', description: 'You are not authorized to edit bots.', variant: 'destructive' }); return; }
    setEditLoading(true);
    try {
      await supabase.from('bots').update({
        name: editName,
        short_description: editShort,
        long_description: editLong,
        invite_url: editInvite,
        support_server_url: editSupport,
        featured: editFeatured,
      }).eq('id', selectedEditBot.id);
      toast({ title: 'Saved', description: 'Bot updated' });
      await fetchApproved();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  }

  async function searchUserById() {
    const query = userSearchId.trim();
    if (!query) return;
    
    setUserSearching(true);
    setFoundUser(null);
    setUserSearchError(null);

    try {
      // First try searching by internal ID (UUID)
      // Supabase .eq() with a non-uuid on a uuid column throws an error, so we handle it
      let data, error;
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);

      if (isUuid) {
        const result = await supabase.from('profiles').select('*').eq('id', query).maybeSingle();
        data = result.data;
        error = result.error;
      } else {
        // If not a UUID, search by discord_id
        const result = await supabase.from('profiles').select('*').eq('discord_id', query).maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (!data) {
        setUserSearchError(`No user found with ID: ${query}`);
        toast({ title: 'User not found', description: 'Checked both Profile ID and Discord ID.', variant: 'destructive' });
      } else {
        setFoundUser(data);
        toast({ title: 'User Found', description: `Loaded profile for ${data.username}` });
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setUserSearchError("An unexpected error occurred during the search.");
      toast({ title: 'Search Error', description: err.message || 'Check console for details.', variant: 'destructive' });
    } finally {
      setUserSearching(false);
    }
  }

  async function handleSignOutUser() {
    if (!foundUser) return;
    if (!isAdmin()) { toast({ title: 'Unauthorized', description: 'You are not authorized to sign out users.', variant: 'destructive' }); return; }
    try {
      // @ts-ignore
      if (supabase.auth?.admin?.signOut) {
        // @ts-ignore
        await supabase.auth.admin.signOut(foundUser.id, true);
        toast({ title: 'Signed out', description: 'User sessions cleared' });
      } else {
        toast({ title: 'Info', description: 'Server-side sign-out requires (Edge Function)' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to sign out user', variant: 'destructive' });
    }
  }

  function loadAlertFromStorage() {
    try {
      const raw = localStorage.getItem('site_alert');
      if (!raw) return setCurrentAlert(null);
      setCurrentAlert(JSON.parse(raw));
    } catch (e) {
      setCurrentAlert(null);
    }
  }

  async function saveAlert() {
    if (!isAdmin()) { 
      toast({ title: 'Unauthorized', description: 'You are not authorized to set alerts.', variant: 'destructive' }); 
      return; 
    }
    setAlertLoading(true);
    try {
      const payload = { 
        message: alertMessage, 
        type: alertType, 
        created_at: new Date().toISOString(), 
        by: getUserDiscordId() 
      };
      localStorage.setItem('site_alert', JSON.stringify(payload));
      setCurrentAlert(payload);
      toast({ title: 'Saved', description: 'Alert saved' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save alert', variant: 'destructive' });
    } finally {
      setAlertLoading(false);
    }
  }

  function clearAlert() {
    localStorage.removeItem('site_alert');
    setCurrentAlert(null);
    setAlertMessage('');
  }

  async function confirmRemoval() {
    if (!selectedRemovalBot) return;
    if (!isAdmin()) { toast({ title: 'Unauthorized', description: 'You are not authorized to remove bots.', variant: 'destructive' }); return; }
    setRemovingBot(true);
    try {
      await supabase.from('bots').delete().eq('id', selectedRemovalBot);
      toast({ title: 'Removed', description: 'Bot removed' });
      setShowRemovalModal(false);
      await fetchPending();
      await fetchApproved();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to remove bot', variant: 'destructive' });
    } finally {
      setRemovingBot(false);
      setSelectedRemovalBot('');
      setRemovalReason('');
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying staff permissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/') }>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            <ShieldCheck className="w-3 h-3 mr-1.5" /> Staff Session Active
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/40 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Management
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 px-2 pb-2">
                <Button variant={activeTab === 'pending' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('pending')} className={`justify-start h-11 w-full gap-3 ${activeTab === 'pending' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}>
                  <ClipboardList className={`w-4 h-4 ${activeTab === 'pending' ? 'text-primary' : ''}`} />
                  Pending Review
                </Button>
                <Button variant={activeTab === 'edit' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('edit')} className={`justify-start h-11 w-full gap-3 ${activeTab === 'edit' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}>
                  <Bot className={`w-4 h-4 ${activeTab === 'edit' ? 'text-primary' : ''}`} />
                  Edit Bots
                </Button>
                <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('users')} className={`justify-start h-11 w-full gap-3 ${activeTab === 'users' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}>
                  <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-primary' : ''}`} />
                  User Profiles
                </Button>
                <Button variant={activeTab === 'alerts' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('alerts')} className={`justify-start h-11 w-full gap-3 ${activeTab === 'alerts' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}>
                  <Megaphone className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-primary' : ''}`} />
                  Alert Banner
                </Button>
              </CardContent>
            </Card>
          </div>
        
              <div className="lg:col-span-3">
              {activeTab === 'pending' && (
              <div className="space-y-6">
               <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">Pending Review</h2>
                     <p className="text-sm text-muted-foreground">Verify and approve new bot submissions.</p>
                    </div>
                    <div className="w-full sm:max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                        <Input className="pl-10 h-10" placeholder="Search pending..." value={pendingQuery} onChange={(e) => setPendingQuery(e.target.value)} />
                     </div>
                   </div>
                 </div>

                  <div className="grid gap-4">
                    {filteredPending.length === 0 ? (
                     <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted/50">
                       <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
                         <Check className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">The queue is empty. Good job!</p>
                      </div>
                    ) : (
                     filteredPending.map((b) => (
                       <Card key={b.id} className="card-gradient overflow-hidden border-border/50">
                         <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                               <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                                <AvatarImage src={b.avatar_url} />
                                <AvatarFallback className="bg-primary/5"><Bot className="w-7 h-7 text-primary/40" /></AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-lg font-bold">{b.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                  <span className="bg-secondary/50 px-2 py-0.5 rounded text-secondary-foreground font-mono">ID: {b.client_id}</span>
                                  <span>•</span>
                                  <span>by {b.profiles?.username}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Invite Bot Link */}
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                asChild
                               >
                                <a 
                                  href={`https://discord.com/oauth2/authorize?client_id=${b.client_id}&permissions=0&scope=bot%20applications.commands`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                 >
                                   <ExternalLink className="w-4 h-4 mr-2" /> 
                                   Invite
                                 </a>
                               </Button>

                              <Button variant="outline" size="sm" onClick={() => openReview(b)}>
                                <Eye className="w-4 h-4 mr-2" /> Review
                               </Button>

                              <Button variant="destructive" size="sm" onClick={() => { setSelectedRemovalBot(b.id); setShowRemovalModal(true); }}>
                                 <Trash2 className="w-4 h-4 mr-2" /> Remove
                              </Button>
                              </div>
                          </div>
                         </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground line-clamp-2 italic">{b.short_description}</div>
                        </CardContent>
                        </Card>
                      ))
                    )}
                 </div>
               </div>
             </div>
           )}

            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">Edit Registered Bot</h2>
                      <p className="text-sm text-muted-foreground">Modify metadata for existing approved bots.</p>
                    </div>
                    <div className="w-full sm:max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                        <Input className="pl-10 h-10" placeholder="Search approved bots..." value={editQuery} onChange={(e) => setEditQuery(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {approvedBots.filter((b) => !editQuery || (b.name || '').toLowerCase().includes(editQuery.toLowerCase()) || (b.client_id || '').includes(editQuery)).map((b) => (
                      <Card key={b.id} className="hover:border-primary/30 transition-colors">
                        <CardContent className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border/50">
                              <AvatarImage src={b.avatar_url} />
                              <AvatarFallback><Bot className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{b.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{b.client_id}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openEdit(b)}>Edit Listing</Button>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedEditBot && (
                      <Card className="border-primary bg-primary/5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                        <CardContent className="p-6">
                          <div className="grid gap-6">
                            <div className="flex items-center justify-between border-b pb-4">
                              <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Modifying: {selectedEditBot.name}</h3>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedEditBot(null)}><X className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid gap-4">
                              <div className="grid gap-2"><label className="text-sm font-medium">Display Name</label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                              <div className="grid gap-2"><label className="text-sm font-medium">Short Description</label><Input value={editShort} onChange={(e) => setEditShort(e.target.value)} /></div>
                              <div className="grid gap-2"><label className="text-sm font-medium">Long Description (Markdown support)</label><Textarea value={editLong} onChange={(e) => setEditLong(e.target.value)} rows={5} /></div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2"><label className="text-sm font-medium">Invite URL</label><Input value={editInvite} onChange={(e) => setEditInvite(e.target.value)} /></div>
                                <div className="grid gap-2"><label className="text-sm font-medium">Support Server</label><Input value={editSupport} onChange={(e) => setEditSupport(e.target.value)} /></div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                                <Checkbox id="feat" checked={editFeatured} onCheckedChange={(v) => setEditFeatured(Boolean(v))} />
                                <label htmlFor="feat" className="text-sm cursor-pointer select-none">Mark as Featured Listing</label>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button onClick={saveEdit} disabled={editLoading} className="flex-1">{editLoading ? 'Saving...' : 'Save Bot Updates'}</Button>
                              <Button variant="outline" onClick={() => setSelectedEditBot(null)} className="flex-1">Cancel</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold">User Profile Lookup</h2>
                    <p className="text-sm text-muted-foreground">View developer data and manage account access.</p>
                  </div>
                  <div className="space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); searchUserById(); }} className="flex gap-2">
                      <Input value={userSearchId} onChange={(e) => setUserSearchId(e.target.value)} placeholder="Enter Profile UUID or Discord ID..." className="h-11" />
                      <Button type="submit" disabled={userSearching} className="h-11 px-6">{userSearching ? 'Searching...' : 'Search'}</Button>
                    </form>

                    {userSearchError && (
                      <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{userSearchError}</span>
                      </div>
                    )}

                    {foundUser ? (
                      <Card className="border-border/60 animate-in fade-in zoom-in-95 duration-300">
                        <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                              <AvatarImage src={foundUser.avatar_url} />
                              <AvatarFallback className="text-3xl font-bold bg-secondary"><User className="w-12 h-12" /></AvatarFallback>
                            </Avatar>
                            <div className="text-center md:text-left flex-1">
                              <div className="text-3xl font-bold mb-1">{foundUser.username}</div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                  <span className="font-mono bg-muted px-2 py-0.5 rounded">ID: {foundUser.id}</span>
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-indigo-500">Discord: {foundUser.discord_id}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t">
                            <Button variant="destructive" onClick={handleSignOutUser} className="w-full h-11 bg-red-600 hover:bg-red-700">
                              Revoke All Session Tokens
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : !userSearchError && (
                      <div className="text-center py-16 border-2 border-dotted rounded-2xl">
                        <SearchX className="w-10 h-10 text-muted/30 mx-auto mb-4" />
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm">Enter a valid identifier to fetch real-time profile data and moderation tools.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Site Alert Banner</h2>
                    <p className="text-sm text-muted-foreground">Broadcast critical information to all visitors.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Priority Level</label>
                        <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warning">Yellow Caution (Informational/Warning)</SelectItem>
                            <SelectItem value="critical">Red Alert (System Outage/Critical)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Alert Content</label>
                        <Textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} rows={4} placeholder="Enter the text to display at the top of the site..." className="resize-none" />
                      </div>
                    </div>
                    {currentAlert && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Preview</label>
                        <Card className={`bg-zinc-950 border-2 ${currentAlert.type === 'warning' ? 'border-yellow-500/30' : 'border-red-500/30'} shadow-2xl overflow-hidden`}>
                          <CardContent className="p-10">
                            <div className="flex flex-col items-center text-center gap-5">
                              <div className={`p-4 rounded-full ${currentAlert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                                {currentAlert.type === 'warning' ? <AlertTriangle className="w-14 h-14 text-yellow-500 animate-pulse" /> : <AlertOctagon className="w-14 h-14 text-red-500 animate-pulse" />}
                              </div>
                              <div className="max-w-md">
                                <h4 className={`text-xl font-black mb-2 tracking-tight ${currentAlert.type === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>{currentAlert.type === 'warning' ? 'SYSTEM CAUTION' : 'CRITICAL UPDATE'}</h4>
                                <p className="text-zinc-100 text-base leading-relaxed font-medium">{currentAlert.message}</p>
                                <div className="text-[9px] text-zinc-600 mt-8 uppercase tracking-[0.2em] font-mono">Deployed: {new Date(currentAlert.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={saveAlert} disabled={alertLoading} className="flex-1 h-11 text-base shadow-lg shadow-primary/20">{alertLoading ? 'Processing...' : 'Apply Alert Banner'}</Button>
                      <Button variant="secondary" onClick={clearAlert} disabled={!currentAlert} className="flex-1 h-11 text-base">Clear Active Alert</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Removal Modal */}
        <Dialog open={showRemovalModal} onOpenChange={setShowRemovalModal}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive font-bold"><Trash2 className="w-5 h-5" /> Permanently Remove</DialogTitle></DialogHeader>
            <div className="space-y-5 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">This action will immediately delete the bot listing and all associated data. This cannot be undone.</p>
              <div><label className="text-sm font-semibold mb-2 block">Reason for Removal</label><Textarea value={removalReason} onChange={(e) => setRemovalReason(e.target.value)} rows={4} placeholder="Breach of TOS, malicous code, etc..." /></div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { setShowRemovalModal(false); setSelectedRemovalBot(''); setRemovalReason(''); }} className="flex-1">Keep Bot</Button>
                <Button variant="destructive" onClick={confirmRemoval} className="flex-1 h-11">{removingBot ? 'Deleting...' : 'Delete Bot'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader className="border-b pb-4 mb-6"><DialogTitle className="text-2xl">Submission Review</DialogTitle></DialogHeader>
            {reviewBot && (
              <div className="space-y-8">
                <div className="flex items-center gap-5 p-4 bg-muted/40 rounded-2xl">
                  <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg"><AvatarImage src={reviewBot.avatar_url} /><AvatarFallback><Bot className="w-10 h-10" /></AvatarFallback></Avatar>
                  <div>
                    <div className="text-3xl font-black">{reviewBot.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Badge variant="outline">Owner: {reviewBot.profiles?.username}</Badge><Badge variant="outline" className="font-mono">ID: {reviewBot.client_id}</Badge></div>
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2"><label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Metadata Name</label><Input value={reviewBot.name} readOnly className="bg-muted border-none font-medium" /></div>
                  <div className="grid gap-2"><label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Description Preview</label><Textarea value={reviewBot.long_description} readOnly rows={8} className="bg-muted border-none leading-relaxed text-sm" /></div>
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-2"><label className="block text-sm font-semibold mb-1">Approval Notes (optional)</label><Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} placeholder="Add context for this approval..." /></div>
                    <div className="space-y-2"><label className="block text-sm font-semibold mb-1 text-red-500">Rejection Reason (required if rejecting)</label><Textarea value={reviewRejection} onChange={(e) => setReviewRejection(e.target.value)} rows={3} placeholder="Explain why the bot was rejected..." /></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button onClick={handleApproveBot} disabled={actionLoading === reviewBot.id} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-lg">{actionLoading === reviewBot.id ? 'Processing...' : 'Approve Submission'}</Button>
                    <Button variant="destructive" onClick={handleRejectBot} disabled={actionLoading === reviewBot.id} className="flex-1 h-12 text-lg">{actionLoading === reviewBot.id ? 'Processing...' : 'Reject Submission'}</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Management;
