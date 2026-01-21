const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://puwqurkjqembiliyjwqk.supabase.co";
// This MUST be the "service_role" secret from your Supabase dashboard
const supabaseServiceKey = "sb_secret_spGwuV3HHy7KYSFY6YO5qA_k_lm9pxN";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin };
