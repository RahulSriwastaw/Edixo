import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserStats = {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
};

type AppContextValue = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  language: 'en' | 'hi';
  setLanguage: (l: 'en' | 'hi') => void;
  stats: UserStats;
  addXP: (amount: number) => void;
  session: Session | null;
  user: User | null;
  attempts: any[];
  isLoading: boolean;
};

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [stats, setStats] = useState<UserStats>({
    xp: 1240,
    level: 2,
    streak: 7,
    badges: ['First Test', 'Physics Pro'],
  });
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) fetchUserStats(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) fetchUserStats(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserStats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (data) {
        setAttempts(data);
        
        let totalXP = 1240; // Base XP for new users
        data.forEach(attempt => {
          totalXP += (50 + attempt.score * 5);
        });
        
        setStats(prev => ({
          ...prev,
          xp: totalXP,
          level: Math.floor(totalXP / 500) + 1
        }));
      }
    } catch (e) {
      console.log('Error fetching stats', e);
    }
  };

  const addXP = (amount: number) => {
    setStats((prev) => {
      const newXP = prev.xp + amount;
      // Simple level up logic: level up every 500 XP
      const newLevel = Math.floor(newXP / 500) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
    // Refresh stats to get latest attempts
    if (user) fetchUserStats(user.id);
  };

  return (
    <Ctx.Provider value={{ theme, setTheme, language, setLanguage, stats, addXP, session, user, attempts, isLoading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppContext() {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppContext not ready');
  return v;
}

