import React from 'react';
import { Search, Activity, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';

const HowWeReview = () => {
  return (
    <>
      <h1 className="text-5xl mb-6">How We Review Bots</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        At Directum, we do our best to ensure bots are safe when they are added to our site. 
        Below is a transparent look at how our team reviews every submission.
      </p>

      <section className="prose prose-invert max-w-none">
        <p>
          When bots are first submitted, they are placed in a queue for our dedicated reviewers. 
          Our team audits the information provided and invites the bot to a secure environment for live testing.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Our Testing Checklist</h2>
        
        <div className="space-y-10">
          <div className="flex gap-4">
            <Activity className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold m-0">1. Connectivity & Status</h3>
              <p className="text-muted-foreground mt-2">
                Your bot must be <strong>online</strong> during the reviewal process. While we allow for 
                re-submission if a bot is caught offline, our policy requires an active status to 
                complete functional testing.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold m-0">2. Permissions Audit</h3>
              <p className="text-muted-foreground mt-2">
                We do not restrict specific permissions, but bots requesting <code>Administrator</code> 
                privileges undergo stricter scrutiny. This is a safety measure to ensure the 
                integrity of our users' servers.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Terminal className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold m-0">3. Command Integrity</h3>
              <p className="text-muted-foreground mt-2">
                We review all of a bot’s commands. If your application has a vast command set, 
                please note that review times may be slightly longer. Any suspicious behavior 
                or unobservable "developer-only" commands will be flagged for clarification.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-6 border-l-2 border-primary bg-secondary/20 rounded-r-xl">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-xs">Note</span>
          </div>
          <p className="text-sm m-0 leading-relaxed">
            If you believe your bot requires a specific testing environment or "specialized" 
            permissions to function, please <strong>open a ticket on our support server</strong> 
            so we can assign your bot to a suitable reviewer.
          </p>
        </div>
      </section>
      {/* Spacing at the bottom for better UX */}
      <div className="mb-32" />
    </>
  );
};

export default HowWeReview;