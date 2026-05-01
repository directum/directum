import React from 'react';
import { Type, AlignLeft, Sparkles, Eye, MousePointer2 } from 'lucide-react';

const BotDescriptions = () => {
  return (
    <>
      <h1 className="text-5xl mb-6">Bot Descriptions</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Directum provides two distinct description fields to help you market your bot. 
      </p>

      <section className="prose prose-invert max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Short Description Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Type className="w-5 h-5" />
              <h2 className="text-xl font-bold m-0">Short Description</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These appear on your <strong>Bot Cards</strong> throughout the home page and search results. 
              They are visible to everyone, even if they never click on your profile.
            </p>
            <div className="bg-secondary/20 p-4 rounded-lg border border-border">
              <span className="text-xs font-bold uppercase text-muted-foreground">Purpose</span>
              <p className="text-sm m-0 mt-1">The "Hook." Use this to grab attention in a crowded list.</p>
            </div>
          </div>

          {/* Long Description Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <AlignLeft className="w-5 h-5" />
              <h2 className="text-xl font-bold m-0">Long Description</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is only visible once a user <strong>opens your bot's profile page</strong>. 
              It supports Markdown, allowing for detailed formatting and deep explanations.
            </p>
            <div className="bg-secondary/20 p-4 rounded-lg border border-border">
              <span className="text-xs font-bold uppercase text-muted-foreground">Purpose</span>
              <p className="text-sm m-0 mt-1">The "Pitch." Use this to explain features and commands in detail.</p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6 flex items-center gap-2">
          <Sparkles className="text-primary w-7 h-7" /> Best Practices
        </h2>
        
        <div className="space-y-8">
          <div className="flex gap-4">
            <MousePointer2 className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold m-0">Don't Cram Information</h3>
              <p className="text-muted-foreground mt-2">
                Avoid trying to squeeze your command list or support links into the short description. 
                Instead, use that limited space for a punchy one-sentence value proposition.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Eye className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold m-0">Focus on Visibility</h3>
              <p className="text-muted-foreground mt-2">
                Since the short description is constantly visible, focus on what makes your bot unique. 
                "The only music bot with 24/7 high-fidelity audio" is more effective than "A bot that plays music and has moderation."
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-8 border border-border bg-card rounded-2xl">
          <h3 className="text-xl font-bold mb-4">[ Coming Soon] Markdown Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your long description will soon fully support GitHub-flavored Markdown like the ones shown below!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 bg-secondary rounded border border-border text-center"># Headings</div>
            <div className="p-2 bg-secondary rounded border border-border text-center">**Bold**</div>
            <div className="p-2 bg-secondary rounded border border-border text-center">[Links]()</div>
            <div className="p-2 bg-secondary rounded border border-border text-center">* Lists</div>
          </div>
        </div>
      </section>

      {/* Spacing at the bottom for better UX */}
      <div className="mb-32" />
    </>
  );
};

export default BotDescriptions;