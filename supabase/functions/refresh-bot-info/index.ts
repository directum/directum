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

// Define the shape of the update data to avoid 'any'
interface BotUpdateData {
  name?: string;
  avatar_url?: string | null;
  short_description?: string;
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

    console.log('Starting bot info refresh process...')

    // Get all bots that need info refresh
    const { data: bots, error: botsError } = await supabase
      .from('bots')
      .select('id, client_id, name, avatar_url, short_description')
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
        console.log(`Checking info for bot: ${bot.name} (${bot.client_id})`)

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

          // Check if anything needs updating
          const needsUpdate = 
            bot.name !== discordApp.name || 
            bot.avatar_url !== newAvatarUrl ||
            (bot.short_description !== discordApp.description && discordApp.description && discordApp.description.trim())

          // FIXED: Use the interface instead of any
          const updateData: BotUpdateData = {}
          
          if (bot.name !== discordApp.name) {
            updateData.name = discordApp.name
          }
          
          if (bot.avatar_url !== newAvatarUrl) {
            updateData.avatar_url = newAvatarUrl
          }
          
          // Only update description if Discord has a meaningful description
          if (discordApp.description && discordApp.description.trim() && bot.short_description !== discordApp.description) {
            updateData.short_description = discordApp.description
          }

          if (needsUpdate && Object.keys(updateData).length > 0) {
            // Update the bot's info in the database
            const { error: updateError } = await supabase
              .from('bots')
              .update(updateData)
              .eq('id', bot.id)

            if (updateError) {
              console.error(`Error updating info for ${bot.name}:`, updateError)
              results.push({ 
                bot_id: bot.id, 
                bot_name: bot.name, 
                success: false, 
                error: updateError.message 
              })
            } else {
              console.log(`Successfully updated info for ${bot.name}`)
              results.push({ 
                bot_id: bot.id, 
                bot_name: bot.name, 
                success: true, 
                old_name: bot.name,
                new_name: discordApp.name,
                old_avatar: bot.avatar_url,
                new_avatar: newAvatarUrl,
                updated_fields: Object.keys(updateData)
              })
            }
          } else {
            console.log(`No updates needed for ${bot.name}`)
            results.push({ 
              bot_id: bot.id, 
              bot_name: bot.name, 
              success: true, 
              message: 'No updates needed'
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
      } catch (error: unknown) {
        console.error(`Error processing bot ${bot.name}:`, error)
        results.push({ 
          bot_id: bot.id, 
          bot_name: bot.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    console.log('Bot info refresh completed')

    return new Response(
      JSON.stringify({ 
        message: 'Bot info refresh completed',
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

  } catch (error: unknown) {
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