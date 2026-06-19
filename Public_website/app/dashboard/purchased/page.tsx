"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BookMarked, Search, Loader2, BookOpen, ExternalLink, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function PurchasedPacksPage() {
  const { getToken } = useAuth();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPurchased = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/purchased`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setPacks(d.data.packs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPurchased();
  }, [fetchPurchased]);

  const filteredPacks = packs.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          <BookMarked size={20} style={{ display: 'inline', marginRight: 8, color: '#2196F3' }} />
          Purchased Content
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Access premium question packs added from the marketplace.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="db-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search your purchased packs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)', margin: '0 auto' }} />
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <BookMarked size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No purchased packs found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Browse the marketplace to add premium content to your library.</div>
          <Link href="/dashboard/marketplace">
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
              Explore Marketplace <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredPacks.map((pack) => (
            <div key={pack.id} className="db-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(33,150,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color="#2196F3" />
                </div>
                <span className="pill pill-accent">{pack.totalQuestions} Q</span>
              </div>

              <div className="card-title" style={{ marginBottom: 4 }}>{pack.name}</div>
              <div className="card-meta" style={{ marginBottom: 8, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {pack.description || 'No description provided'}
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                {pack.subject && <span className="pill pill-muted">{pack.subject}</span>}
                <span className="pill pill-info">Premium</span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <Link href={`/dashboard/my-question-bank/${pack.id}`} style={{ flex: 1 }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <ExternalLink size={13} /> Open
                  </button>
                </Link>
                <button 
                  className="btn btn-ghost btn-sm btn-icon" 
                  style={{ color: 'var(--badge-error-text)' }}
                  onClick={async () => {
                    if (!confirm('Remove this pack from your library?')) return;
                    const token = getToken();
                    await fetch(`${API_URL}/user-qbank/purchased/${pack.id}`, { 
                      method: 'DELETE', 
                      headers: { Authorization: `Bearer ${token}` } 
                    });
                    fetchPurchased();
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
