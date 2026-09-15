import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkpaydqzvhsbsgrbprzk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_P4Lv_i4fvR_ouUsAKiDqsw_oKpDYtBi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
