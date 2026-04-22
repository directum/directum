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
import { Search, Settings, Clock, Eye, Check, X, Bot, User, Trash2, AlertTriangle, AlertOctagon, ArrowLeft } from 'lucide-react';
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
        // Fetch discord_id directly from the database profile
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

  // Updated helpers to use the verified database ID
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

  // review
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

  // edit
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

  // users
  async function searchUserById() {
    if (!userSearchId) return;
    setUserSearching(true);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userSearchId).single();
      setFoundUser(data || null);
    } catch (e) {
      setFoundUser(null);
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
        toast({ title: 'Info', description: 'Server-side sign-out required (Edge Function)' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to sign out user', variant: 'destructive' });
    }
  }

  // alerts (localStorage)
  function loadAlertFromStorage() {
    try {
      const raw = localStorage.getItem('site_alert');
      if (!raw) return setCurrentAlert(null);
      setCurrentAlert(JSON.parse(raw));
    } catch (e) {
      setCurrentAlert(null);
    }
  }

  function saveAlert() {
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

  // removal
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
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/') }>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="w-4 h-4" /> Staff Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button variant={activeTab === 'pending' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('pending')}>Pending Review</Button>
                  <Button variant={activeTab === 'edit' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('edit')}>Edit Bots</Button>
                  <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('users')}>User Profiles</Button>
                  <Button variant={activeTab === 'alerts' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('alerts')}>Alert Banner</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {/* Pending */}
            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Pending Review</h2>
                      <p className="text-sm text-muted-foreground">Search and review pending bots before they go live.</p>
                    </div>
                    <div className="max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                        <Input className="pl-10" placeholder="Search pending bots by name or ID..." value={pendingQuery} onChange={(e) => setPendingQuery(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredPending.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-12">No pending bots.</CardContent>
                      </Card>
                    ) : (
                      filteredPending.map((b) => (
                        <Card key={b.id} className="card-gradient">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={b.avatar_url} />
                                  <AvatarFallback><Bot className="w-6 h-6" /></AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-lg font-semibold">{b.name}</div>
                                  <div className="text-xs text-muted-foreground">by {b.profiles?.username} • ID: {b.client_id}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
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
                            <div className="text-sm text-muted-foreground">{b.short_description}</div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Bots */}
            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Edit Registered Bot</h2>
                      <p className="text-sm text-muted-foreground">Search approved bots by name or ID and update their listing data.</p>
                    </div>
                    <div className="max-w-xs">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                        <Input className="pl-10" placeholder="Search approved bots..." value={editQuery} onChange={(e) => setEditQuery(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {approvedBots.filter((b) => !editQuery || (b.name || '').toLowerCase().includes(editQuery.toLowerCase()) || (b.client_id || '').includes(editQuery)).map((b) => (
                      <Card key={b.id}>
                        <CardContent className="flex items-center justify-between p-6">
                          <div>
                            <div className="font-semibold">{b.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {b.client_id}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => openEdit(b)}>Edit</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {selectedEditBot && (
                      <Card className="border-primary/50">
                        <CardContent className="p-6">
                          <div className="grid gap-4">
                            <h3 className="font-bold">Editing: {selectedEditBot.name}</h3>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Bot name" />
                            <Input value={editShort} onChange={(e) => setEditShort(e.target.value)} placeholder="Short description" />
                            <Textarea value={editLong} onChange={(e) => setEditLong(e.target.value)} rows={4} placeholder="Long description" />
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input value={editInvite} onChange={(e) => setEditInvite(e.target.value)} placeholder="Invite URL" />
                              <Input value={editSupport} onChange={(e) => setEditSupport(e.target.value)} placeholder="Support server URL" />
                            </div>
                            <div className="flex items-center gap-3">
                              <Checkbox checked={editFeatured} onCheckedChange={(v) => setEditFeatured(Boolean(v))} />
                              <div className="text-sm">Featured listing</div>
                            </div>
                            <div className="flex gap-3">
                              <Button onClick={saveEdit} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save changes'}</Button>
                              <Button variant="outline" onClick={() => setSelectedEditBot(null)}>Clear</Button>
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
                    <p className="text-sm text-muted-foreground">Search for users by ID and manage their accounts.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input value={userSearchId} onChange={(e) => setUserSearchId(e.target.value)} placeholder="Enter user ID to search..." />
                      <Button onClick={searchUserById} disabled={userSearching}>{userSearching ? 'Searching...' : 'Search'}</Button>
                    </div>

                    {foundUser ? (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16"><AvatarImage src={foundUser.avatar_url} /><AvatarFallback><User className="w-8 h-8" /></AvatarFallback></Avatar>
                            <div>
                              <div className="text-2xl font-semibold">{foundUser.username}</div>
                              <div className="text-sm text-muted-foreground">ID: {foundUser.id}</div>
                              <div className="text-sm text-muted-foreground">Discord ID: {foundUser.discord_id}</div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button variant="destructive" onClick={handleSignOutUser} className="w-full">Sign Out User From All Sessions</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center text-sm text-muted-foreground py-8">Enter a user ID above to view their profile and manage their account.</CardContent>
                      </Card>
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
                    <p className="text-sm text-muted-foreground">Set an alert banner to display on the home page.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Alert Type</label>
                      <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warning">Caution / Warning (Yellow)</SelectItem>
                          <SelectItem value="critical">Critical Alert (Red)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Alert Message</label>
                      <Textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} rows={4} placeholder="Enter the alert message..." />
                    </div>

                    {currentAlert && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex gap-3 items-start">
                            <div>{currentAlert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> : <AlertOctagon className="w-5 h-5 text-red-600" />}</div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Current Alert Active:</div>
                              <div className="text-sm mt-1">{currentAlert.message}</div>
                              <div className="text-xs text-muted-foreground mt-2">Set on {new Date(currentAlert.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={saveAlert} disabled={alertLoading} className="flex-1">{alertLoading ? 'Saving...' : 'Save Alert'}</Button>
                      <Button variant="destructive" onClick={clearAlert} disabled={!currentAlert} className="flex-1">Clear Alert</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Removal Modal */}
        <Dialog open={showRemovalModal} onOpenChange={setShowRemovalModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Remove Bot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Removal Reason</label>
                <Textarea value={removalReason} onChange={(e) => setRemovalReason(e.target.value)} rows={4} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setShowRemovalModal(false); setSelectedRemovalBot(''); setRemovalReason(''); }} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={confirmRemoval} className="flex-1">{removingBot ? 'Removing...' : 'Remove Bot'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Review Bot</DialogTitle>
            </DialogHeader>
            {reviewBot && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16"><AvatarImage src={reviewBot.avatar_url} /><AvatarFallback><Bot className="w-8 h-8" /></AvatarFallback></Avatar>
                  <div>
                    <div className="text-2xl font-bold">{reviewBot.name}</div>
                    <div className="text-sm text-muted-foreground">Owner: {reviewBot.profiles?.username} • ID: {reviewBot.client_id}</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Input value={reviewBot.name} readOnly />
                  <Textarea value={reviewBot.long_description} readOnly rows={6} />
                  <div>
                    <label className="block text-sm font-medium mb-1">Approval Notes (optional)</label>
                    <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rejection Reason (required if rejecting)</label>
                    <Textarea value={reviewRejection} onChange={(e) => setReviewRejection(e.target.value)} rows={3} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleApproveBot} disabled={actionLoading === reviewBot.id}>{actionLoading === reviewBot.id ? 'Approving...' : 'Approve'}</Button>
                    <Button variant="destructive" onClick={handleRejectBot} disabled={actionLoading === reviewBot.id}>{actionLoading === reviewBot.id ? 'Rejecting...' : 'Reject'}</Button>
                    <DialogTrigger asChild>
                      <Button variant="outline">Close</Button>
                    </DialogTrigger>
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