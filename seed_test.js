import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umzwozjznqirccjbcqij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtendvemp6bnFpcmNjamJjcWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQ2ODgsImV4cCI6MjA4OTQ0MDY4OH0.isXzrk3PyPw4tQnNEuStbU2XJatQLtCNylP6saPURpM'
);

async function testInsert() {
  console.log('Testing insert...');
  const { data, error } = await supabase.from('products').insert([
    {
      name: 'Test Product',
      price: 100,
      image: '/src/assets/logo.jpg',
      category: 'accessories',
      description: 'Test',
      is_active: true,
      specs: JSON.stringify([]),
      features: JSON.stringify([])
    }
  ]).select();

  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

testInsert();
