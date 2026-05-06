// deno-lint-ignore-file no-sloppy-imports
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, Check, Terminal, Shield, Key, 
  ListChecks, Circle, Code2, X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 px-3 text-xs gap-2 border-slate-700 bg-slate-900 hover:bg-slate-800"
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
};

const ApiDocs = () => {
  const PUBLIC_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzYXZjb2hoZGdkcWt1a2lyenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njc0MDIsImV4cCI6MjA5MTM0MzQwMn0.B4Mb_STIvtUEcXqKycPqVlhVKChE3R1Y7L9MpMfAAMI";
  const API_URL = "https://esavcohhdgdqkukirztz.supabase.co/functions/v1/vote-api";

  const jsonExample = {
    botId: "your-bot-uuid-here",
    discordUserId: "123456789012345678",
    guildId: "optional-server-id"
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-slate-300 font-sans">
      
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-5xl mb-6">API Documentation</h1>
        <p className="text-slate-400">Follow these steps to integrate the Directum voting system into your bot. If you do not know what an API is, this page is not the place for you!</p>
      </div>

      <div className="space-y-16">
        
        {/* Step 1: Authentication */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">1</div>
            <h2 className="text-xl font-semibold text-white">Obtain Authorization</h2>
          </div>
          <p className="text-sm leading-relaxed pl-11">
            Every request to the Directum Edge network requires an <code className="text-primary font-mono text-xs">apikey</code>. 
          </p>
          <div className="ml-11 p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <code className="text-[11px] font-mono text-emerald-400 break-all leading-tight max-w-md">
              {PUBLIC_ANON_KEY}
            </code>
            <CopyButton text={PUBLIC_ANON_KEY} />
          </div>
        </section>

        {/* Step 2: Configure Endpoint */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">2</div>
            <h2 className="text-xl font-semibold text-white">Target the Endpoint</h2>
          </div>
          <div className="ml-11 p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <code className="text-sm font-mono text-slate-200">{API_URL}</code>
            <CopyButton text={API_URL} />
          </div>
        </section>

        {/* Step 3: Payload Structure */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">3</div>
            <h2 className="text-xl font-semibold text-white">Format the Payload</h2>
          </div>
          <div className="ml-11 grid gap-3">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-sm font-mono font-bold text-white block">botId</span>
                <span className="text-xs text-slate-500">Your bot's unique UUID</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold">Required</span>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-sm font-mono font-bold text-white block">discordUserId</span>
                <span className="text-xs text-slate-500">The voter's Discord Snowflake ID</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold">Required</span>
            </div>
          </div>
        </section>

        {/* Step 4: Handle Response */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">4</div>
            <h2 className="text-xl font-semibold text-white">Handle the Response</h2>
          </div>
          
          <ul className="ml-11 space-y-4 text-sm">
            <li className="flex gap-4 items-center">
              <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500 shrink-0" />
              <span><strong>Success (200):</strong> Vote recorded successfully.</span>
            </li>
            <li className="flex gap-4 items-center">
              <Circle className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
              <span><strong>Cooldown (429):</strong> User already voted in last 12h.</span>
            </li>
            <li className="flex gap-4 items-center">
              <Circle className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />
              <span><strong>Error (400/500):</strong> Missing data or server error.</span>
            </li>
          </ul>
        </section>

        {/* Footer Actions */}
        <div className="pt-12 flex flex-col items-center gap-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 px-8">
                <Code2 className="w-4 h-4" />
                Show Examples
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">JSON Structure</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Send this JSON body in your POST request.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 rounded-lg bg-black border border-white/10 relative group">
                <div className="absolute right-4 top-4">
                    <CopyButton text={JSON.stringify(jsonExample, null, 2)} />
                </div>
                <pre className="text-sm font-mono text-blue-300 leading-relaxed">
                  {JSON.stringify(jsonExample, null, 2)}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </div>
    </div>
  );
};

export default ApiDocs;