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

    const { order_id, trans_id, id_get } = await req.json()

    if (!order_id) {
      return new Response(JSON.stringify({ success: false, reason: "invalid" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order || order.payment_ref !== id_get) {
      return new Response(JSON.stringify({ success: false, reason: "invalid" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (order.payment_trans_id) {
      // Already verified
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!trans_id || trans_id === "0") {
      // Payment failed or cancelled
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id)
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
    const orderAmount = Math.round(order.total_amount)

    if (verifyStatus === "1" && verifyAmount === orderAmount) {
      // Success
      await supabaseAdmin
        .from('orders')
        .update({ status: 'confirmed', payment_trans_id: trans_id })
        .eq('id', order_id)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      // Tampering / verification failed
      console.error('Bitpay verification failed:', verifyJson)
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id)
      return new Response(JSON.stringify({ success: false, reason: "verification_failed" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('bitpay-verify error:', error)
    return new Response(JSON.stringify({ success: false, reason: "error" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
