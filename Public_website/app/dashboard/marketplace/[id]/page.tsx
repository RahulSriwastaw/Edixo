"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken, user } = useAuth();
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/user-qbank/marketplace/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPack(d.data); })
      .finally(() => setLoading(false));

    // Check if already purchased
    const token = getToken();
    if (token) {
      fetch(`${API_URL}/user-qbank/purchased`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setPurchased((d.data.packs || []).some((p: any) => p.id === id));
          }
        }).catch(() => {});
    }
  }, [id]);

  const handlePurchase = async () => {
    const token = getToken();
    if (!token || !pack) return;
    setPurchasing(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/purchase/${pack.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) { setPurchased(true); alert(d.message); }
      else alert(d.message || 'Failed');
    } catch { alert('Network error'); }
    finally { setPurchasing(false); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', display: 'block', margin: '0 auto 10px' }} />
    </div>
  );

  if (!pack) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
      Pack not found. <Link href="/dashboard/marketplace" style={{ color: 'var(--accent)' }}>← Back</Link>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link href="/dashboard/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Marketplace
      </Link>

      {/* Pack header */}
      <div className="db-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,107,43,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{pack.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{pack.description || 'No description'}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pill pill-accent">{pack.totalQuestions} Questions</span>
              {pack.subject && <span className="pill pill-muted">{pack.subject}</span>}
              {pack.chapter && <span className="pill pill-muted">{pack.chapter}</span>}
              <span className="pill pill-success">Free</span>
            </div>
          </div>
          <div>
            {user ? (
              purchased ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-ghost" disabled style={{ color: 'var(--badge-success-text)' }}>
                    <CheckCircle size={14} /> In Your Library
                  </button>
                  <Link href={`/dashboard/my-question-bank/${pack.id}`}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Open Pack →</button>
                  </Link>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handlePurchase} disabled={purchasing}>
                  {purchasing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingBag size={14} />}
                  {purchasing ? 'Adding...' : 'Add to My Library'}
                </button>
              )
            ) : (
              <Link href="/login">
                <button className="btn btn-primary"><ShoppingBag size={14} /> Login to Add</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Preview Questions */}
      <div>
        <div style={{ marginBottom: 12 }}><span className="section-header">Preview Questions ({(pack.previewQuestions || []).length} of {pack.totalQuestions})</span></div>
        {(pack.previewQuestions || []).length === 0 ? (
          <div className="db-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>
            No preview available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pack.previewQuestions.map((q: any, i: number) => (
              <div key={q.id} className="db-card">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.textEn || q.textHi || 'Question text'}</div>
                    {q.textHi && q.textEn && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{q.textHi}</div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {q.difficulty && <span className="pill pill-muted" style={{ fontSize: 10 }}>{q.difficulty}</span>}
                      {q.type && <span className="pill pill-info" style={{ fontSize: 10 }}>{q.type}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pack.totalQuestions > 5 && (
              <div className="db-card" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: 13, borderStyle: 'dashed' }}>
                + {pack.totalQuestions - 5} more questions — Add to your library to access all
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
