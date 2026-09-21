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

    const { topupId } = await req.json()

    if (!topupId) {
      return new Response(JSON.stringify({ error: 'topupId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get Auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase anon client to get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase service role client to fetch topup and update it
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: topup, error: topupError } = await supabaseAdmin
      .from('wallet_topups')
      .select('*')
      .eq('id', topupId)
      .single()

    if (topupError || !topup) {
      return new Response(JSON.stringify({ error: 'Topup not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (topup.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: This is not your topup' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (topup.status !== 'pending_payment') {
      return new Response(JSON.stringify({ error: 'Topup is not pending payment' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bitpayApiKey = Deno.env.get('BITPAY_API_KEY')
    if (!bitpayApiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error (BITPAY_API_KEY missing)' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const amount = Math.round(topup.amount)
    const redirectUrl = `https://jamimode.ir/account/wallet/verify?topup_id=${topupId}`

    const bodyParams = new URLSearchParams()
    bodyParams.append('api', bitpayApiKey)
    bodyParams.append('amount', amount.toString())
    bodyParams.append('redirect', redirectUrl)

    const bitpayResponse = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    })

    const responseText = await bitpayResponse.text()
    const idGet = parseInt(responseText, 10)

    if (isNaN(idGet) || idGet <= 0) {
      let errorMessage = 'خطای ناشناخته در درگاه پرداخت'
      switch (idGet) {
        case -1:
          errorMessage = 'کلید API نامعتبر است'
          break
        case -2:
          errorMessage = 'مبلغ نامعتبر است یا کمتر از حداقل (5000 ریال) است'
          break
        case -3:
          errorMessage = 'آدرس بازگشت (redirect) ارسال نشده است'
          break
        case -4:
          errorMessage = 'درگاهی با این مشخصات یافت نشد یا در انتظار پرداخت نیست'
          break
        case -5:
          errorMessage = 'خطا در اتصال به درگاه پرداخت'
          break
      }

      return new Response(JSON.stringify({ error: errorMessage, code: idGet }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Success, positive integer idGet
    const { error: updateError } = await supabaseAdmin
      .from('wallet_topups')
      .update({ payment_ref: idGet.toString() })
      .eq('id', topupId)

    if (updateError) {
       return new Response(JSON.stringify({ error: 'Failed to update topup payment reference' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ redirectUrl: `https://bitpay.ir/payment/gateway-${idGet}-get` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('bitpay-wallet-init error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
