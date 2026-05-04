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
  Globe
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
    <div className="min-h-screen bg-[#121212] text-[#b9bbbe] selection:bg-primary/20">
      <Navbar />

      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4f545c] px-4 mb-2">Legal Documents</p>
                <button 
                  onClick={() => scrollTo('tos')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'tos' ? 'bg-[#2f3136] text-white border border-[#4f545c]/20' : 'hover:bg-[#2f3136]/50 text-[#8e9297]'}`}
                >
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <Gavel size={18} /> Terms of Service
                  </div>
                  {activeSection === 'tos' && <ChevronRight size={14} />}
                </button>
                <button 
                  onClick={() => scrollTo('privacy')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeSection === 'privacy' ? 'bg-[#2f3136] text-white border border-[#4f545c]/20' : 'hover:bg-[#2f3136]/50 text-[#8e9297]'}`}
                >
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <ShieldCheck size={18} /> Privacy Policy
                  </div>
                  {activeSection === 'privacy' && <ChevronRight size={14} />}
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#18191c] border border-[#202225]">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-white">
                  <Mail size={14} className="text-primary" /> Contact
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#4f545c]">Legal Inquiry</p>
                    <a href="mailto:developing.soulnet@gmail.com" className="text-xs text-primary hover:underline break-all font-mono">
                      developing.soulnet@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#4f545c]">Support</p>
                    <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Discord Server <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-16">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Layers size={12} /> Compliance
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white">Legal Center</h1>
              <p className="text-xl text-[#8e9297] max-w-2xl leading-relaxed">
                Review the terms and policies that govern the Directum Bot Listing platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <div id="tos" className="scroll-mt-24">
              <Card className="border-[#202225] shadow-xl overflow-hidden bg-[#18191c] backdrop-blur-sm">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold text-white">Terms of Service</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-[#8e9297]">
                    <FileText size={14} /> Last updated: 4/23/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-10">
                  
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">1</span>
                      Acceptance of Terms
                    </h3>
                    <p className="text-[#b9bbbe] leading-relaxed text-sm lg:text-base">
                      By accessing, using, or interacting with Directum (“the Service”) in any manner, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you must discontinue use of the Service immediately.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">2</span>
                      Bot Submission Guidelines
                    </h3>
                    <p className="text-[#b9bbbe] text-sm">To maintain a safe and high-quality platform, all bot submissions must adhere to the following:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Comply with Discord’s TOS & Community Guidelines",
                        "Descriptions must be accurate and not misleading",
                        "No malicious code, exploits, or harmful functions",
                        "NSFW content must be clearly labeled",
                        "No spam, duplicate, or deceptive submissions"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 rounded-lg bg-[#2f3136]/30 border border-[#4f545c]/20 text-xs text-[#8e9297] leading-relaxed">
                          <ChevronRight size={14} className="text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs italic text-[#8e9297] bg-primary/5 p-3 rounded border-l-2 border-primary">
                      Directum reserves the right to deny or remove any submission without prior notice.
                    </p>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">3</span>
                      User Responsibilities
                    </h3>
                    <ul className="space-y-2 text-sm text-[#b9bbbe]">
                      <li>• You are responsible for the accuracy of information provided</li>
                      <li>• Bot owners must ensure information remains up to date</li>
                      <li>• No vote manipulation or artificial engagement activity</li>
                      <li>• Treat others respectfully in the community environment</li>
                    </ul>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">4</span>
                      Content Moderation and Enforcement
                    </h3>
                    <p className="text-[#b9bbbe] text-sm leading-relaxed">
                      Directum reserves the right, but not the obligation, to monitor and moderate content. We may remove content, suspend accounts, and take action to protect platform integrity. All enforcement decisions are final.
                    </p>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">5</span>
                      Disclaimer of Liability
                    </h3>
                    <p className="text-[#b9bbbe] text-sm leading-relaxed">
                      Directum is a listing platform and does not control third-party bots. We do not guarantee functionality or security. Use of listed bots is at your own risk. Directum shall not be liable for any indirect, incidental, or consequential damages.
                    </p>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs">6</span>
                      Changes to Terms
                    </h3>
                    <p className="text-[#b9bbbe] text-sm leading-relaxed">
                      Directum reserves the right to modify Terms at any time. Changes become effective immediately upon posting. Continued use of the platform constitutes acceptance of revised terms.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-[#202225]" />

            {/* PRIVACY POLICY */}
            <div id="privacy" className="scroll-mt-24">
              <Card className="border-[#202225] shadow-xl overflow-hidden bg-[#18191c] backdrop-blur-sm">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold text-white">Privacy Policy</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-[#8e9297]">
                    <ShieldCheck size={14} /> Last updated: 4/25/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-10">
                  
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Info size={18} className="text-primary" /> 1. Information We Collect
                    </h3>
                    <ul className="space-y-3 text-sm text-[#b9bbbe]">
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-white">Discord Account Data</span>
                        We collect your Username, avatar, and Discord ID via Discord OAuth.
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-white">Bot Submissions</span>
                        Details provided during bot management and platform interactions.
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-white">Usage & Technical Data</span>
                        Interactions, voting patterns, and IP addresses for security.
                      </li>
                    </ul>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Lock size={18} className="text-primary" /> 2. Data Protection & Security
                    </h3>
                    <p className="text-[#b9bbbe] text-sm leading-relaxed">
                      We prioritize the security of your information using industry-standard measures, including encryption at rest and in transit.
                    </p>
                  </section>

                  {/* ADDED MISSING SECTION */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <EyeOff size={18} className="text-primary" /> 3. Data Sharing & Disclosure
                    </h3>
                    <p className="text-[#b9bbbe] text-sm leading-relaxed">
                      We do not sell or rent your personal information. Disclosure occurs only for legal compliance, to prevent fraud, or during business transfers.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Globe size={18} className="text-primary" /> 4. Your Privacy Rights
                    </h3>
                    <p className="text-[#b9bbbe] text-sm">
                      Depending on your location, you may access, correct, or delete personal data. You may withdraw consent by contacting us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-white font-bold"
                        onClick={() => window.open('https://discord.gg/UHeWA6mXxS')}
                      >
                        Request Data Deletion
                        <ExternalLink size={14} className="ml-2" />
                      </Button>
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
