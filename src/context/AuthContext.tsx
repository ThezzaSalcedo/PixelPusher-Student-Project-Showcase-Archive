import React, { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../lib/supabase';

interface User {
  id: string;
  displayName: string;
  email: string;
  photo?: string;
  role: 'student' | 'admin' | 'faculty' | 'guest';
  onboarded: boolean;
}

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSetUser = async (supabaseUser: any): Promise<boolean> => {
    if (!supabaseUser) return false;

    const id = supabaseUser.id;
    const email = supabaseUser.email || '';

    if (!id) return false;

    console.log('handleSetUser - Processing user:', { id, email });

    // block non-neu
    if (!email.endsWith('@neu.edu.ph')) {
      console.log('handleSetUser - Invalid email domain:', email);
      await supabase.auth.signOut();
      setUser(null);
      setError("Invalid email domain. Please use your official @neu.edu.ph account.");
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, onboarded')
      .eq('id', id)
      .maybeSingle();

    console.log('handleSetUser - Profile lookup result:', { profile, profileError });

    // Check if profile exists
    if (!profile) {
      console.log('handleSetUser - No profile found for user:', id);
      await supabase.auth.signOut();
      setUser(null);
      setError("Your account is not yet set up. Please contact your administrator.");
      return false;
    }

    // Check if profile has a valid role
    const role = profile?.role?.toLowerCase().trim();
    if (!['student', 'admin', 'faculty'].includes(role)) {
      console.log('handleSetUser - Invalid role:', role);
      await supabase.auth.signOut();
      setUser(null);
      setError("Your account role is not recognized. Please contact your administrator.");
      return false;
    }

    const mappedUser: User = {
      id,
      displayName: supabaseUser.user_metadata?.full_name || 'NEU Scholar',
      email,
      photo: supabaseUser.user_metadata?.avatar_url,
      role: role as 'student' | 'admin' | 'faculty',
      onboarded: !!profile?.onboarded,
    };

    console.log('handleSetUser - User authenticated successfully:', { displayName: mappedUser.displayName, role: mappedUser.role });
    setError(null);
    setUser(mappedUser);
    return true;
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await handleSetUser(session.user);
      }

      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await handleSetUser(session.user);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    setError(null);

    console.log('login - Initiating Google OAuth');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.log('login - OAuth error:', error.message);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);

    console.log('loginWithEmail - Attempting login for:', email);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('loginWithEmail - Authentication failed:', authError.message);
      
      // Provide user-friendly error messages
      if (authError.message.includes('Invalid login credentials')) {
        setError("Invalid email or password. Please try again.");
      } else if (authError.message.includes('Email not confirmed')) {
        setError("Please verify your email before logging in.");
      } else {
        setError(authError.message);
      }
      return false;
    }

    if (data?.user) {
      console.log('loginWithEmail - Auth successful, setting user');
      const validUser = await handleSetUser(data.user);
      if (!validUser) {
        console.log('loginWithEmail - User failed profile validation');
        return false;
      }
      return true;
    }

    console.log('loginWithEmail - No user returned from auth');
    setError("Login failed. Please try again.");
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithEmail,
      logout,
      error,
      setError,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);