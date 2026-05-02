// deno-lint-ignore-file no-unused-vars
import _React from 'react';
import { Users, Shield, Star, Heart, ExternalLink, Info } from 'lucide-react';

const JoiningTheTeam = () => {
  return (
    <>
      <h1 className="text-5xl mb-6">Joining the Team</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Directum is composed of passionate volunteers striving to create a free and open environment for developers. 
        We are always looking for dedicated individuals to help us grow.
      </p>

      <section className="prose prose-invert max-w-none">
        <h2 className="text-3xl font-bold mb-8">Our Roles</h2>
        
        <div className="space-y-8 mb-12">
          {/* Community Helpers */}
          <div className="flex gap-5 p-6 rounded-2xl border border-border bg-card/30">
            <div className="p-3 rounded-xl bg-blue-500/10 h-fit">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold m-0 text-blue-400">Community Helpers</h3>
              <p className="text-muted-foreground mt-2 m-0">
                Community helpers are the heart of the community! They help answer questions, find bugs, and guide new users as they interact with the platform! 
              </p>
            </div>
          </div>

          {/* Moderators */}
          <div className="flex gap-5 p-6 rounded-2xl border border-border bg-card/30">
            <div className="p-3 rounded-xl bg-green-500/10 h-fit">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold m-0 text-green-400">Moderators</h3>
              <p className="text-muted-foreground mt-2 m-0">
                Moderators are one of the biggest parts of the team! They help in reveiwing / verifying bots and helping on the Discord server! They even help the devs with development on the site!
              </p>
            </div>
          </div>

          {/* Admins */}
          <div className="flex gap-5 p-6 rounded-2xl border border-border bg-card/30">
            <div className="p-3 rounded-xl bg-primary/10 h-fit">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold m-0 text-primary">Directum Admins</h3>
              <p className="text-muted-foreground mt-2 m-0">
                Directum admins are part of the core team responsible for everything on Directum. From site development to managing other members of the team, they are the ones who make sure everything runs smoothly!
              </p>
            </div>
          </div>
        </div>

        {/* Volunteer Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-12">
          <div className="flex items-center gap-2 text-amber-500 mb-3">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-bold uppercase tracking-wider text-xs">A Volunteer-First Project</span>
          </div>
          <p className="text-sm m-0 leading-relaxed text-muted-foreground">
            All positions at Directum are 100% volunteer-based. We do not currently generate 
            profit; all funds are reinvested directly into hosting and growing the site. 
            Joining the team is for those who are genuinely passionate about the mission.
          </p>
        </div>

        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to contribute?</h2>
          <p className="mb-6">Check out our Discord server for the latest information on applications and open roles.</p>
          <a 
            href="https://discord.gg/UHeWA6mXxS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all">
              Join the Discord Team <ExternalLink className="w-4 h-4" />
            </button>
          </a>
        </div>
      </section>

      <div className="mb-32" />
    </>
  );
};

export default JoiningTheTeam;