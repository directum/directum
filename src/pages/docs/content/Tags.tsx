import React from 'react';
import { Tag as TagIcon, Hash, MessageSquare, AlertTriangle } from 'lucide-react';

const Tags = () => {
  const availableTags = [
    "Administration", "Automation", "Anime", "Art", "Bot Lists", "Business",
    "Coding", "Community", "Economy", "Educational", "Entertainment", "Fun",
    "Gaming", "Learning", "Logging", "Memes", "Moderation", "Music",
    "Productivity", "Roleplay", "Social", "Sports", "Streaming", "Support",
    "Tech", "Utility"
  ];

  return (
    <>
      <h1 className="text-5xl mb-6">Tags & Categories</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Tags are a powerful way to showcase your bot’s capabilities at a glance. 
        They help users discover your bot through category searches and direct filters.
      </p>

      <section className="prose prose-invert max-w-none">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Hash className="text-primary w-7 h-7" /> Available Tags
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mb-12 bg-secondary/10 p-6 rounded-2xl border border-border">
          {availableTags.map((tag) => (
            <div key={tag} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              {tag}
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-6">Tag Requirements</h2>
        <p className="mb-6">
          To maintain a balanced listing, we have specific requirements for how many tags can be applied to a single bot:
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 p-6 border border-border bg-card rounded-xl text-center">
            <span className="text-xs text-muted-foreground tracking-widest">Current Minimum</span>
            <div className="text-4xl font-black text-primary mt-1">3</div>
          </div>
          <div className="flex-1 p-6 border border-border bg-card rounded-xl text-center">
            <span className="text-xs text-muted-foreground tracking-widest">Current Maximum</span>
            <div className="text-4xl font-black text-primary mt-1">5</div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Tag Enforcement & Suggestions</h3>
        <p>
          While we do not strictly enforce tag relevancy during the initial review, this is entirely up to the developer’s discretion. 
          However, <strong>intentionally adding irrelevant tags</strong> to "game" the search system may result in your bot being reported to our team for review.
        </p>

        <div className="mt-12 p-6 border border-border bg-secondary/30 rounded-xl flex items-start gap-4">
          <MessageSquare className="text-primary w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold m-0">Missing a tag?</h4>
            <p className="text-sm m-0 mt-2 text-muted-foreground">
              If you feel a specific category is missing that would benefit the community, 
              feel free to suggest it on our <strong>Discord server</strong>. We regularly 
              update this list based on developer feedback.
            </p>
          </div>
        </div>
      </section>
      {/* Spacing at the bottom for better UX */}
      <div className="mb-32" />
    </>
  );
};

export default Tags;