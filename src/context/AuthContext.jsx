import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadProfile = async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data || null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return; // stay in demo mode, no session to load

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data?.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) await loadProfile(sessionUser.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
    return supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, isAdmin, isSupabaseConfigured }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
