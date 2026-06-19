import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Users, Award, Shield, Target } from 'lucide-react';

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '120px 0 60px', marginTop: '54px' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Empowering Education Through Technology
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                            Q-Bank Pro is on a mission to simplify teaching by providing an integrated ecosystem of advanced tools for educators.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 48 }}>
                        {[
                            { label: 'Verified Teachers', value: '10,000+' },
                            { label: 'Questions Generated', value: '50M+' },
                            { label: 'Partner Institutions', value: '1,200+' },
                            { label: 'PDFs/PPTs Created', value: '1M+' },
                        ].map((stat, i) => (
                            <div key={i} className="db-card" style={{ textAlign: 'center', padding: 24 }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: 48 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 24 }}>Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: Users, title: 'Inclusivity', desc: 'Making education accessible to everyone.' },
                                { icon: Award, title: 'Quality', desc: 'Uncompromising standards for educational content.' },
                                { icon: Shield, title: 'Trust', desc: 'A secure and reliable platform.' },
                                { icon: Target, title: 'Innovation', desc: 'Leveraging AI to solve educational challenges.' },
                            ].map((value, i) => {
                                const Icon = value.icon;
                                return (
                                    <div key={i} className="db-card" style={{ textAlign: 'center', padding: 24 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,107,43,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                            <Icon size={24} color="var(--accent)" />
                                        </div>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{value.title}</h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{value.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="db-card" style={{ padding: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Our Journey</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                            Q-Bank Pro started as a project to help teachers manage question papers efficiently.
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            Today, we are a comprehensive educational ecosystem that powers coaching centers and helps thousands of teachers streamline their classroom content.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}