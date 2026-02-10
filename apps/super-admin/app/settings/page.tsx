'use client';

import React, { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string | null;
  enabled: boolean;
  critical: boolean;
}

export default function SettingsPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeatureFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      alert('Error fetching feature flags. Please check Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const handleToggle = async (id: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return;

    if (feature.critical && feature.enabled) {
      const confirmed = confirm(
        `⚠️ WARNING: You are about to disable "${feature.name}".\n\nThis is a critical feature and disabling it will affect all organizations.\n\nAre you absolutely sure?`,
      );
      if (!confirmed) return;
    }

    const newEnabled = !feature.enabled;
    setUpdatingId(id);

    // Optimistic UI update
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: newEnabled } : f)),
    );

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      alert(
        `Feature "${feature.name}" ${newEnabled ? 'enabled' : 'disabled'} successfully.`,
      );
    } catch (error: any) {
      // Revert on error
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabled: feature.enabled } : f)),
      );
      alert('Error updating feature flag: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEmergencyShutdown = async () => {
    const confirmed = confirm(
      '⚠️ EMERGENCY SHUTDOWN\n\nThis will disable ALL platform features immediately.\n\nAre you absolutely sure?',
    );
    if (!confirmed) return;

    setUpdatingId('all');

    // Optimistic update
    setFeatures((prev) => prev.map((f) => ({ ...f, enabled: false })));

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: false, updated_at: new Date().toISOString() });

      if (error) throw error;

      alert('Emergency shutdown activated. All features have been disabled.');
    } catch (error: any) {
      alert('Error performing emergency shutdown: ' + error.message);
      // Refetch to get real state from server
      fetchFeatureFlags();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Global Settings</h1>
          <p className="text-slate-500 mt-2">
            Configure platform-wide settings and feature flags.
          </p>
        </header>

        {/* Feature Flags Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Feature Flags</h2>
                <p className="text-sm text-slate-500">
                  Control platform-wide features and capabilities
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading feature flags...</p>
            ) : features.length === 0 ? (
              <p className="text-sm text-slate-500">
                No feature flags found. Make sure you have run the database setup SQL.
              </p>
            ) : (
              features.map((feature) => (
                <div
                  key={feature.id}
                  className="p-5 rounded-xl border-2 border-slate-200 hover:border-indigo-200 transition-all bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {feature.name}
                        </h3>
                        {feature.critical && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Critical
                          </span>
                        )}
                        {feature.enabled ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={12} />
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {feature.description || 'No description provided.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggle(feature.id)}
                      disabled={updatingId === feature.id || updatingId === 'all'}
                      className={`ml-6 relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                        feature.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${
                        updatingId === feature.id || updatingId === 'all'
                          ? 'opacity-60 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                          feature.enabled ? 'translate-x-12' : 'translate-x-1'
                        }`}
                      >
                        {feature.enabled ? (
                          <ToggleRight className="text-emerald-600 m-1.5" size={28} />
                        ) : (
                          <ToggleLeft className="text-slate-400 m-1.5" size={28} />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Emergency Controls</h2>
                <p className="text-sm text-slate-500">Critical platform-wide actions</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={handleEmergencyShutdown}
              disabled={updatingId === 'all'}
              className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <AlertTriangle size={24} />
              Emergency Platform Shutdown
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              This will immediately disable all features across the entire platform
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Feature Flag Information</h4>
              <p className="text-sm text-blue-700">
                Feature flags allow you to enable or disable platform-wide features without
                deploying code changes. Changes take effect immediately for all
                organizations. Critical features require additional confirmation before
                being disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
