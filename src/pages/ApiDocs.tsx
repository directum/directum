import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Zap, Shield, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Integrate Directum's features into your Discord bots and applications
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Overview
              </CardTitle>
              <CardDescription>
                Welcome to the Directum API documentation. Our APIs allow you to integrate voting systems, 
                role rewards, and more directly into your Discord bots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Fast & Reliable</div>
                    <div className="text-sm text-muted-foreground">Edge-deployed for low latency</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Secure</div>
                    <div className="text-sm text-muted-foreground">Rate limited and validated</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Real-time</div>
                    <div className="text-sm text-muted-foreground">Instant role rewards</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vote API */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Vote API
                <Badge variant="secondary">v1</Badge>
              </CardTitle>
              <CardDescription>
                Allow users to vote for your bot and automatically reward them with Discord roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endpoint */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Endpoint</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <code className="text-sm">
                    POST https://esavcohhdgdqkukirztz.supabase.co/functions/v1/vote-api
                  </code>
                </div>
              </div>

              {/* Request Body */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Request Body</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
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
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">botId</code>
                      <Badge variant="destructive">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">The ID of your bot on Directum</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">userId</code>
                      <Badge variant="destructive">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Unique identifier for the user in your system</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">discordUserId</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Discord user ID for role rewards</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">guildId</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Discord server ID where the role should be awarded</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">roleId</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Discord role ID to award to the user</p>
                  </div>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
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
                  Configure a webhook URL in your bot settings to receive real-time notifications when users vote for your bot.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Webhook Payload</h4>
                    <div className="bg-secondary p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
{`{
  "event": "bot_vote",
  "timestamp": "2024-01-01T12:00:00Z",
  "bot": {
    "id": "your-bot-id",
    "name": "Your Bot Name",
    "client_id": "123456789012345678",
    "votes": 43
  },
  "voter": {
    "id": "user-id-from-your-system",
    "username": "voter_username",
    "discord_id": "987654321098765432",
    "avatar_url": "https://cdn.discordapp.com/avatars/..."
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>💡 How to use:</strong> Set the <code className="bg-secondary px-1 rounded">webhook_url</code> field 
                      in your bot's settings to receive POST requests whenever someone votes for your bot.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Limiting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Rate Limiting</h3>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>⏰ Cooldown:</strong> Users can vote once every 12 hours per bot. 
                    Attempts to vote before the cooldown expires will return a rate limit response.
                  </p>
                </div>
              </div>

              {/* Example Integration */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Example Integration</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`// JavaScript/Node.js example
const response = await fetch('https://esavcohhdgdqkukirztz.supabase.co/functions/v1/vote-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    botId: 'your-bot-id',
    userId: interaction.user.id,
    discordUserId: interaction.user.id,
    guildId: interaction.guild.id,
    roleId: 'your-role-id'
  })
});

const data = await response.json();
if (data.success) {
  await interaction.reply(\`Thanks for voting! New vote count: \${data.newVoteCount}\`);
} else {
  await interaction.reply(data.message);
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                More API endpoints are in development to enhance your bot integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg">
                  <h4 className="font-medium mb-2">Statistics API</h4>
                  <p className="text-sm text-muted-foreground">
                    Retrieve detailed vote statistics and analytics for your bot
                  </p>
                </div>
                <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg">
                  <h4 className="font-medium mb-2">Statistics API</h4>
                  <p className="text-sm text-muted-foreground">
                    Retrieve detailed vote statistics and analytics for your bot
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
