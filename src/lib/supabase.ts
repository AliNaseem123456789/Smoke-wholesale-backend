import { config } from 'dotenv';
config(); // load .env variables

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://puwqurkjqembiliyjwqk.supabase.co";
const supabaseKey = "sb_publishable_bQe-8LeaUZZHzgmHFmm2Kw_OVWLx6sE";
export const supabase = createClient(supabaseUrl, supabaseKey);
