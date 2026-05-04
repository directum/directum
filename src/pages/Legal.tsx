// deno-lint-ignore-file no-sloppy-imports
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  Gavel, 
  Mail, 
  ExternalLink,
  ChevronRight,
  FileText,
  Clock,
  Scale
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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-200">
      <Navbar />

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Professional Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Documentation</h2>
                <nav className="space-y-2">
                  <button 
                    onClick={() => scrollTo('tos')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all text-sm font-medium ${activeSection === 'tos' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3"><Gavel size={16} /> Terms of Service</div>
                    <ChevronRight size={14} className={activeSection === 'tos' ? "opacity-100" : "opacity-0"} />
                  </button>
                  <button 
                    onClick={() => scrollTo('privacy')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all text-sm font-medium ${activeSection === 'privacy' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-3"><ShieldCheck size={16} /> Privacy Policy</div>
                    <ChevronRight size={14} className={activeSection === 'privacy' ? "opacity-100" : "opacity-0"} />
                  </button>
                </nav>
              </div>

              <div className="p-6 rounded-lg bg-slate-100 border border-slate-200">
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-4 flex items-center gap-2">
                  <Mail size={14} /> Legal Contact
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Email Inquiries</p>
                    <a href="mailto:developing.soulnet@gmail.com" className="text-sm text-blue-600 hover:underline break-all font-mono">
                      developing.soulnet@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Community Support</p>
                    <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      Discord Server <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Clean Content Area */}
          <main className="flex-1 max-w-3xl">
            <header className="mb-16 border-b border-slate-200 pb-10">
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Directum Legal Center</h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                The governing guidelines and data protection policies for the Directum Bot Listing platform.
              </p>
            </header>

            {/* TERMS OF SERVICE */}
            <article id="tos" className="scroll-mt-28 mb-24">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                <Scale size={14} /> Agreement
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Terms of Service</h2>
              <div className="flex items-center gap-4 text-slate-400 text-sm mb-10 pb-6 border-b border-slate-100">
                <span className="flex items-center gap-1"><Clock size={14} /> Effective: April 23, 2026</span>
                <span className="flex items-center gap-1"><FileText size={14} /> Version 1.4</span>
              </div>

              <div className="prose prose-slate max-w-none space-y-12">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h3>
                  <p className="text-slate-600 leading-7">
                    By accessing or using Directum (“the Service”), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms apply to all visitors, users, and bot developers who access the service.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">2. Submission & Listing Policy</h3>
                  <p className="text-slate-600 leading-7 mb-4">All bot submissions must maintain compliance with the following standards:</p>
                  <ul className="space-y-3 list-none pl-0">
                    {["Full compliance with Discord's Terms of Service", "Accurate and transparent bot descriptions", "Strict prohibition of malicious code or exploits", "Appropriate labeling of NSFW functionality"].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">3. User Conduct</h3>
                  <p className="text-slate-600 leading-7">
                    Users are prohibited from engaging in vote manipulation, artificial traffic generation, or harassment within the community. Bot owners are responsible for keeping their listings current and providing support to their users.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">4. Content Moderation</h3>
                  <p className="text-slate-600 leading-7">
                    We reserve the right to remove any bot or user account that violates these terms or Discord's community guidelines. All moderation actions are at the discretion of the Directum administration team.
                  </p>
                </section>

                <section className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">5. Limitation of Liability</h3>
                  <p className="text-sm text-slate-500 leading-6 italic">
                    Directum is provided "as is" without warranties of any kind. We are not responsible for the actions of third-party bots listed on our platform. Disputes must be handled through individual arbitration under the jurisdiction of the United States.
                  </p>
                </section>
              </div>
            </article>

            <Separator className="my-16 bg-slate-200" />

            {/* PRIVACY POLICY */}
            <article id="privacy" className="scroll-mt-28">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                <ShieldCheck size={14} /> Security
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Privacy Policy</h2>
              <div className="flex items-center gap-4 text-slate-400 text-sm mb-10 pb-6 border-b border-slate-100">
                <span className="flex items-center gap-1"><Clock size={14} /> Last Revision: April 25, 2026</span>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">1. Data Collection</h3>
                  <p className="text-slate-600 leading-7 mb-4">To provide our services, we collect limited personal data through Discord OAuth:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded">
                      <p className="text-sm font-bold text-slate-900">Identity Data</p>
                      <p className="text-xs text-slate-500">Discord ID, Username, and Avatar.</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded">
                      <p className="text-sm font-bold text-slate-900">Technical Data</p>
                      <p className="text-xs text-slate-500">IP address and browser metadata.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">2. Security Measures</h3>
                  <p className="text-slate-600 leading-7">
                    Your data is stored using AES-256 encryption at rest and TLS encryption in transit. Our infrastructure is managed via Supabase and Vercel, ensuring high-level security compliance (SOC 2 Type 2).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">3. Data Subject Rights</h3>
                  <p className="text-slate-600 leading-7 mb-6">
                    You have the right to access, rectify, or delete your data at any time. To exercise these rights, please contact us or join our Discord community.
                  </p>
                  <button 
                    onClick={() => window.open('https://discord.gg/UHeWA6mXxS')}
                    className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors"
                  >
                    Contact Support for Data Requests
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
