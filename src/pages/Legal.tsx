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
  Database
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

      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
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
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Legal Inquiry</p>
                    <a href="mailto:developing.soulnet@gmail.com" className="text-xs text-primary hover:underline break-all font-mono">
                      developing.soulnet@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-16">
            <header className="space-y-4">
              <h1 className="text-5xl font-black font-fredoka tracking-tight">Legal Center</h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Review the terms and policies that govern the Directum platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <div id="tos" className="scroll-mt-24">
              <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FileText size={14} /> Last updated: 4/25/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-10">
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">1</span>
                      Acceptance of Terms
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      By accessing, using, or interacting with Directum (“the Service”) in any manner, you agree to be bound by these Terms. If you do not agree, you must discontinue use immediately.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">2</span>
                      Bot Submission Guidelines
                    </h3>
                    <p className="text-muted-foreground text-sm">All submissions must adhere to the following:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Comply with Discord’s TOS & Community Guidelines",
                        "Descriptions must be accurate and not misleading",
                        "No malicious code, exploits, or harmful functions",
                        "NSFW content must be clearly labeled",
                        "No spam, duplicate, or deceptive submissions"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 text-xs text-muted-foreground">
                          <ChevronRight size={14} className="text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">3</span>
                      User Responsibilities
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• You are responsible for the accuracy of information provided</li>
                      <li>• Bot owners must ensure information remains up to date</li>
                      <li>• No vote manipulation or artificial engagement activity</li>
                      <li>• Treat others respectfully in the community environment</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">4</span>
                      Dispute Resolution & Liability
                    </h3>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">Mandatory Process</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Attempt informal resolution by contacting Directum first. Unresolved disputes must be settled through binding individual arbitration. You waive the right to participate in class actions or external litigation. As a US-based hobby project, we operate under US legal jurisdiction.
                      </p>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>

            {/* PRIVACY POLICY */}
            <div id="privacy" className="scroll-mt-24">
              <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-accent w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <ShieldCheck size={14} /> Last updated: 4/25/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-10">
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Info size={18} className="text-primary" /> 1. Information We Collect
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Discord Account</span>
                        Username, avatar, and Discord ID via the 'identify' scope. We do NOT collect your email.
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Bot Submissions</span>
                        Details provided during bot management.
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">Usage & Technical Data</span>
                        Interactions, voting, IP address, and browser info for security purposes.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Lock size={18} className="text-primary" /> 2. Data Security & Protection
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We utilize industry-standard 3rd party infrastructure to keep your data secure:
                    </p>
                    <ul className="space-y-2">
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <Database size={14} className="text-primary" />
                        <strong>Infrastructure:</strong> Hosted on Vercel and Supabase (SOC 2 Type 2 Compliant).
                      </li>
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <ShieldCheck size={14} className="text-primary" />
                        <strong>Encryption:</strong> AES-256 at rest and TLS encryption in transit.
                      </li>
                      <li className="text-xs text-muted-foreground flex gap-2">
                        <ChevronRight size={14} className="text-primary" />
                        <strong>RLS:</strong> Supabase Row Level Security is enabled to ensure data isolation.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">3</span>
                      Your Privacy Rights
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Depending on location, you may access, correct, or delete personal data, withdraw consent, or object to processing.
                    </p>
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
