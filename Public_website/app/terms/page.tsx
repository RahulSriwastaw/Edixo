import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '120px 0 60px', marginTop: '54px' }}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Terms of Service</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Last updated: May 2024</p>
                    </div>
                    
                    <div className="db-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>1. Acceptance of Terms</h2>
                            <p style={{ marginBottom: 12 }}>By accessing Q-Bank Pro, you agree to these terms of service.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>2. User Accounts</h2>
                            <p style={{ marginBottom: 12 }}>You are responsible for maintaining the confidentiality of your account credentials.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>3. Content Usage</h2>
                            <p style={{ marginBottom: 12 }}>Question packs purchased from the marketplace are for personal educational use only.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>4. Limitation of Liability</h2>
                            <p>Q-Bank Pro is not liable for any damages arising from the use of our platform.</p>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Home</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}