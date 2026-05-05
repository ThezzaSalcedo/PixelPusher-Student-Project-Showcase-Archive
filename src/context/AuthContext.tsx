import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
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
  const profileCache = useRef(new Map<string, any>());

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const isInstitutionEmail = (value?: string | null) =>
    !!value && normalizeEmail(value).endsWith('@neu.edu.ph');

  const handleSetUser = async (supabaseUser: any): Promise<User | null> => {
    if (!supabaseUser?.id) return null;

    const { id, email } = supabaseUser;
    const normalizedEmail = normalizeEmail(email || '');

    // Validate email domain for institutional access
    if (!isInstitutionEmail(normalizedEmail)) {
      setError("Please use your official @neu.edu.ph email address.");
      await supabase.auth.signOut();
      return null;
    }

    const cachedProfile = profileCache.current.get(id);

    try {
      let profile = cachedProfile;

      // Fetch profile only if not in cache
      if (!profile) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role, onboarded, display_name')
          .eq('id', id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError("Unable to validate your account. Please contact administrator.");
          await supabase.auth.signOut();
          return null;
        // Replace lines 61 through 73 with this:
} else if (!profile) {
  // Use upsert to handle potential race conditions or existing rows
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id,
      display_name: supabaseUser.user_metadata?.full_name || 
                   supabaseUser.user_metadata?.name || 
                   normalizedEmail.split('@')[0],
      role: 'student', // Default role
      onboarded: false
    }, { onConflict: 'id' }) // This ensures it updates if ID exists
    .select('role, onboarded, display_name')
    .single();

  if (insertError) {
    console.error('Profile creation error:', insertError);
    setError("Unable to create user profile. Please contact administrator.");
    await supabase.auth.signOut();
    return null;
  }
  profile = newProfile;
}
        
        if (profile) profileCache.current.set(id, profile);
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
        email: normalizedEmail,
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

  // Google OAuth Login
  const login = async () => {
    setError(null);
    setAuthenticating(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) setError("Google sign-in failed. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  // Manual Email + Password Login (Using Supabase)
  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    setError(null);
    setAuthenticating(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      if (!isInstitutionEmail(normalizedEmail)) {
        setError("Please use your official @neu.edu.ph email address.");
        return null;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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

