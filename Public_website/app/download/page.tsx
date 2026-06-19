"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Monitor, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '120px 0 60px', marginTop: '54px' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
                            <ArrowLeft size={14} /> Back to Home
                        </Link>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Download Teaching Tools</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                            Get the Whiteboard app for your device.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 32 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,107,43,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <Monitor size={28} color="var(--accent)" />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Whiteboard for Windows</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                                Optimized for high-performance live teaching with low latency and infinite canvas.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, width: '100%', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={14} color="var(--badge-success-text)" /> Infinite Canvas & Recording
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={14} color="var(--badge-success-text)" /> Q-Bank Asset Integration
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '10px 14px' }} onClick={() => alert('Download starting...')}>
                                Download for Windows
                            </button>
                        </div>

                        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 32 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(33,150,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <Smartphone size={28} color="#2196F3" />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Whiteboard for Android</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                                Perfect for teaching using tablets or smart boards with stylus support.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, width: '100%', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={14} color="var(--badge-success-text)" /> Smooth Stylus Input
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={14} color="var(--badge-success-text)" /> Cloud Sync Enabled
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '10px 14px', background: '#2196F3' }} onClick={() => alert('Download starting...')}>
                                Download for Android
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}