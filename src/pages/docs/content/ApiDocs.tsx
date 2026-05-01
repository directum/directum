// deno-lint-ignore-file no-sloppy-imports
import _React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Zap, Shield, Clock } from 'lucide-react';

const ApiDocs = () => {
  // Common styling for code blocks to ensure consistency
  const codeBlockClass = "bg-slate-950 text-slate-50 p-4 rounded-lg border border-slate-800 shadow-inner";

  return (
    <>
      <h1 className="text-5xl mb-6">API Documentation</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12">
        Integrate Directum's features into your Discord bots and applications to automate voting systems and role rewards.
      </p>

      {/* Overview */}
      <Card className="mb-8 border-muted bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            API Overview
          </CardTitle>
          <CardDescription>
            Our APIs allow you to integrate voting systems and role rewards directly into your Discord bots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Fast & Reliable</div>
                <div className="text-xs text-muted-foreground">Edge-deployed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Secure</div>
                <div className="text-xs text-muted-foreground">Rate limited</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Real-time</div>
                <div className="text-xs text-muted-foreground">Instant updates</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote API */}
      <Card className="mb-8 border-muted bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Vote API
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">v1</Badge>
          </CardTitle>
          <CardDescription>
            Allow users to vote for your bot and automatically reward them with Discord roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Endpoint</h3>
            <div className={codeBlockClass}>
              <code className="text-sm font-mono text-emerald-400">
                POST https://esavcohhdgdqkukirztz.supabase.co/functions/v1/vote-api
              </code>
            </div>
          </div>

          {/* Request Body */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Request Body</h3>
            <div className={codeBlockClass}>
              <pre className="text-sm overflow-x-auto font-mono">
{`{
  "botId": "your-bot-id",
  "userId": "user-id-from-your-system",
  "discordUserId": "123456789012345678",
  "guildId": "987654321098765432",
  "roleId": "111222333444555666"
}`}
              </pre>
            </div>
          </div>

          {/* Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Parameters</h3>
            <div className="space-y-3">
              {[
                { name: 'botId', req: true, desc: 'The ID of your bot on Directum' },
                { name: 'userId', req: true, desc: 'Unique identifier for the user in your system' },
                { name: 'discordUserId', req: false, desc: 'Discord user ID for role rewards' },
                { name: 'guildId', req: false, desc: 'Discord server ID for the role' },
                { name: 'roleId', req: false, desc: 'Discord role ID to award' },
              ].map((param) => (
                <div key={param.name} className="border border-muted rounded-lg p-4 bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono bg-slate-950 text-primary-foreground px-2 py-0.5 rounded border border-slate-800">
                      {param.name}
                    </code>
                    {param.req ? (
                      <Badge variant="destructive" className="text-[10px] h-5">Required</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-5">Optional</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{param.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Response</h3>
            <div className={codeBlockClass}>
              <pre className="text-sm overflow-x-auto font-mono text-blue-300">
{`{
  "success": true,
  "message": "Vote recorded successfully",
  "botName": "Your Bot Name",
  "newVoteCount": 42,
  "roleAwarded": true,
  "webhookSent": true,
  "canVoteAgainAt": "2024-01-01T12:00:00Z"
}`}
              </pre>
            </div>
          </div>

          {/* Webhook Notifications */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Webhook Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Receive real-time notifications when users vote for your bot.
            </p>
            
            <div className="space-y-4">
              <div className={codeBlockClass}>
                <pre className="text-sm overflow-x-auto font-mono">
{`{
  "event": "bot_vote",
  "timestamp": "2024-01-01T12:00:00Z",
  "bot": {
    "id": "your-bot-id",
    "votes": 43
  },
  "voter": {
    "discord_id": "987654321098765432"
  }
}`}
                </pre>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-400">
                  <strong>💡 How to use:</strong> Set the <code className="bg-slate-950 px-1 rounded border border-slate-800">webhook_url</code> in your bot's settings.
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
            <p className="text-sm text-amber-500">
              <strong>⏰ Cooldown:</strong> Users can vote once every 12 hours per bot.
            </p>
          </div>

          {/* Example Integration */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Example Integration (Node.js)</h3>
            <div className={codeBlockClass}>
              <pre className="text-sm overflow-x-auto font-mono text-slate-300">
{`const response = await fetch('https://api.directum.bot/v1/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    botId: 'your-bot-id',
    userId: interaction.user.id
  })
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-32" />
    </>
  );
};

export default ApiDocs;