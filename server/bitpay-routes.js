import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

router.post("/init", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: This is not your order' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Order is not pending payment' });
    }

    const bitpayApiKey = process.env.BITPAY_API_KEY;
    if (!bitpayApiKey) {
      return res.status(500).json({ error: 'Server configuration error (BITPAY_API_KEY missing)' });
    }

    const amount = Math.round(order.total_amount);
    const redirectUrl = `https://jamimode.ir/checkout/verify?order_id=${orderId}`;

    const bodyParams = new URLSearchParams();
    bodyParams.append('api', bitpayApiKey);
    bodyParams.append('amount', amount.toString());
    bodyParams.append('redirect', redirectUrl);

    const bitpayResponse = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const responseText = await bitpayResponse.text();
    const idGet = parseInt(responseText, 10);

    if (isNaN(idGet) || idGet <= 0) {
      let errorMessage = 'خطای ناشناخته در درگاه پرداخت';
      switch (idGet) {
        case -1:
          errorMessage = 'کلید API نامعتبر است';
          break;
        case -2:
          errorMessage = 'مبلغ نامعتبر است یا کمتر از حداقل (5000 ریال) است';
          break;
        case -3:
          errorMessage = 'آدرس بازگشت (redirect) ارسال نشده است';
          break;
        case -4:
          errorMessage = 'درگاهی با این مشخصات یافت نشد یا در انتظار پرداخت نیست';
          break;
        case -5:
          errorMessage = 'خطا در اتصال به درگاه پرداخت';
          break;
      }

      return res.status(400).json({ error: errorMessage, code: idGet });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ payment_ref: idGet.toString() })
      .eq('id', orderId);

    if (updateError) {
       return res.status(500).json({ error: 'Failed to update order payment reference' });
    }

    return res.status(200).json({ redirectUrl: `https://bitpay.ir/payment/gateway-${idGet}-get` });

  } catch (error) {
    console.error('bitpay-init error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { order_id, trans_id, id_get } = req.body;

    if (!order_id) {
      return res.status(200).json({ success: false, reason: "invalid" });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order || order.payment_ref !== id_get) {
      return res.status(200).json({ success: false, reason: "invalid" });
    }

    if (order.payment_trans_id) {
      return res.status(200).json({ success: true });
    }

    if (!trans_id || trans_id === "0") {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id);
      return res.status(200).json({ success: false, reason: "cancelled" });
    }

    const bitpayApiKey = process.env.BITPAY_API_KEY;
    if (!bitpayApiKey) {
      console.error('Missing BITPAY_API_KEY');
      return res.status(200).json({ success: false, reason: "error" });
    }

    const verifyParams = new URLSearchParams();
    verifyParams.append('api', bitpayApiKey);
    verifyParams.append('trans_id', trans_id);
    verifyParams.append('id_get', id_get);
    verifyParams.append('json', '1');

    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyParams.toString(),
    });

    const verifyJson = await verifyResponse.json();
    const verifyStatus = String(verifyJson.status);
    const verifyAmount = Math.round(Number(verifyJson.amount));
    const orderAmount = Math.round(order.total_amount);

    if (verifyStatus === "1" && verifyAmount === orderAmount) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'confirmed', payment_trans_id: trans_id })
        .eq('id', order_id);
      return res.status(200).json({ success: true });
    } else {
      console.error('Bitpay verification failed:', verifyJson);
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', order_id);
      return res.status(200).json({ success: false, reason: "verification_failed" });
    }

  } catch (error) {
    console.error('bitpay-verify error:', error);
    return res.status(200).json({ success: false, reason: "error" });
  }
});

