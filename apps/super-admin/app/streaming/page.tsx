'use client';

import React, { useState, useEffect } from 'react';
import {
    Radio,
    Settings,
    Activity,
    Users,
    Wifi,
    TrendingUp,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface StreamConfig {
    provider: 'agora' | 'aws_ivs' | 'custom';
    rtmp_base_url: string;
    api_key?: string;
    api_secret?: string;
    max_concurrent_streams: number;
    max_viewers_per_stream: number;
    enable_recording: boolean;
    enable_analytics: boolean;
}

interface StreamStats {
    activeStreams: number;
    totalViewers: number;
    bandwidthUsage: number; // MB
    totalStreamsToday: number;
}

export default function StreamingPage() {
    const [config, setConfig] = useState<StreamConfig>({
        provider: 'agora',
        rtmp_base_url: 'rtmp://stream.qbank.com/live',
        max_concurrent_streams: 10,
        max_viewers_per_stream: 500,
        enable_recording: true,
        enable_analytics: true,
    });

    const [stats, setStats] = useState<StreamStats>({
        activeStreams: 0,
        totalViewers: 0,
        bandwidthUsage: 0,
        totalStreamsToday: 0,
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
        fetchStats();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            // In production, fetch from settings table
            // For now, use default config
            setConfig({
                provider: 'agora',
                rtmp_base_url: 'rtmp://stream.qbank.com/live',
                max_concurrent_streams: 10,
                max_viewers_per_stream: 500,
                enable_recording: true,
                enable_analytics: true,
            });
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data: streams, error } = await supabase
                .from('live_streams')
                .select('id, status')
                .eq('status', 'live');

            if (error) throw error;

            // Calculate stats (mock data for now)
            setStats({
                activeStreams: streams?.length || 0,
                totalViewers: streams?.length ? streams.length * 25 : 0,
                bandwidthUsage: streams?.length ? streams.length * 45.5 : 0,
                totalStreamsToday: 8,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In production, save to database
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Stream configuration saved successfully!');
        } catch (error: any) {
            alert('Error saving configuration: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Live Streaming Infrastructure</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Configure RTMP server and streaming settings</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                    >
                        <RefreshCw size={18} />
                        Refresh Stats
                    </button>
                </header>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Radio className="text-emerald-600" size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.activeStreams}</h3>
                        <p className="text-xs text-slate-500">Active Streams</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="text-blue-600" size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalViewers}</h3>
                        <p className="text-xs text-slate-500">Live Viewers</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Wifi className="text-purple-600" size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.bandwidthUsage.toFixed(1)} MB</h3>
                        <p className="text-xs text-slate-500">Bandwidth Usage</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-primary" size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalStreamsToday}</h3>
                        <p className="text-xs text-slate-500">Streams Today</p>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-primary" />
                        Stream Server Configuration
                    </h2>

                    <div className="space-y-6">
                        {/* Provider Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Streaming Provider
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'agora', label: 'Agora.io', desc: 'Easy setup, low latency' },
                                    { value: 'aws_ivs', label: 'AWS IVS', desc: 'Enterprise-grade, scalable' },
                                    { value: 'custom', label: 'Custom RTMP', desc: 'Self-hosted server' },
                                ].map((provider) => (
                                    <button
                                        key={provider.value}
                                        onClick={() => setConfig({ ...config, provider: provider.value as any })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${config.provider === provider.value
                                                ? 'border-primary bg-primary-light'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {config.provider === provider.value && (
                                                <CheckCircle size={16} className="text-primary" />
                                            )}
                                            <h3 className="font-bold text-slate-900">{provider.label}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500">{provider.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RTMP Base URL */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                RTMP Base URL
                            </label>
                            <input
                                type="text"
                                value={config.rtmp_base_url}
                                onChange={(e) => setConfig({ ...config, rtmp_base_url: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="rtmp://stream.qbank.com/live"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Teachers will use this URL in OBS settings
                            </p>
                        </div>

                        {/* API Credentials (if not custom) */}
                        {config.provider !== 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type="text"
                                        value={config.api_key || ''}
                                        onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Enter API key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        API Secret
                                    </label>
                                    <input
                                        type="password"
                                        value={config.api_secret || ''}
                                        onChange={(e) => setConfig({ ...config, api_secret: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Enter API secret"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Limits */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Max Concurrent Streams
                                </label>
                                <input
                                    type="number"
                                    value={config.max_concurrent_streams}
                                    onChange={(e) => setConfig({ ...config, max_concurrent_streams: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Max Viewers Per Stream
                                </label>
                                <input
                                    type="number"
                                    value={config.max_viewers_per_stream}
                                    onChange={(e) => setConfig({ ...config, max_viewers_per_stream: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Features
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.enable_recording}
                                        onChange={(e) => setConfig({ ...config, enable_recording: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-slate-700">Enable Automatic Recording</span>
                                        <p className="text-xs text-slate-500">Save all live streams for replay</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.enable_analytics}
                                        onChange={(e) => setConfig({ ...config, enable_analytics: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-slate-700">Enable Analytics Tracking</span>
                                        <p className="text-xs text-slate-500">Track viewer count, watch time, and engagement</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Setup Guide</h3>
                            <p className="text-sm text-blue-800 mb-2">
                                After configuring the streaming server, organizations can create live classes and receive RTMP credentials for OBS.
                            </p>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Teachers will receive unique stream keys for each live class</li>
                                <li>Students can watch streams directly in the app (HLS playback)</li>
                                <li>Optional recording saves streams for later viewing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
