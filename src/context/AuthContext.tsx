// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string | null;
  is_active: boolean;
  employeeid: string | null;
  reportingto: string | null;
};

type AuthState = {
  loading: boolean;
  session: ReturnType<typeof supabase.auth.getSession> extends Promise<infer R> ? any : any;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id;
    if (!uid) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,role,department,is_active,employeeid,reportingto')
      .eq('id', uid)
      .single();
    if (error) {
      setProfile(null);
      return;
    }
    setProfile(data as UserProfile);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setSession(data.session);
    await refreshProfile();
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) await refreshProfile();
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ loading, session, profile, signIn, signOut, refreshProfile }),
    [loading, session, profile]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
