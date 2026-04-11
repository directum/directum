import { createClient } from '@supabase/supabase-js'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscordApplication {
  id: string;
  name: string;
  icon: string | null;
  description: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting bot avatar refresh process...')

    // Get all bots that need avatar refresh
    const { data: bots, error: botsError } = await supabase
      .from('bots')
      .select('id, client_id, name, avatar_url')
      .eq('status', 'approved')

    if (botsError) {
      console.error('Error fetching bots:', botsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bots' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${bots?.length || 0} bots to check`)

    const results = []

    for (const bot of bots || []) {
      try {
        console.log(`Checking avatar for bot: ${bot.name} (${bot.client_id})`)

        // Fetch bot application info from Discord API
        const discordResponse = await fetch(`https://discord.com/api/v10/applications/${bot.client_id}/rpc`, {
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (discordResponse.ok) {
          const discordApp: DiscordApplication = await discordResponse.json()
          
          let newAvatarUrl: string | null = null
          
          if (discordApp.icon) {
            // Construct proper Discord CDN URL with the actual icon hash
            newAvatarUrl = `https://cdn.discordapp.com/app-icons/${discordApp.id}/${discordApp.icon}.png`
            console.log(`Found custom avatar for ${bot.name}: ${newAvatarUrl}`)
          } else {
            console.log(`No custom avatar for ${bot.name}, setting to null`)
          }

          // Update the bot's avatar URL in the database
          const { error: updateError } = await supabase
            .from('bots')
            .update({ avatar_url: newAvatarUrl })
            .eq('id', bot.id)

          if (updateError) {
            console.error(`Error updating avatar for ${bot.name}:`, updateError)
            results.push({ 
              bot_id: bot.id, 
              bot_name: bot.name, 
              success: false, 
              error: updateError.message 
            })
          } else {
            console.log(`Successfully updated avatar for ${bot.name}`)
            results.push({ 
              bot_id: bot.id, 
              bot_name: bot.name, 
              success: true, 
              old_url: bot.avatar_url,
              new_url: newAvatarUrl 
            })
          }
        } else {
          console.log(`Discord API returned ${discordResponse.status} for ${bot.name}`)
          results.push({ 
            bot_id: bot.id, 
            bot_name: bot.name, 
            success: false, 
            error: `Discord API error: ${discordResponse.status}` 
          })
        }
      } catch (error) {
        console.error(`Error processing bot ${bot.name}:`, error)
        results.push({ 
          bot_id: bot.id, 
          bot_name: bot.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    console.log('Bot avatar refresh completed')

    return new Response(
      JSON.stringify({ 
        message: 'Bot avatar refresh completed',
        results: results,
        total_processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})