router.post("/wallet-init", async (req, res) => {
  try {
    const { topupId } = req.body;

    if (!topupId) {
      return res.status(400).json({ error: 'topupId is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: topup, error: topupError } = await supabaseAdmin
      .from('wallet_topups')
      .select('*')
      .eq('id', topupId)
      .single();

    if (topupError || !topup) {
      return res.status(404).json({ error: 'Topup not found' });
    }

    if (topup.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: This is not your topup' });
    }

    if (topup.status !== 'pending_payment') {
      return res.status(400).json({ error: 'Topup is not pending payment' });
    }

    const bitpayApiKey = process.env.BITPAY_API_KEY;
    if (!bitpayApiKey) {
      return res.status(500).json({ error: 'Server configuration error (BITPAY_API_KEY missing)' });
    }

    const amount = Math.round(topup.amount);
    const redirectUrl = `https://jamimode.ir/account/wallet/verify?topup_id=${topupId}`;

    const bodyParams = new URLSearchParams();
    bodyParams.append('api', bitpayApiKey);
    bodyParams.append('amount', amount.toString());
    bodyParams.append('redirect', redirectUrl);

    const bitpayResponse = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const responseText = await bitpayResponse.text();
    const idGet = parseInt(responseText, 10);

    if (isNaN(idGet) || idGet <= 0) {
      let errorMessage = 'خطای ناشناخته در درگاه پرداخت';
      switch (idGet) {
        case -1:
          errorMessage = 'کلید API نامعتبر است';
          break;
        case -2:
          errorMessage = 'مبلغ نامعتبر است یا کمتر از حداقل (5000 ریال) است';
          break;
        case -3:
          errorMessage = 'آدرس بازگشت (redirect) ارسال نشده است';
          break;
        case -4:
          errorMessage = 'درگاهی با این مشخصات یافت نشد یا در انتظار پرداخت نیست';
          break;
        case -5:
          errorMessage = 'خطا در اتصال به درگاه پرداخت';
          break;
      }

      return res.status(400).json({ error: errorMessage, code: idGet });
    }

    const { error: updateError } = await supabaseAdmin
      .from('wallet_topups')
      .update({ payment_ref: idGet.toString() })
      .eq('id', topupId);

    if (updateError) {
       return res.status(500).json({ error: 'Failed to update topup payment reference' });
    }

    return res.status(200).json({ redirectUrl: `https://bitpay.ir/payment/gateway-${idGet}-get` });

  } catch (error) {
    console.error('bitpay-wallet-init error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/wallet-verify", async (req, res) => {
  try {
    const { topup_id, trans_id, id_get } = req.body;

    if (!topup_id) {
      return res.status(200).json({ success: false, reason: "invalid" });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: topup, error: topupError } = await supabaseAdmin
      .from('wallet_topups')
      .select('*')
      .eq('id', topup_id)
      .single();

    if (topupError || !topup || topup.payment_ref !== id_get) {
      return res.status(200).json({ success: false, reason: "invalid" });
    }

    if (topup.payment_trans_id) {
      return res.status(200).json({ success: true });
    }

    if (!trans_id || trans_id === "0") {
      await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'payment_failed' })
        .eq('id', topup_id);
      return res.status(200).json({ success: false, reason: "cancelled" });
    }

    const bitpayApiKey = process.env.BITPAY_API_KEY;
    if (!bitpayApiKey) {
      console.error('Missing BITPAY_API_KEY');
      return res.status(200).json({ success: false, reason: "error" });
    }

    const verifyParams = new URLSearchParams();
    verifyParams.append('api', bitpayApiKey);
    verifyParams.append('trans_id', trans_id);
    verifyParams.append('id_get', id_get);
    verifyParams.append('json', '1');

    const verifyResponse = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyParams.toString(),
    });

    const verifyJson = await verifyResponse.json();
    const verifyStatus = String(verifyJson.status);
    const verifyAmount = Math.round(Number(verifyJson.amount));
    const topupAmount = Math.round(topup.amount);

    if (verifyStatus === "1" && verifyAmount === topupAmount) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', topup.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile for topup:', profileError);
        return res.status(200).json({ success: false, reason: "error" });
      }

      const currentBalance = profile.wallet_balance || 0;

      const { error: updateTopupError } = await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'confirmed', payment_trans_id: trans_id })
        .eq('id', topup_id);

      if (updateTopupError) {
        console.error('Error updating topup status:', updateTopupError);
        return res.status(200).json({ success: false, reason: "error" });
      }

      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: currentBalance + topupAmount })
        .eq('id', topup.user_id);

      if (updateProfileError) {
        console.error('Error updating profile balance:', updateProfileError);
        return res.status(200).json({ success: false, reason: "error" });
      }

      return res.status(200).json({ success: true });
    } else {
      console.error('Bitpay verification failed:', verifyJson);
      await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'payment_failed' })
        .eq('id', topup_id);
      return res.status(200).json({ success: false, reason: "verification_failed" });
    }

  } catch (error) {
    console.error('bitpay-wallet-verify error:', error);
    return res.status(200).json({ success: false, reason: "error" });
  }
});

export default router;
