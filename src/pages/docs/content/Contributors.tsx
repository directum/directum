// deno-lint-ignore-file no-unused-vars
import _React from 'react';
import { Github, Globe, Heart, Award, Code2 } from 'lucide-react';

const Contributors = () => {
  // Add your contributors here
  const contributors = [
    {
      name: "Soul",
      role: "Lead Developer",
      github: "https://github.com/souldevofficial",
      website: "https://soul.dedyn.io"
    },
    {
      name: "B.E Starr",
      role: "Moderator",
      website: "https://yoursit.ee/butler_starr"
    }
  ];

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-5xl m-0">Contributors</h1>
      </div>
      
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Directum wouldn't be possible without the dedicated individuals who volunteer their time to improve our platform and documentation. 
        A huge thank you to everyone listed below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {contributors.map((person, index) => (
          <div key={index} className="group p-6 rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold m-0 group-hover:text-primary transition-colors">
                  {person.name}
                </h3>
                <span className="text-sm text-muted-foreground">{person.role}</span>
              </div>
              <div className="flex gap-2">
                {person.github && (
                  <a href={person.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Github size={18} />
                  </a>
                )}
                {person.website && (
                  <a href={person.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Want to contribute section */}
      <div className="relative p-8 rounded-3xl overflow-hidden border border-primary/20 bg-primary/5">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Code2 size={24} />
            <h2 className="text-2xl font-bold m-0">Want to see your name here?</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-xl">
            We are always looking for help with correcting documentation, translating pages, or writing new guides. 
            Contribute to our repository or join the Discord to get started!
          </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
              <Heart size={16} className="text-red-500 fill-red-500" />
              All contributions are appreciated!
            </div>
          </div>
        </div>

      <div className="mb-32" />
    </>
  );
};

export default Contributors;