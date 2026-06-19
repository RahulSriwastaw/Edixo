"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Filter, ShoppingBag, Eye, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function MarketplacePage() {
  const { getToken, user } = useAuth();
  const [packs, setPacks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const LIMIT = 18;

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
      if (search.trim()) params.set('search', search.trim());
      if (subject !== 'all') params.set('subject', subject);
      const res = await fetch(`${API_URL}/user-qbank/marketplace?${params}`);
      const data = await res.json();
      if (data.success) {
        setPacks(data.data.packs || []);
        setTotal(data.data.total || 0);
        setSubjects(data.data.subjects || []);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, subject, sort]);

  // Load purchased packs
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/user-qbank/purchased`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) setPurchased(new Set((d.data.packs || []).map((p: any) => p.id)));
      }).catch(() => {});
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPacks();
  };

  const handlePurchase = async (packId: string) => {
    const token = getToken();
    if (!token) return;
    setPurchasing(packId);
    try {
      const res = await fetch(`${API_URL}/user-qbank/purchase/${packId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setPurchased(prev => new Set([...prev, packId]));
        alert(d.message || 'Pack added to your library!');
      } else {
        alert(d.message || 'Failed to add pack');
      }
    } catch {
      alert('Network error');
    } finally {
      setPurchasing(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          <ShoppingBag size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
          Question Pack Marketplace
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Browse and add global question packs to your library — {total} packs available.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 200 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="db-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search packs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            <Search size={13} />
          </button>
        </form>

        <select
          className="db-input"
          style={{ width: 150 }}
          value={subject}
          onChange={e => { setSubject(e.target.value); setPage(1); }}
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="db-input"
          style={{ width: 140 }}
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
        >
          <option value="popular">Most Questions</option>
          <option value="newest">Newest First</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Packs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', margin: '0 auto 10px', display: 'block' }} />
          <div style={{ fontSize: 13 }}>Loading marketplace...</div>
        </div>
      ) : packs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No packs found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Try different search terms or filters</div>
        </div>
      ) : (
        <div className="grid-cards">
          {packs.map((pack: any) => {
            const isPurchased = purchased.has(pack.id);
            return (
              <div key={pack.id} className="db-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,107,43,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={16} color="var(--accent)" />
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="pill pill-accent">{pack.totalQuestions} Q</span>
                    {isPurchased && <span className="pill pill-success">In Library</span>}
                  </div>
                </div>

                <div className="card-title" style={{ marginBottom: 4, flex: 1 }}>{pack.name}</div>
                <div className="card-meta" style={{ marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {pack.description || 'No description provided'}
                </div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {pack.subject && <span className="pill pill-muted">{pack.subject}</span>}
                  {pack.chapter && <span className="pill pill-muted">{pack.chapter}</span>}
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/dashboard/marketplace/${pack.id}`} style={{ flex: 1 }}>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                      <Eye size={13} /> Preview
                    </button>
                  </Link>
                  {user && (
                    <button
                      className={`btn btn-sm ${isPurchased ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ flex: 1 }}
                      disabled={isPurchased || purchasing === pack.id}
                      onClick={() => !isPurchased && handlePurchase(pack.id)}
                    >
                      {purchasing === pack.id ? (
                        <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : isPurchased ? (
                        <><CheckCircle size={13} /> Added</>
                      ) : (
                        <><ShoppingBag size={13} /> Add to Library</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >Next →</button>
        </div>
      )}
    </div>
  );
}
