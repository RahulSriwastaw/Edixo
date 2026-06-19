"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, Zap, DollarSign, Users, BarChart3, Shield } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLaunchClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Navbar />
      <Hero />
      <Features />

      {/* Stats Section - Dark Themed */}
      <section style={{ padding: '40px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm md:text-base">
          <div>
            <p style={{ fontSize: '28px', fontWeight: 900, marginBottom: 4, color: 'var(--accent)' }}>10k+</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Questions in Library</p>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 900, marginBottom: 4, color: 'var(--accent)' }}>500+</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Question Packs</p>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 900, marginBottom: 4, color: 'var(--accent)' }}>5k+</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Users</p>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 900, marginBottom: 4, color: 'var(--accent)' }}>Free</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Starting Price</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-body)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Ready to transform your teaching?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Join thousands of educators who already use Q-Bank Pro to create, manage, and share question banks.
          </p>
          <button onClick={handleLaunchClick} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15, fontWeight: 600 }}>
            Launch Q-Bank Pro
          </button>
        </div>
      </section>
    </main>
  );
}