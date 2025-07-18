const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'kenn.teoh@storehub.com';
  const password = 'ShiftMaster2024!'; // You should change this immediately after first login

  try {
    // Create user with email and password
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        role: 'super_admin'
      }
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('User already exists. Updating password...');
        
        // Update existing user's password
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          data?.user?.id || '', 
          { password }
        );
        
        if (updateError) {
          console.error('Error updating user:', updateError);
        } else {
          console.log('✅ User password updated successfully!');
          console.log('Email:', email);
          console.log('Password:', password);
          console.log('\nYou can now login at http://localhost:3002/login');
        }
      } else {
        console.error('Error creating user:', error);
      }
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now login at http://localhost:3002/login');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdminUser();