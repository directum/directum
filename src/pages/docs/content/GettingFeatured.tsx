import React from 'react';
import { Star, BadgeCheck, Zap, Search, MessageSquare, Heart, ShieldCheck, ExternalLink } from 'lucide-react';

const GettingFeatured = () => {
  const perks = [
    { icon: <BadgeCheck className="w-5 h-5 text-blue-400" />, text: "Partner badge on your bot and Directum profile" },
    { icon: <Zap className="w-5 h-5 text-yellow-400" />, text: "Partner role on our official Discord" },
    { icon: <Star className="w-5 h-5 text-purple-400" />, text: "Early access to newly released features" },
    { icon: <Heart className="w-5 h-5 text-red-400" />, text: "Better visibility with unique profile colors" },
    { icon: <Search className="w-5 h-5 text-green-400" />, text: "Bot shows up first in search results" },
    { icon: <MessageSquare className="w-5 h-5 text-pink-400" />, text: "Access to the partners-only lounge" },
    { icon: <ShieldCheck className="w-5 h-5 text-primary" />, text: "Premium support for all your bots" },
  ];

  return (
    <>
      <h1 className="text-5xl mb-6">Getting Featured</h1>
      
      <div className="bg-gradient-to-r from-primary/20 to-purple-500/10 border border-primary/20 rounded-2xl p-8 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold m-0">Boost Your Growth</h2>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed m-0">
          Getting your bot featured can result in <strong>over 3x the exposure</strong>. 
          Currently, the primary way to achieve featured status is through our Partnership Program.
        </p>
      </div>

      <section className="prose prose-invert max-w-none">
        <h2 className="text-3xl font-bold mb-8">Partnership Perks</h2>
        <p className="mb-8">
          Becoming a Directum Partner isn't just about a badge—it's about joining an elite circle of 
          developers and getting the tools you need to scale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {perks.map((perk, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50">
              {perk.icon}
              <span className="text-sm font-medium">{perk.text}</span>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-6">How to Apply</h2>
        <p>
          The Directum partnership program is managed via our Discord server. Developers can apply 
          with a single bot to be reviewed for the program. 
        </p>
        
        <div className="bg-secondary/30 p-6 rounded-xl border border-border mt-8">
          <h3 className="text-xl font-bold m-0 mb-3">Requirements</h3>
          <p className="text-muted-foreground mb-6">
            While we have specific criteria to maintain quality, we prefer to let developers handle 
            how they fulfill those requirements in their own unique way.
          </p>
          {/* External Discord Link */}
            <a 
                href="https://discord.gg/UHeWA6mXxS" 
             target="_blank" 
             rel="noopener noreferrer"
             className="inline-block"
            >
    <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all">
      Join Discord to Apply <ExternalLink className="w-4 h-4" />
    </button>
  </a>
        </div>

        <div className="mt-16 p-8 border-t border-border text-center">
          <p className="text-muted-foreground italic">
            Ready to join? Head over to the #partnership channel in our Discord to start your application.
          </p>
        </div>
      </section>

      <div className="mb-32" />
    </>
  );
};

export default GettingFeatured;