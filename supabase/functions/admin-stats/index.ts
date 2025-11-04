import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (rolesError || !roles) {
      console.error('Admin check failed:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get stats using service role
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    const { count: templesCount, error: templesError } = await supabaseClient
      .from('temples')
      .select('*', { count: 'exact', head: true });

    const { count: visitsCount, error: visitsError } = await supabaseClient
      .from('temple_visits')
      .select('*', { count: 'exact', head: true });

    const { count: ordersCount, error: ordersCountError } = await supabaseClient
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select('total_price');

    if (usersError || templesError || visitsError || ordersCountError || ordersError) {
      console.error('Error fetching stats:', { usersError, templesError, visitsError, ordersCountError, ordersError });
    }

    const revenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0) || 0;

    const stats = {
      totalUsers: users?.length || 0,
      totalTemples: templesCount || 0,
      totalVisits: visitsCount || 0,
      totalOrders: ordersCount || 0,
      totalRevenue: revenue
    };

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin stats error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});