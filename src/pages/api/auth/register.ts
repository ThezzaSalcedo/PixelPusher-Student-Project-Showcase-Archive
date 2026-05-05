import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role } = await request.json();

    // Validate input
    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!email.endsWith('@neu.edu.ph')) {
      return NextResponse.json(
        { message: 'Please use your official @neu.edu.ph email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { message: authError.message || 'Registration failed' },
        { status: 400 }
      );
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          display_name: displayName,
          email: email,
          role: role,
          onboarded: false,
        })
        .select();

      if (profileError) {
        return NextResponse.json(
          { message: 'Account created but profile setup failed' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Registration successful! Please check your email to verify your account.',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            displayName: displayName,
            role: role,
          }
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
