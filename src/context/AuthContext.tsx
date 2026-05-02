import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Exported for use in other files if needed
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "", 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

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

  // Unified Handler: Checks domain AND fetches verified role from your 'profiles' table
  const handleSetUser = async (supabaseUser: any) => {
    const email = supabaseUser.email || '';
    
    // 1. Domain Gatekeeper
    if (!email.endsWith('@neu.edu.ph')) {
      await supabase.auth.signOut();
      setUser(null);
      setTimeout(() => {
        setError("Access Denied: Please use your official University Account (@neu.edu.ph).");
      }, 100);
      return;
    }

    try {
      // 2. Fetch Verified Role from your Database Table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, onboarded')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      // 3. Map to state
      setUser({
        id: supabaseUser.id,
        displayName: supabaseUser.user_metadata.full_name || 'NEU Scholar',
        email: email,
        photo: supabaseUser.user_metadata.avatar_url,
        role: profile.role || 'student',
        onboarded: !!profile.onboarded,
      });
      setError(null);
    } catch (err: any) {
      console.error("Profile check failed:", err.message);
      setError("Account configuration error. Please contact the administrator.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSetUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleSetUser(session.user);
      else setUser(null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
    if (error) setError(error.message);
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.user) await handleSetUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook so useAuth can be found by App.tsx, LoginPage.tsx, etc.
export const useAuth = () => useContext(AuthContext);