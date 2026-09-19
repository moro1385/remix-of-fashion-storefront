import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
  try {
    // Check if request method is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse the payload from the Supabase custom auth webhook
    const payload = await req.json()

    // Extract phone and OTP. The exact payload depends on Supabase Auth Hook version.
    // Usually it provides payload.user.phone and payload.sms.code (or otp).
    const phoneNumber = payload?.user?.phone
    const otpCode = payload?.sms?.code || payload?.sms?.otp

    if (!phoneNumber || !otpCode) {
      console.error('Invalid payload:', payload)
      return new Response(JSON.stringify({ error: 'Missing phone number or OTP code in payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Sending OTP to ${phoneNumber}`)

    const username = Deno.env.get("MELIPAYAMAK_USERNAME")
    const password = Deno.env.get("MELIPAYAMAK_PASSWORD")

    if (!username || !password) {
      console.error("Missing MeliPayamak credentials in environment variables")
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // MeliPayamak API Payload
    const smsData = {
      username: username,
      password: password,
      text: otpCode,
      to: phoneNumber,
      bodyId: 537763
    }

    // Call MeliPayamak API
    const response = await fetch("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(smsData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("MeliPayamak API error:", result)
      throw new Error(`SMS Provider Error: ${result.RetStatus || 'Unknown error'}`)
    }

    console.log("SMS sent successfully:", result)

    // Return successful response to Supabase Auth
    // Auth hooks expect the unmodified payload to be returned or they will fail.
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})