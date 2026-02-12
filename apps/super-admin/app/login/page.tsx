'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check role
      const { data: userRole, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single();

      if (roleError) throw roleError;

      if (userRole?.role !== 'super_admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied: You are not a Super Admin');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-3xl flex flex-col md:flex-row">
        {/* Left Side - Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white flex flex-col justify-between md:w-1/2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-orange-400 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl w-fit mb-6">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Super Admin</h1>
            <p className="text-orange-100 text-sm">Q-Bank platform control center</p>
          </div>
          
          <div className="relative z-10 text-xs text-orange-200 mt-8">
            &copy; 2024 Q-Bank Platform. <br />Authorized Personnel Only.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:w-1/2 bg-white flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome Back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your admin account</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  placeholder="admin@qbank.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-orange-200/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
