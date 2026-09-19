# Send SMS Supabase Edge Function

This Edge Function handles Supabase Auth's Custom SMS Hook to replace the default Twilio provider with MeliPayamak.

## 1. Set Secrets

Before deploying, configure your MeliPayamak credentials in your Supabase project using the Supabase CLI. Replace `your_username` and `your_password` with your actual credentials:

```bash
supabase secrets set MELIPAYAMAK_USERNAME=your_username MELIPAYAMAK_PASSWORD=your_password
```

*(If you are setting secrets for a linked project, make sure you are linked by running `supabase link --project-ref your_project_ref` first)*

## 2. Deploy the Function

Deploy the function to your Supabase project. We use `--no-verify-jwt` because this function is invoked directly by Supabase Auth internally as a webhook, and it sends its own specific headers rather than a standard user JWT.

```bash
supabase functions deploy send-sms --no-verify-jwt
```

## 3. Link the Webhook in Supabase Dashboard

1. Go to your **Supabase Project Dashboard**.
2. Navigate to **Authentication** > **Providers** > **Phone**.
3. Enable Phone provider if not already enabled. (Note: You may need to provide dummy Twilio credentials to save the Phone provider config initially).
4. Navigate to **Authentication** > **Hooks**.
5. Find the **Send SMS** hook.
6. Enable the hook and set the URI to the deployed Edge Function URL.
   - Typically, it looks like: `https://<your_project_ref>.supabase.co/functions/v1/send-sms`
7. Save the configuration.

Now, when a user requests an OTP via phone auth, Supabase Auth will trigger this hook, which will securely call MeliPayamak to deliver the SMS.