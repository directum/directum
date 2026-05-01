import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  Gavel, 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileText,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("tos");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          {/* Sticky Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-8 space-y-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="group hover:bg-secondary transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Legal Documents</p>
                <button 
                  onClick={() => scrollTo('tos')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'tos' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                >
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <Gavel size={18} /> Terms of Service
                  </div>
                  {activeSection === 'tos' && <ChevronRight size={14} />}
                </button>
                <button 
                  onClick={() => scrollTo('privacy')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'privacy' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                >
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <ShieldCheck size={18} /> Privacy Policy
                  </div>
                  {activeSection === 'privacy' && <ChevronRight size={14} />}
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Mail size={14} className="text-primary" /> Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Legal</p>
                    <a href="mailto:developing.soulnet@gmail.com" className="text-xs text-primary hover:underline break-all font-mono">
                      developing.soulnet@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Support</p>
                    <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Discord Server <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-16">
            <header className="space-y-4">
              <h1 className="text-5xl font-black font-fredoka tracking-tight">Legal Center</h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Terms of Service and Privacy Policy for the Directum Bot Listing platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <div id="tos" className="scroll-mt-24">
              <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText size={14} /> Last updated: 4/23/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-10">
                  
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">1</span>
                      Acceptance of Terms
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                      By accessing, using, or interacting with Directum (“the Service”) in any manner, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you must discontinue use of the Service immediately.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">2</span>
                      Bot Submission Guidelines
                    </h3>
                    <p className="text-muted-foreground text-sm">To maintain a safe and high-quality platform, all bot submissions must adhere to the following:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Comply with Discord’s TOS & Community Guidelines",
                        "Descriptions must be accurate and not misleading",
                        "No malicious code, exploits, or harmful functions",
                        "NSFW content must be clearly labeled",
                        "No spam, duplicate, or deceptive submissions"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                          <ChevronRight size={14} className="text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs italic text-muted-foreground bg-primary/5 p-3 rounded border-l-2 border-primary">
                      Directum reserves the right to deny or remove any submission without prior notice.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">3</span>
                      User Responsibilities
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">By using Directum, you agree that:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span>•</span> You are responsible for the accuracy of information provided</li>
                      <li className="flex gap-2"><span>•</span> Bot owners must ensure information remains up to date</li>
                      <li className="flex gap-2"><span>•</span> No vote manipulation or artificial engagement activity</li>
                      <li className="flex gap-2"><span>•</span> Treat others respectfully in the community environment</li>
                    </ul>
                    <p className="text-xs italic text-muted-foreground border-l-2 border-muted pl-4 mt-2">
                      Failure to comply may result in content removal, suspension, or termination of your account.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">4</span>
                      Content Moderation and Enforcement
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum reserves the right, but not the obligation, to monitor and moderate content. We may remove content, suspend accounts, and take action to protect platform integrity.
                    </p>
                    <p className="text-sm font-bold text-foreground">All enforcement decisions are final.</p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">5</span>
                      Disclaimer of Liability
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum is a listing platform and does not control third-party bots. We do not guarantee functionality or security. Use at your own risk.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">6</span>
                      Limitation of Liability
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">7</span>
                      Dispute Resolution
                    </h3>
                    <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-widest">Mandatory Process</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Attempt informal resolution by contacting Directum first</li>
                        <li>• Unresolved disputes settled through binding individual arbitration</li>
                        <li>• Waiver of right to participate in class actions</li>
                        <li>• Handled confidentially outside of public court</li>
                      </ul>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">8</span>
                      Changes to Terms
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum reserves the right to modify Terms at any time. Changes become effective immediately upon posting.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">9</span>
                      Termination
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We reserve the right to suspend or terminate access at any time for conduct that violates these Terms or is harmful to the platform.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-border/50" />

            {/* PRIVACY POLICY */}
            <div id="privacy" className="scroll-mt-24">
              <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-accent w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                  <CardDescription>How we collect, use, and protect your information</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-12">
                  
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold">1. Information We Collect</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { t: "Discord Account", d: "Username, avatar, and Discord ID" },
                        { t: "Bot Submissions", d: "Details provided during bot management" },
                        { t: "Usage Data", d: "Interactions, voting, and engagement" },
                        { t: "Technical Data", d: "IP address, browser, and device info" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                          <p className="text-sm font-bold mb-1">{item.t}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.d}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold">2. How We Use Your Information</h3>
                    <ul className="space-y-3">
                      {[
                        "Operating and maintaining the Service",
                        "Authenticating users and preventing fraud or abuse",
                        "Communicating updates and service announcements",
                        "Improving platform performance and experience",
                        "Complying with legal obligations"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold">3. Data Sharing and Disclosure</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We do not sell or rent your personal information. Disclosure occurs only with consent, for legal compliance, to enforce TOS, to prevent fraud, or during business acquisitions.
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold">4. Data Security</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We use technical safeguards to protect data. However, no internet transmission is 100% secure; we cannot guarantee absolute security.
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold">5. Data Retention</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We retain data only as long as necessary for business purposes or as legally required.
                      </p>
                    </section>
                  </div>

                  <section className="p-8 rounded-2xl bg-primary/5 border border-primary/10 space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-primary" size={24} />
                      <h3 className="text-xl font-bold">6. Your Privacy Rights</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Depending on location, you may access, correct, or delete personal data, withdraw consent, or object to processing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-white font-bold"
                        onClick={() => window.open('https://discord.gg/UHeWA6mXxS')}
                      >
                        Request Data Deletion
                        <ExternalLink size={14} className="ml-2" />
                      </Button>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-4 py-2 bg-secondary/50 rounded-lg">
                        <Info size={12} /> Verification may be required
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold">7. Cookies and Tracking</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We use cookies to maintain sessions and analyze patterns. You may disable them via browser settings, though it may affect features.
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold">8. Third-Party Services</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We rely on third parties like Discord. We aren't responsible for their privacy practices.
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold">9. Children's Privacy</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Not intended for individuals under Discord's required age. We don't knowingly collect child data.
                      </p>
                    </section>
                  </div>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold">10. Policy Changes</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Policy updates become effective upon posting. Continued use constitutes acceptance.
                    </p>
                  </section>

                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      
      <div className="h-32" />
    </div>
  );
};

export default Legal;