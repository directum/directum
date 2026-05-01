import _React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Terminal, 
  Tag as TagIcon, 
  ShieldAlert 
} from 'lucide-react';

const HowToList = () => {
  const tags = [
    "Administration", "Automation", "Anime", "Art", "Bot Lists", "Business",
    "Coding", "Community", "Economy", "Educational", "Entertainment", "Fun",
    "Gaming", "Learning", "Logging", "Memes", "Moderation", "Music",
    "Productivity", "Roleplay", "Social", "Sports", "Streaming", "Support",
    "Tech", "Utility"
  ];

  return (
    <>
      <h1 className="text-5xl mb-6">How to List Your Bot</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-8">
        Directum.org has made it simple to ensure your bot gets listed appropriately, honestly, and as quickly as possible.
      </p>

      {/* Process Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle2 className="text-primary w-8 h-8" /> Mobile & Web Listing
        </h2>
        <div className="bg-secondary/30 rounded-xl p-6 border border-border">
          <ol className="list-decimal pl-6 space-y-3">
            <li>Go to <a href="https://directum.org/" className="text-primary hover:underline">directum.org</a></li>
            <li>Navigate to the top right corner and tap <strong>"Login"</strong></li>
            <li>Authorize our site to access your basic Discord information (username, avatar, email)</li>
            <li>Open the hamburger menu <span className="bg-secondary px-2 py-0.5 rounded text-sm">☰</span></li>
            <li>Tap on <span className="text-primary font-bold">"+ Add Bot"</span></li>
          </ol>
        </div>
      </section>

      {/* Bot Information Section */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-4">Bot Information</h2>
        <p className="mb-6">
          While we offer more freedom than most listing sites, we still require decorum while submitting projects. You must provide:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {[
            "Bot Name*", "Bot Client ID*", "Short Description*", 
            "Long Description*", "Bot Invite URL*", "Support Server URL", "Tags*"
          ].map((field) => (
            <div key={field} className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg text-sm">
              <div className={`w-2 h-2 rounded-full ${field.includes('*') ? 'bg-primary' : 'bg-muted'}`} />
              {field}
            </div>
          ))}
        </div>
        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3">
          <AlertCircle className="text-blue-500 shrink-0" />
          <p className="text-sm m-0 italic">
            <strong>Pro Tip:</strong> You can find your Client ID in the <a href="https://discord.com/developers/applications" className="underline font-bold">Discord Developer Portal</a> under General Information.
          </p>
        </div>
      </section>

      {/* Tags Section */}
      <section className="mt-12 pt-12 border-t border-border">
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-4">
          <TagIcon className="text-primary" /> Tags
        </h2>
        <p className="mb-6 italic text-muted-foreground">
          To keep things transparent, we require you to select <strong>3 to 5</strong> tags.
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-secondary hover:bg-primary/20 transition-colors rounded-full text-xs font-medium border border-border">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Decorum Section */}
      <section className="mt-12 pt-12 border-t border-border">
        <h2 className="text-3xl font-bold mb-6">Bot & Tag Decorum</h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
              <ShieldAlert className="text-red-500" /> Admin Permissions
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We allow "Administrator" default permissions. However, be conscious of perms when installing applications. 
              Directum.org is not responsible for server casualties or harmful behaviors.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
              <ExternalLink className="text-primary" /> Discord TOS
            </h3>
            <p className="text-sm text-muted-foreground">
              Directum.org strictly adheres to the Discord Terms of Service. We will review all bots based on these terms without exception.
            </p>
          </div>
        </div>
      </section>
      {/* Spacing at the bottom for better UX */}
      <div className="mb-32" />
    </>
  );
};

export default HowToList;