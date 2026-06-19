import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '120px 0 60px', marginTop: '54px' }}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Privacy Policy</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Last updated: May 2024</p>
                    </div>
                    
                    <div className="db-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>1. Information We Collect</h2>
                            <p style={{ marginBottom: 12 }}>We collect information you provide when creating an account, including name, email address, and educational institution details.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>2. How We Use Your Information</h2>
                            <p style={{ marginBottom: 12 }}>Your information is used to provide and improve our question bank services, process transactions, and send important updates.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>3. Data Security</h2>
                            <p style={{ marginBottom: 12 }}>We implement industry-standard security measures to protect your data from unauthorized access.</p>
                            
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>4. Contact</h2>
                            <p>For privacy-related inquiries, please contact our team.</p>
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