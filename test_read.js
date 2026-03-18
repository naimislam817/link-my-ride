import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umzwozjznqirccjbcqij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtendvemp6bnFpcmNjamJjcWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQ2ODgsImV4cCI6MjA4OTQ0MDY4OH0.isXzrk3PyPw4tQnNEuStbU2XJatQLtCNylP6saPURpM'
);

async function testRead() {
  console.log('Testing select...');
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Select Error:', error);
  } else {
    console.log('Select Data Length:', data.length);
    if(data.length > 0) {
        console.log('First Item:', data[0].name);
    }
  }
}

testRead();
