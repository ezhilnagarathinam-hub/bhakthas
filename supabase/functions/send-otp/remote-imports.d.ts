// Local module declarations to satisfy TypeScript when checking Deno/URL imports

declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export function serve(handler: (req: any) => Promise<any> | any): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
  const _default: any;
  export default _default;
}

declare module "npm:resend@2" {
  const mod: any;
  export default mod;
}

declare module "npm:resend" {
  const mod: any;
  export default mod;
}

declare module "npm:resend*" {
  const mod: any;
  export default mod;
}
