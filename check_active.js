import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umzwozjznqirccjbcqij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtendvemp6bnFpcmNjamJjcWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQ2ODgsImV4cCI6MjA4OTQ0MDY4OH0.isXzrk3PyPw4tQnNEuStbU2XJatQLtCNylP6saPURpM'
);

async function checkData() {
  const { data, error } = await supabase.from('products').select('name, is_active');
  if (error) console.error(error);
  else {
    console.log('Products found:', data.length);
    data.forEach(p => console.log(`- ${p.name}: is_active=${p.is_active}`));
  }
}

checkData();
