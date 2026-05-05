import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const registerUser = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, displayName, role } = req.body;

    // Validate input
    if (!email || !password || !displayName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.endsWith('@neu.edu.ph')) {
      return res.status(400).json({ message: 'Please use your official @neu.edu.ph email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
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
      return res.status(400).json({ message: authError.message || 'Registration failed' });
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
        return res.status(500).json({ message: 'Account created but profile setup failed' });
      }

      return res.status(201).json({ 
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          displayName: displayName,
          role: role,
        }
      });
    }

    return res.status(500).json({ message: 'Registration failed' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
