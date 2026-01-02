const { config } = require('dotenv');
config(); // load .env variables

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://puwqurkjqembiliyjwqk.supabase.co";
const supabaseKey = "sb_publishable_bQe-8LeaUZZHzgmHFmm2Kw_OVWLx6sE";
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
