const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1401533843432804392/hXPjhhmhrW3uFWtpn_rhgPQUAnZO7tHsNVzPJrpX3L-FiBKqgLuy8Bn2KU-3f5CD0m-Q";

interface WebhookRequest {
  action: 'submitted' | 'edited' | 'removed' | 'approved' | 'declined';
  userName: string;
  userDiscordId: string;
  botName: string;
  botClientId: string;
  adminDiscordId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userName, userDiscordId, botName, botClientId, adminDiscordId }: WebhookRequest = await req.json();

    let actionText = '';
    switch (action) {
      case 'submitted':
        actionText = 'submitted';
        break;
      case 'edited':
        actionText = 'edited';
        break;
      case 'removed':
        actionText = 'removed';
        break;
      case 'approved':
        actionText = 'approved';
        break;
      case 'declined':
        actionText = 'declined';
        break;
    }

    const userMention = `<@${userDiscordId}>`;
    const botMention = `**${botName}**`;
    
    let content = '';
    if (action === 'submitted') {
      content = `${userMention} submitted ${botMention} for approval`;
    } else if (action === 'edited') {
      content = `${userMention} edited ${botMention}`;
    } else if (action === 'removed') {
      content = `${userMention} removed ${botMention} from the site`;
    } else if (action === 'approved') {
      const adminMention = adminDiscordId ? `<@${adminDiscordId}>` : 'an admin';
      content = `${botMention}, submitted by ${userMention}, has been approved by ${adminMention}`;
    } else if (action === 'declined') {
      const adminMention = adminDiscordId ? `<@${adminDiscordId}>` : 'an admin';
      content = `${botMention}, submitted by ${userMention}, has been declined by ${adminMention}`;
    }

    const webhookPayload = {
      content,
      embeds: [{
        title: `Bot ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        fields: [
          {
            name: "Bot Name",
            value: botName,
            inline: true
          },
          {
            name: "Client ID",
            value: botClientId,
            inline: true
          },
          {
            name: "User",
            value: userName,
            inline: true
          }
        ],
        color: action === 'submitted' ? 0xffa500 : action === 'approved' ? 0x00ff00 : action === 'declined' ? 0xff0000 : action === 'edited' ? 0x800080 : 0xff0000,
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      console.error('Failed to send Discord webhook:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to send Discord webhook' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Discord webhook sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error('Error in discord-webhook function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);