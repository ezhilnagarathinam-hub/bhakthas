import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Minimal ambient for the Deno env used by Supabase Edge Functions
declare const Deno: { env: { get(name: string): string | undefined } };

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_SID = Deno.env.get("TWILIO_SID");
const TWILIO_TOKEN = Deno.env.get("TWILIO_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");

const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE || "");

// Helper to produce base64 for Basic auth in both Deno and Node runtimes
const base64 = (str: string) => {
  if (typeof (globalThis as any).btoa === 'function') return (globalThis as any).btoa(str);
  // @ts-ignore Buffer may not exist in some runtimes, but Node will have it
  if (typeof (globalThis as any).Buffer !== 'undefined') return (globalThis as any).Buffer.from(str).toString('base64');
  throw new Error('No base64 encoding available');
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const genCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const sha256hex = async (text: string) => {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { target, type } = body as { target: string; type: 'email' | 'phone' };
    if (!target || !type) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: corsHeaders });

    const code = genCode();
    const codeHash = await sha256hex(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // store in DB
    const { error: insertErr } = await supabase
      .from('otp_codes')
      .insert({ target, type, code_hash: codeHash, expires_at: expiresAt });

    if (insertErr) {
      console.error('DB insert error', insertErr);
      return new (globalThis as any).Response(JSON.stringify({ error: 'DB error' }), { status: 500, headers: corsHeaders });
    }

    // send via email or SMS
    if (type === 'email') {
      if (!RESEND_API_KEY) {
        console.warn('Resend not configured; OTP:', code);
      } else {
        // Import Resend dynamically so this file doesn't fail to load in environments
        // where npm: imports are not available at module-evaluation time.
        try {
          const mod = await import('npm:resend@2');
          const Resend = (mod as any).Resend || (mod as any).default || mod;
          const resend = new Resend(RESEND_API_KEY);
          await resend.emails.send({
            from: 'Bhakthas <onboarding@resend.dev>',
            to: [target],
            subject: 'Your OTP code',
            html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
          });
        } catch (err: unknown) {
          console.error('Resend send error', err);
          console.warn('Resend import/send failed; OTP:', code);
        }
      }
    } else {
      // phone via Twilio
      if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
        console.warn('Twilio not configured; OTP:', code);
      } else {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
        const bodyForm = new URLSearchParams();
        bodyForm.append('From', TWILIO_FROM);
        bodyForm.append('To', target);
        bodyForm.append('Body', `Your OTP code is ${code}. It expires in 5 minutes.`);
        await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${base64(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyForm.toString(),
        });
      }
    }

    return new (globalThis as any).Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return new (globalThis as any).Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});
