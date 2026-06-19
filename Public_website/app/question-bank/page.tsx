"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Layers, Coins, TrendingUp, Plus, Sparkles, History, Eye, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function QuestionBankPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any[]>([
    { label: "Total Questions", value: 0, change: "0 total", icon: BookOpen, color: "orange" },
    { label: "Self Created", value: 0, change: "0 created", icon: Plus, color: "blue" },
    { label: "From Marketplace", value: 0, change: "0 purchased", icon: Coins, color: "purple" },
    { label: "Public Questions", value: 0, change: "0 shared", icon: Globe, color: "green" },
    { label: "My Sets", value: 0, change: "0 sets", icon: Layers, color: "purple" },
    { label: "Used This Month", value: 0, change: "0 used", icon: TrendingUp, color: "green" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/user-qbank/dashboard`, { headers });
        if (res.ok) {
          const { data } = await res.json();
          setStats([
            { label: "Total Questions", value: data.myQuestionsCount || 0, change: `${data.myQuestionsCount || 0} total`, icon: BookOpen, color: "orange" },
            { label: "Self Created", value: data.selfCreatedCount || 0, change: `${data.selfCreatedCount || 0} created`, icon: Plus, color: "blue" },
            { label: "From Marketplace", value: data.fromMarketplaceCount || 0, change: `${data.fromMarketplaceCount || 0} purchased`, icon: Coins, color: "purple" },
            { label: "Public Questions", value: data.publicQuestionsCount || 0, change: `${data.publicQuestionsCount || 0} shared`, icon: Globe, color: "green" },
            { label: "My Sets", value: data.mySetsCount || 0, change: `${data.mySetsCount || 0} sets`, icon: Layers, color: "purple" },
            { label: "Used This Month", value: data.usageThisMonth || 0, change: `${data.usageThisMonth || 0} used`, icon: TrendingUp, color: "green" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const colorMap: Record<string, string> = {
    orange: 'rgba(255,107,43,0.15)', blue: 'rgba(33,150,243,0.15)',
    purple: 'rgba(156,39,176,0.15)', green: 'rgba(76,175,80,0.15)',
  };
  const iconColorMap: Record<string, string> = {
    orange: 'var(--accent)', blue: '#2196F3', purple: '#9C27B0', green: '#4CAF50',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            <BookOpen size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
            My Question Bank
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Manage, generate, and organize your questions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/question-bank/ai-generate"><button className="btn btn-secondary btn-sm"><Sparkles size={14} /> AI Generate</button></Link>
          <Link href="/question-bank/create"><button className="btn btn-primary btn-sm"><Plus size={14} /> Create Question</button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="db-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: colorMap[stat.color] || 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={iconColorMap[stat.color] || 'var(--text-secondary)'} />
              </div>
              <div>
                <div className="card-meta">{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{isLoading ? '...' : stat.value.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <TrendingUp size={12} color="var(--badge-success-text)" />
                  <span style={{ fontSize: 11, color: 'var(--badge-success-text)' }}>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quick Actions</div>
        <div className="grid-cards">
          {[
            { href: "/question-bank/questions", title: "All My Questions", desc: "View, search, and manage", icon: BookOpen, color: "var(--accent)", bg: "rgba(255,107,43,0.15)" },
            { href: "/question-bank/create", title: "Create Question", desc: "Add a new question", icon: Plus, color: "#2196F3", bg: "rgba(33,150,243,0.15)" },
            { href: "/question-bank/sets", title: "Question Sets", desc: "Organize into sets", icon: Layers, color: "#9C27B0", bg: "rgba(156,39,176,0.15)" },
            { href: "/dashboard/marketplace", title: "Marketplace", desc: "Browse & purchase packs", icon: ShoppingBag, color: "#4CAF50", bg: "rgba(76,175,80,0.15)" },
            { href: "/dashboard/public-questions", title: "Public Questions", desc: "Browse community questions", icon: Eye, color: "#FF6B2B", bg: "rgba(255,107,43,0.15)" },
            { href: "/question-bank/usage-log", title: "Usage Log", desc: "Track your activity", icon: History, color: "#9C27B0", bg: "rgba(156,39,176,0.15)" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                <div className="db-card db-card-clickable" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={item.color} />
                  </div>
                  <div>
                    <div className="card-title" style={{ fontSize: 13 }}>{item.title}</div>
                    <div className="card-meta">{item.desc}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}