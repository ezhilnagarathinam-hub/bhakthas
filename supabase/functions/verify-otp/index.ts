import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");
const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sha256hex = async (text: string) => {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { target, type, code } = await req.json() as { target: string; type: 'email' | 'phone'; code: string };
    if (!target || !type || !code) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: corsHeaders });

    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('target', target)
      .eq('type', type)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return new Response(JSON.stringify({ ok: false, reason: 'no_otp' }), { status: 200, headers: corsHeaders });

    const now = new Date();
    if (new Date(data.expires_at) < now) return new Response(JSON.stringify({ ok: false, reason: 'expired' }), { status: 200, headers: corsHeaders });

    const codeHash = await sha256hex(code);
    if (codeHash !== data.code_hash) return new Response(JSON.stringify({ ok: false, reason: 'invalid' }), { status: 200, headers: corsHeaders });

    // mark used
    await supabase.from('otp_codes').update({ used: true }).eq('id', data.id);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: corsHeaders });
  }
});
