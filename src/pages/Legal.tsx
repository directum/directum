// deno-lint-ignore-file no-sloppy-imports
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  Gavel, 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileText,
  Clock,
  Scale,
  Lock,
  Database,
  EyeOff
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar"; 

const Legal = () => {
  const [activeSection, setActiveSection] = useState("tos");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      window.scrollTo({ 
        top: element.getBoundingClientRect().top + window.scrollY - offset, 
        behavior: "smooth" 
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#b9bbbe] selection:bg-primary/30">
      <Navbar />

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Professional Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#4f545c] mb-6 px-2">Documentation</h2>
                <nav className="space-y-1">
                  <button 
                    onClick={() => scrollTo('tos')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all text-sm font-medium ${activeSection === 'tos' ? 'bg-[#2f3136] text-white border-l-2 border-primary pl-3' : 'text-[#8e9297] hover:text-[#dcddde] hover:bg-[#2f3136]/50'}`}
                  >
                    <div className="flex items-center gap-3"><Gavel size={16} /> Terms of Service</div>
                    <ChevronRight size={14} className={activeSection === 'tos' ? "opacity-100" : "opacity-0"} />
                  </button>
                  <button 
                    onClick={() => scrollTo('privacy')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all text-sm font-medium ${activeSection === 'privacy' ? 'bg-[#2f3136] text-white border-l-2 border-primary pl-3' : 'text-[#8e9297] hover:text-[#dcddde] hover:bg-[#2f3136]/50'}`}
                  >
                    <div className="flex items-center gap-3"><ShieldCheck size={16} /> Privacy Policy</div>
                    <ChevronRight size={14} className={activeSection === 'privacy' ? "opacity-100" : "opacity-0"} />
                  </button>
                </nav>
              </div>

              <div className="p-6 rounded-lg bg-[#18191c] border border-[#202225]">
                <h4 className="text-xs font-bold uppercase text-white mb-4 flex items-center gap-2">
                  <Mail size={14} className="text-primary" /> Contact
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#4f545c] uppercase">Direct Inquiry</p>
                    <a href="mailto:developing.soulnet@gmail.com" className="text-sm text-primary hover:underline break-all font-mono">
                      developing.soulnet@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#4f545c] uppercase">Community</p>
                    <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      Discord Support <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <main className="flex-1 max-w-3xl">
            <header className="mb-16 border-b border-[#202225] pb-10">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Directum Legal Center</h1>
              <p className="text-lg text-[#8e9297] leading-relaxed">
                Official terms and privacy protocols governing the use of the platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <article id="tos" className="scroll-mt-28 mb-24">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                <Scale size={14} /> Section 1.0
              </div>
              <h2 className="text-3xl font-bold text-white mb-6 font-fredoka">Terms of Service</h2>
              <div className="flex items-center gap-4 text-[#4f545c] text-xs mb-10 pb-6 border-b border-[#202225]">
                <span className="flex items-center gap-1"><Clock size={12} /> Effective April 23, 2026</span>
                <span className="flex items-center gap-1"><FileText size={12} /> Document: TOS-V1.4</span>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-lg font-bold text-white mb-3">1. Agreement to Terms</h3>
                  <p className="leading-7">
                    By using Directum, you agree to these Terms. If you do not agree, do not use the Service. We reserve the right to modify these terms at any time. Your continued use following changes signifies acceptance.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-3">2. Listing & Submission</h3>
                  <p className="leading-7 mb-4">Bot developers must ensure all listed content:</p>
                  <ul className="space-y-3">
                    {[
                      "Complies with Discord's Terms and Guidelines",
                      "Contains no malicious code, phishing, or malware",
                      "Provides clear and honest descriptions of functionality",
                      "Does not infringe on intellectual property rights"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-[#dcddde] items-start">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-3">3. Limitation of Liability</h3>
                  <div className="bg-[#18191c] p-6 rounded border border-[#202225]">
                    <p className="text-sm leading-6 italic text-[#8e9297]">
                      Directum is a directory service. We do not host the bots listed and are not responsible for their performance, security, or actions. Use third-party bots at your own risk. To the fullest extent permitted by law, Directum shall not be liable for any damages arising from your use of the service.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-3">4. Content Moderation</h3>
                  <p className="leading-7">
                    We maintain the right to remove any content or terminate access for any user who violates these terms or engages in behavior deemed harmful to the community. 
                  </p>
                </section>
              </div>
            </article>

            <Separator className="my-16 bg-[#202225]" />

            {/* PRIVACY POLICY */}
            <article id="privacy" className="scroll-mt-28">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                <ShieldCheck size={14} /> Section 2.0
              </div>
              <h2 className="text-3xl font-bold text-white mb-6 font-fredoka">Privacy Policy</h2>
              <div className="flex items-center gap-4 text-[#4f545c] text-xs mb-10 pb-6 border-b border-[#202225]">
                <span className="flex items-center gap-1"><Clock size={12} /> Revised April 25, 2026</span>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Database size={18} className="text-primary" /> 1. Information Handling
                  </h3>
                  <p className="leading-7">
                    We collect your Discord ID, username, and avatar via OAuth to manage your account. We also log IP addresses for security and anti-spam purposes. We do not sell your personal data to third parties.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Lock size={18} className="text-primary" /> 2. Data Security
                  </h3>
                  <p className="leading-7">
                    Your data is stored securely using industry-standard encryption. Access to user data is strictly limited to administrators for the purposes of platform maintenance and security enforcement.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <EyeOff size={18} className="text-primary" /> 3. Data Deletion
                  </h3>
                  <p className="leading-7 mb-6">
                    You may request the full deletion of your account and associated data at any time. This process is permanent and cannot be undone.
                  </p>
                  <button 
                    onClick={() => window.open('https://discord.gg/UHeWA6mXxS')}
                    className="px-5 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors"
                  >
                    Contact for Data Deletion
                  </button>
                </section>
              </div>
            </article>

            <div className="h-32" />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Legal;
