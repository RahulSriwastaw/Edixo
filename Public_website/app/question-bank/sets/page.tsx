"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Layers, Plus, Search, Loader2, Eye, Trash2, X, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function QuestionSetsPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [sets, setSets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewSet, setViewSet] = useState<any>(null);
  const LIMIT = 50;

  const fetchSets = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`${API_URL}/user-qbank/my-sets?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setSets(d.data.sets || []);
        setTotal(d.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, page, search]);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim()) return;
    const token = getToken();
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSetName, description: newSetDesc }),
      });
      const d = await res.json();
      if (d.success) {
        setShowCreate(false);
        setNewSetName('');
        setNewSetDesc('');
        fetchSets();
      } else alert(d.message || 'Failed to create set');
    } catch { alert('Error creating set'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this set permanently?')) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-sets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setSets(prev => prev.filter(s => s.id !== id));
    } catch { alert('Error deleting set'); }
  };

  const handleViewSet = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-sets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setViewSet(d.data);
    } catch { alert('Error loading set'); }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title"><Layers size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />My Sets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Organize your questions into sets</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> New Set</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="db-input" style={{ paddingLeft: 32 }} placeholder="Search sets..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} /></div>
      ) : sets.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <Layers size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No sets yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Create a set to organize your questions.</div>
        </div>
      ) : (
        <div className="grid-cards">
          {sets.map((set: any) => (
            <div key={set.id} className="db-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(156,39,176,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} color="#9C27B0" />
                </div>
                <span className="pill pill-accent">{set.questionCount} Q</span>
              </div>
              <div className="card-title" style={{ marginBottom: 4 }}>{set.name}</div>
              <div className="card-meta" style={{ marginBottom: 12, flex: 1 }}>{set.description || 'No description'}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleViewSet(set.id)}><Eye size={13} /> View</button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--badge-error-text)' }} onClick={() => handleDelete(set.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="db-card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <h2 className="page-title" style={{ marginBottom: 16 }}>Create New Set</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Name</label>
                <input className="db-input" required placeholder="e.g., Physics Revision" value={newSetName} onChange={e => setNewSetName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="db-input" style={{ minHeight: 60 }} placeholder="Optional" value={newSetDesc} onChange={e => setNewSetDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>{creating ? 'Creating...' : 'Create Set'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewSet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setViewSet(null)}>
          <div className="db-card" style={{ width: '100%', maxWidth: 640, padding: 20, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="page-title" style={{ margin: 0 }}>{viewSet.name}</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewSet(null)}><X size={16} /></button>
            </div>
            <p className="card-meta" style={{ marginBottom: 12 }}>{viewSet.description || ''} • {viewSet.questionCount} questions</p>
            {viewSet.questions?.length > 0 ? viewSet.questions.map((q: any, i: number) => (
              <div key={q.uqId} className="db-card" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>#{i + 1}</div>
                <div style={{ fontSize: 13 }} dangerouslySetInnerHTML={{ __html: q.textEn?.slice(0, 200) }} />
              </div>
            )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Empty set.</p>}
          </div>
        </div>
      )}
    </div>
  );
}