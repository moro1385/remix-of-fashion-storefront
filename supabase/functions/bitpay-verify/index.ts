import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const trans_id = url.searchParams.get('trans_id')
    const id_get = url.searchParams.get('id_get')
    const order_id = url.searchParams.get('order_id')

    if (!order_id) {
      return Response.redirect('https://jamimode.ir/checkout/failed?reason=invalid', 302)
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
      return Response.redirect(`https://jamimode.ir/checkout/failed?order=${order_id}&reason=invalid`, 302)
    }

    if (order.payment_trans_id) {
      // Already verified
      return Response.redirect(`https://jamimode.ir/checkout/success?order=${order_id}`, 302)
    }

    if (!trans_id || trans_id === "0") {
      // Payment failed or cancelled
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id)
      return Response.redirect(`https://jamimode.ir/checkout/failed?order=${order_id}&reason=cancelled`, 302)
    }

    const bitpayApiKey = Deno.env.get('BITPAY_API_KEY')
    if (!bitpayApiKey) {
      console.error('Missing BITPAY_API_KEY')
      return Response.redirect(`https://jamimode.ir/checkout/failed?order=${order_id}&reason=error`, 302)
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
      return Response.redirect(`https://jamimode.ir/checkout/success?order=${order_id}`, 302)
    } else {
      // Tampering / verification failed
      console.error('Bitpay verification failed:', verifyJson)
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id)
      return Response.redirect(`https://jamimode.ir/checkout/failed?order=${order_id}&reason=verification_failed`, 302)
    }

  } catch (error) {
    console.error('bitpay-verify error:', error)
    const url = new URL(req.url)
    const order_id = url.searchParams.get('order_id')
    const redirectUrl = order_id
      ? `https://jamimode.ir/checkout/failed?order=${order_id}&reason=error`
      : 'https://jamimode.ir/checkout/failed?reason=error'
    return Response.redirect(redirectUrl, 302)
  }
})
