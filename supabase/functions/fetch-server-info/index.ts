const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serverId } = await req.json();
    
    if (!serverId) {
      throw new Error('Server ID is required');
    }

    const discordBotToken = Deno.env.get('DISCORD_BOT_TOKEN');
    if (!discordBotToken) {
      throw new Error('Discord bot token not configured');
    }

    console.log(`Fetching server info for: ${serverId}`);

    // Fetch server information from Discord API
    const serverResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}`, {
      headers: {
        'Authorization': `Bot ${discordBotToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!serverResponse.ok) {
      if (serverResponse.status === 404) {
        throw new Error('Server not found or bot is not a member of this server');
      }
      throw new Error(`Discord API error: ${serverResponse.status}`);
    }

    const serverData = await serverResponse.json();
    
    // Get approximate member count
    const approximateMemberCount = serverData.approximate_member_count || serverData.member_count || 0;
    
    // Construct icon URL if available
    let iconUrl = null;
    if (serverData.icon) {
      iconUrl = `https://cdn.discordapp.com/icons/${serverData.id}/${serverData.icon}.png`;
    }

    const result = {
      name: serverData.name,
      memberCount: approximateMemberCount,
      iconUrl: iconUrl,
      serverId: serverData.id,
    };

    console.log('Server info fetched successfully:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error fetching server info:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Failed to fetch server information' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});