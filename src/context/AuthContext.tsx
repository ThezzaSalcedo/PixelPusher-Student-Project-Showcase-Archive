// src/context/AuthContext.tsx
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
  const [authenticating, setAuthenticating] = useState(false);

  // Simple cache to avoid repeated profile queries
  const profileCache = new Map<string, any>();

  const handleSetUser = async (supabaseUser: any): Promise<User | null> => {
    if (!supabaseUser?.id) return null;

    const { id, email } = supabaseUser;
    const cachedProfile = profileCache.get(id);

    try {
      let profile = cachedProfile;

      // Fetch profile only if not in cache
      if (!profile) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, onboarded, display_name')
          .eq('id', id)
          .maybeSingle();

        if (profileError) throw profileError;
        profile = data;
        
        if (profile) profileCache.set(id, profile);
      }

      if (!profile) {
        setError("Your account is not fully set up. Please contact the administrator.");
        await supabase.auth.signOut();
        return null;
      }

      if (!['student', 'faculty', 'admin'].includes(profile.role)) {
        setError("Invalid user role. Contact administrator.");
        await supabase.auth.signOut();
        return null;
      }

      const mappedUser: User = {
        id,
        displayName: profile.display_name || 
                     supabaseUser.user_metadata?.full_name || 
                     'NEU Scholar',
        email: email || '',
        photo: supabaseUser.user_metadata?.avatar_url,
        role: profile.role as 'student' | 'admin' | 'faculty',
        onboarded: !!profile.onboarded,
      };

      setUser(mappedUser);
      setError(null);
      return mappedUser;

    } catch (err: any) {
      console.error('handleSetUser error:', err);
      setError("Failed to load user profile.");
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleSetUser(session.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  // Google OAuth Login
  const login = async () => {
    setError(null);
    setAuthenticating(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });

      if (error) setError("Google sign-in failed. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  // Manual Email + Password Login (Optimized)
  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    setError(null);
    setAuthenticating(true);

    try {
      if (!email.endsWith('@neu.edu.ph')) {
        setError("Please use your official @neu.edu.ph email address.");
        return null;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message.includes('Invalid login credentials')
            ? "Invalid email or password. Please try again."
            : authError.message
        );
        return null;
      }

      if (data?.user) {
        const authenticatedUser = await handleSetUser(data.user);
        return authenticatedUser;
      }

      setError("Login failed. Please try again.");
      return null;
    } catch (err: any) {
      setError("An unexpected error occurred.");
      return null;
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        authenticating,
        login,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};