"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '120px 0 60px', marginTop: '54px' }}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
                            <ArrowLeft size={14} /> Back to Home
                        </Link>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Contact Us</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            Get in touch with our team.
                        </p>
                    </div>

                    <div className="db-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Full Name</label>
                                <input type="text" placeholder="John Doe" className="db-input" />
                            </div>
                            <div>
                                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Email Address</label>
                                <input type="email" placeholder="john@example.com" className="db-input" />
                            </div>
                            <div>
                                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Subject</label>
                                <input type="text" placeholder="How can we help?" className="db-input" />
                            </div>
                            <div>
                                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Message</label>
                                <textarea rows={5} placeholder="Your message here..." className="db-input" style={{ minHeight: 120, resize: 'vertical' }} />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '10px 14px' }}>
                                <Send size={14} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}