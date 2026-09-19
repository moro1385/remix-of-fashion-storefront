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

    // Extract phone and OTP
    const rawPhoneNumber = payload?.user?.phone
    const otpCode = payload?.sms?.code || payload?.sms?.otp

    if (!rawPhoneNumber || !otpCode) {
      console.error('Invalid payload:', payload)
      return new Response(JSON.stringify({ error: 'Missing phone number or OTP code in payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // نرمال‌سازی شماره موبایل به فرمت محلی ایران (09...)
    let formattedPhone = String(rawPhoneNumber).trim()
    if (formattedPhone.startsWith("+98")) {
      formattedPhone = "0" + formattedPhone.slice(3)
    } else if (formattedPhone.startsWith("98")) {
      formattedPhone = "0" + formattedPhone.slice(2)
    }

    console.log(`Sending OTP to ${formattedPhone}`)

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
      text: String(otpCode),
      to: formattedPhone,
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

    // بررسی نتیجه پاسخ ملی‌پیامک
    if (!response.ok || Number(result.RetStatus) !== 1) {
      console.error("MeliPayamak API error:", result)
      throw new Error(`SMS Provider Error: ${result.StrRetStatus || result.Value || 'Failed to send'}`)
    }

    console.log("SMS sent successfully:", result)

    // Return successful response to Supabase Auth
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