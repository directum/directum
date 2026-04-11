import { createClient } from '@supabase/supabase-js'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name?: string;
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

    console.log('Starting user profile refresh process...')

    // Get all users that need profile refresh
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, discord_id, username, avatar_url')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${profiles?.length || 0} profiles to check`)

    const results = []

    for (const profile of profiles || []) {
      try {
        console.log(`Checking profile for user: ${profile.username} (${profile.discord_id})`)

        // Fetch user info from Discord API
        const discordResponse = await fetch(`https://discord.com/api/v10/users/${profile.discord_id}`, {
          headers: {
            'Authorization': `Bot ${Deno.env.get('DISCORD_BOT_TOKEN')}`,
            'Content-Type': 'application/json',
          }
        })

        if (discordResponse.ok) {
          const discordUser: DiscordUser = await discordResponse.json()
          
          let newAvatarUrl: string | null = null
          
          if (discordUser.avatar) {
            // Construct proper Discord CDN URL with the actual avatar hash
            newAvatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
            console.log(`Found custom avatar for ${profile.username}: ${newAvatarUrl}`)
          } else {
            console.log(`No custom avatar for ${profile.username}, setting to null`)
          }

          // Use global_name if available, otherwise username
          const displayName = discordUser.global_name || discordUser.username

          // Check if anything needs updating
          const needsUpdate = 
            profile.username !== displayName || 
            profile.avatar_url !== newAvatarUrl

          if (needsUpdate) {
            // Update the user's profile in the database
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                username: displayName,
                avatar_url: newAvatarUrl 
              })
              .eq('id', profile.id)

            if (updateError) {
              console.error(`Error updating profile for ${profile.username}:`, updateError)
              results.push({ 
                user_id: profile.id, 
                username: profile.username, 
                success: false, 
                error: updateError.message 
              })
            } else {
              console.log(`Successfully updated profile for ${profile.username}`)
              results.push({ 
                user_id: profile.id, 
                username: profile.username, 
                success: true, 
                old_username: profile.username,
                new_username: displayName,
                old_avatar: profile.avatar_url,
                new_avatar: newAvatarUrl 
              })
            }
          } else {
            console.log(`No updates needed for ${profile.username}`)
            results.push({ 
              user_id: profile.id, 
              username: profile.username, 
              success: true, 
              message: 'No updates needed'
            })
          }
        } else {
          console.log(`Discord API returned ${discordResponse.status} for ${profile.username}`)
          results.push({ 
            user_id: profile.id, 
            username: profile.username, 
            success: false, 
            error: `Discord API error: ${discordResponse.status}` 
          })
        }
      } catch (error) {
        console.error(`Error processing profile ${profile.username}:`, error)
        results.push({ 
          user_id: profile.id, 
          username: profile.username, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    console.log('User profile refresh completed')

    return new Response(
      JSON.stringify({ 
        message: 'User profile refresh completed',
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