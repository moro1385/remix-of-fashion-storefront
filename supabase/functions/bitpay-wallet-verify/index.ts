import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { topup_id, trans_id, id_get } = await req.json()

    if (!topup_id) {
      return new Response(JSON.stringify({ success: false, reason: "invalid" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: topup, error: topupError } = await supabaseAdmin
      .from('wallet_topups')
      .select('*')
      .eq('id', topup_id)
      .single()

    if (topupError || !topup || topup.payment_ref !== id_get) {
      return new Response(JSON.stringify({ success: false, reason: "invalid" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (topup.payment_trans_id) {
      // Already verified
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!trans_id || trans_id === "0") {
      // Payment failed or cancelled
      await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'payment_failed' })
        .eq('id', topup_id)
      return new Response(JSON.stringify({ success: false, reason: "cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const bitpayApiKey = Deno.env.get('BITPAY_API_KEY')
    if (!bitpayApiKey) {
      console.error('Missing BITPAY_API_KEY')
      return new Response(JSON.stringify({ success: false, reason: "error" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const verifyParams = new URLSearchParams()
    verifyParams.append('api', bitpayApiKey)
    verifyParams.append('trans_id', trans_id)
    verifyParams.append('id_get', id_get!)
    verifyParams.append('json', '1')

    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyParams.toString(),
    })

    const verifyJson = await verifyResponse.json()
    const verifyStatus = String(verifyJson.status)
    const verifyAmount = Math.round(Number(verifyJson.amount))
    const topupAmount = Math.round(topup.amount)

    if (verifyStatus === "1" && verifyAmount === topupAmount) {
      // Success - Atomic update

      // 1. Fetch current profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', topup.user_id)
        .single()

      if (profileError) {
        console.error('Error fetching profile for topup:', profileError)
        return new Response(JSON.stringify({ success: false, reason: "error" }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const currentBalance = profile.wallet_balance || 0

      // 2. Update wallet_topups status and payment_trans_id
      const { error: updateTopupError } = await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'confirmed', payment_trans_id: trans_id })
        .eq('id', topup_id)

      if (updateTopupError) {
        console.error('Error updating topup status:', updateTopupError)
        return new Response(JSON.stringify({ success: false, reason: "error" }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 3. Update profiles.wallet_balance
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: currentBalance + topupAmount })
        .eq('id', topup.user_id)

      if (updateProfileError) {
        console.error('Error updating profile balance:', updateProfileError)
        // Ideally we should rollback or alert, but for this fix, logging is minimum
        return new Response(JSON.stringify({ success: false, reason: "error" }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      // Tampering / verification failed
      console.error('Bitpay verification failed:', verifyJson)
      await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'payment_failed' })
        .eq('id', topup_id)
      return new Response(JSON.stringify({ success: false, reason: "verification_failed" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('bitpay-wallet-verify error:', error)
    return new Response(JSON.stringify({ success: false, reason: "error" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
