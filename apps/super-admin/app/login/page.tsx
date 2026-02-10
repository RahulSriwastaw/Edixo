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
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left Side - Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white flex flex-col justify-between md:w-1/2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-purple-400 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit mb-8">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Super Admin</h1>
            <p className="text-indigo-100 text-lg">
              Central control center for the Q-Bank platform ecosystem.
            </p>
          </div>
          
          <div className="relative z-10 text-sm text-indigo-200 mt-12">
            &copy; 2024 Q-Bank Platform. <br />Authorized Personnel Only.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 md:w-1/2 bg-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Please sign in to your admin account.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="admin@qbank.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
