// import "npm:xmlhttprequest"; // Modern way to handle the xhr polyfill if still needed
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const discordBotToken = Deno.env.get('DISCORD_BOT_TOKEN');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { botId, userId, discordUserId, guildId, roleId } = await req.json();

    console.log('Vote API called:', { botId, userId, discordUserId, guildId, roleId });

    // Validate required fields
    if (!botId || !userId || !discordUserId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: botId, userId, discordUserId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify bot exists and get bot details
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, name, client_id, votes, webhook_url, owner_id')
      .eq('id', botId)
      .eq('status', 'approved')
      .single();

    if (botError || !bot) {
      console.error('Bot not found or not approved:', botError);
      return new Response(JSON.stringify({ error: 'Bot not found or not approved' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already voted in the last 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id, created_at')
      .eq('bot_id', botId)
      .eq('user_id', userId)
      .gte('created_at', twelveHoursAgo)
      .maybeSingle();

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return new Response(JSON.stringify({ error: 'Error checking vote status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingVote) {
      const timeLeft = new Date(existingVote.created_at).getTime() + (12 * 60 * 60 * 1000) - Date.now();
      const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
      
      return new Response(JSON.stringify({ 
        error: 'You can only vote once every 12 hours',
        timeLeft: hoursLeft,
        canVoteAt: new Date(Date.now() + timeLeft).toISOString()
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        bot_id: botId,
        user_id: userId,
      });

    if (insertError) {
      console.error('Error inserting vote:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to record vote' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update bot vote count
    const { error: updateError } = await supabase
      .from('bots')
      .update({ votes: bot.votes + 1 })
      .eq('id', botId);

    if (updateError) {
      console.error('Error updating vote count:', updateError);
    }

    // Award Discord role if Discord integration is configured
    let roleAwarded = false;
    let discordError: string | null = null;

    if (discordBotToken && guildId && roleId && discordUserId) {
      try {
        console.log('Attempting to award Discord role:', { guildId, roleId, discordUserId });
        
        const discordResponse = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bot ${discordBotToken}`,
              'Content-Type': 'application/json',
              'X-Audit-Log-Reason': `Vote reward for bot ${bot.name}`
            },
          }
        );

        if (discordResponse.ok) {
          roleAwarded = true;
          console.log('Successfully awarded Discord role');
        } else {
          const errorText = await discordResponse.text();
          console.error('Discord API error:', discordResponse.status, errorText);
          discordError = `Discord API error: ${discordResponse.status}`;
        }
      } catch (error: unknown) {
        console.error('Error awarding Discord role:', error);
        discordError = error instanceof Error ? error.message : String(error);
      }
    }

    // Send webhook notification if configured
    let webhookSent = false;
    let webhookError: string | null = null;

    if (bot.webhook_url) {
      try {
        console.log('Sending webhook notification to:', bot.webhook_url);
        
        // Get voter profile information
        const { data: voterProfile } = await supabase
          .from('profiles')
          .select('username, discord_id, avatar_url')
          .eq('id', userId)
          .single();

        const webhookPayload = {
          event: 'bot_vote',
          timestamp: new Date().toISOString(),
          bot: {
            id: bot.id,
            name: bot.name,
            client_id: bot.client_id,
            votes: bot.votes + 1
          },
          voter: voterProfile ? {
            id: userId,
            username: voterProfile.username,
            discord_id: voterProfile.discord_id,
            avatar_url: voterProfile.avatar_url
          } : {
            id: userId
          }
        };

        const webhookResponse = await fetch(bot.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBotList-VoteAPI/1.0'
          },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
          webhookSent = true;
          console.log('Successfully sent webhook notification');
        } else {
          const errorText = await webhookResponse.text();
          console.error('Webhook error:', webhookResponse.status, errorText);
          webhookError = `Webhook error: ${webhookResponse.status}`;
        }
      } catch (error: unknown) {
        console.error('Error sending webhook:', error);
        webhookError = error instanceof Error ? error.message : String(error);
      }
    }

    const response = {
      success: true,
      message: 'Vote recorded successfully!',
      botName: bot.name,
      newVoteCount: bot.votes + 1,
      roleAwarded,
      discordError,
      webhookSent,
      webhookError,
      canVoteAgainAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in vote-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});