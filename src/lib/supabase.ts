import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbvjrdvlugsggnrfufai.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PhkVq6D16maTviY6xlwfBQ_r86HM9QW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
