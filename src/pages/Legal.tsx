// deno-lint-ignore-file no-sloppy-imports
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  Gavel, 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileText,
  Info,
  Layers,
  Lock,
  Database,
  EyeOff,
  Clock,
  Globe,
  Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar"; 

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
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto">
          
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Legal Documents</p>
                <div className="flex flex-row lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                  <button 
                    onClick={() => scrollTo('tos')}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'tos' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50 text-muted-foreground border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3 font-medium text-sm">
                      <Gavel size={18} /> Terms of Service
                    </div>
                    <ChevronRight size={14} className={`hidden lg:block ${activeSection === 'tos' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                  <button 
                    onClick={() => scrollTo('privacy')}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'privacy' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50 text-muted-foreground border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3 font-medium text-sm">
                      <ShieldCheck size={18} /> Privacy Policy
                    </div>
                    <ChevronRight size={14} className={`hidden lg:block ${activeSection === 'privacy' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Mail size={14} className="text-primary" /> Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Legal Inquiry</p>
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

          <main className="flex-1 space-y-12 lg:space-y-16">
            <header className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black font-fredoka tracking-tight">Legal Center</h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Review the terms and policies that govern the Directum Bot Listing platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <div id="tos" className="scroll-mt-24">
              <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-6 lg:p-8">
                  <CardTitle className="text-2xl lg:text-3xl font-bold">Terms of Service</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText size={14} /> Last updated: 4/23/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 lg:p-8 pt-0 space-y-10">
                  
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">1</span>
                      Acceptance of Terms
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                      By accessing, using, or interacting with Directum (“the Service”) in any manner, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you must discontinue use of the Service immediately. These terms constitute a legally binding agreement between you and Directum regarding your use of our platform.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">2</span>
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
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">3</span>
                      User Responsibilities
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span>•</span> You are responsible for the accuracy of information provided</li>
                      <li className="flex gap-2"><span>•</span> Bot owners must ensure information remains up to date</li>
                      <li className="flex gap-2"><span>•</span> No vote manipulation or artificial engagement activity</li>
                      <li className="flex gap-2"><span>•</span> Treat others respectfully in the community environment</li>
                      <li className="flex gap-2"><span>•</span> You agree not to bypass any security measures or rate-limiting.</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">4</span>
                      Content Moderation and Enforcement
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum reserves the right, but not the obligation, to monitor and moderate content. We may remove content, suspend accounts, and take action to protect platform integrity. All enforcement decisions are final. This includes the right to remove any bot that is deemed harmful, offensive, or in violation of these terms without providing a refund or prior notification.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">5</span>
                      Disclaimer of Liability
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum is a listing platform and does not control third-party bots. We do not guarantee functionality or security. Use of listed bots is at your own risk. Directum shall not be liable for any indirect, incidental, or consequential damages. The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">6</span>
                      Dispute Resolution
                    </h3>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">MANDATORY PROCESS</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Attempt informal resolution by contacting Directum first. Unresolved disputes must be settled through binding individual arbitration. You waive the right to participate in class actions or external litigation. As a US-based hobby project, we operate under US legal jurisdiction.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs shrink-0">7</span>
                      Changes to Terms
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum reserves the right to modify Terms at any time. Changes become effective immediately upon posting. Continued use of the platform constitutes acceptance of revised terms.
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
                <CardHeader className="p-6 lg:p-8">
                  <CardTitle className="text-2xl lg:text-3xl font-bold">Privacy Policy</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <ShieldCheck size={14} /> Last updated: 4/25/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 lg:p-8 pt-0 space-y-10">
                  
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Info size={18} className="text-primary shrink-0" /> 1. Information We Collect
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Discord Account Data</span>
                        We collect your Username, avatar, and Discord ID via Discord OAuth. This is processed under the legal basis of "Contractual Necessity."
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Bot Submissions</span>
                        Details provided during bot management and platform interactions, including public bot metadata.
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Usage & Technical Data</span>
                        Interactions, voting patterns, and metadata for security and analytics (Legitimate Interest).
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Lock size={18} className="text-primary shrink-0" /> 2. Data Protection & Security
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We prioritize the security of your information using industry-standard measures:
                    </p>
                    <ul className="space-y-2">
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <Database size={14} className="text-primary shrink-0" />
                        <strong>Infrastructure:</strong> Hosted on Vercel and Supabase (SOC 2 Type 2 compliant).
                      </li>
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <ShieldCheck size={14} className="text-primary shrink-0" />
                        <strong>Encryption:</strong> AES-256 at rest and TLS in transit.
                      </li>
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <ChevronRight size={14} className="text-primary shrink-0" />
                        <strong>Isolation:</strong> Row Level Security (RLS) ensures isolated data access.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Scale size={18} className="text-primary shrink-0" /> 3. International Data Transfers (GDPR)
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Directum is located in the US. By using the service, you acknowledge information will be processed in the US. We utilize Standard Contractual Clauses (SCCs) via our subprocessors to protect EEA/UK data.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <EyeOff size={18} className="text-primary shrink-0" /> 4. Data Sharing & Disclosure
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We do not sell or rent your personal information. Disclosure occurs only for legal compliance, fraud prevention, or business transfers.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Clock size={18} className="text-primary shrink-0" /> 5. Data Retention
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We retain data only as long as necessary. Inactive account data may be purged after 12 months.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Globe size={18} className="text-primary shrink-0" /> 6. Your Privacy Rights (GDPR/CCPA)
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Depending on your location, you have the right to access, correct, or delete personal data. We respond to all valid requests within 30 days.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <Button 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold"
                        onClick={() => window.open('https://discord.gg/UHeWA6mXxS')}
                      >
                        Request Data Deletion
                        <ExternalLink size={14} className="ml-2" />
                      </Button>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-4 py-2 bg-secondary/50 rounded-lg">
                        <Info size={12} className="shrink-0" /> Identity verification via Discord required.
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Legal;
