const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketRequest {
  discordName: string;
  email: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordName, email, reason }: TicketRequest = await req.json();

    console.log('Received ticket submission:', { discordName, email, reason });

    // Create Discord embed
    const embed = {
      title: "🎫 New Support Ticket",
      color: 0x5865F2, // Discord blurple color
      fields: [
        {
          name: "👤 Discord Name",
          value: discordName,
          inline: true
        },
        {
          name: "📧 Email Address",
          value: email,
          inline: true
        },
        {
          name: "📋 Reason",
          value: reason,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Directum Support System"
      }
    };

    const webhookPayload = {
      embeds: [embed]
    };

    console.log('Sending webhook payload:', webhookPayload);

    // Send to Discord webhook
    const webhookUrl = "https://discordapp.com/api/webhooks/1402028760592547962/vE5YKJqj9-9olIU3ObPnhuBZeCE9cGQKU-Q8cMKuCccl4lnmGU6677iMruyOj3iencSW";
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook failed:', response.status, errorText);
      throw new Error(`Discord webhook failed: ${response.status} ${errorText}`);
    }

    console.log('Discord webhook sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Ticket submitted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    // Fixed: Using unknown + type checking to satisfy the "any type not allowed" rule
    console.error('Error in submit-ticket function:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Start the server using the Deno global method
Deno.serve(handler);