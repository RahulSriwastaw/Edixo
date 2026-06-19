"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Loader2, Edit2, Trash2, Globe, ExternalLink, Filter } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function MyQuestionBankPage() {
  const { getToken } = useAuth();
  const [packs, setPacks] = useState<any[]>([]);
  const [purchasedPacks, setPurchasedPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPack, setNewPack] = useState({ name: '', description: '', subject: '', isPublic: false });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'purchased'>('my');

  const fetchMyPacks = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-packs?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setPacks(d.data.packs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [getToken, search]);

  const fetchPurchasedPacks = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user-qbank/purchased`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setPurchasedPacks(d.data.packs || []);
    } catch (e) {
      console.error(e);
    }
  }, [getToken]);

  useEffect(() => {
    fetchMyPacks();
    fetchPurchasedPacks();
  }, [fetchMyPacks, fetchPurchasedPacks]);

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-packs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPack)
      });
      const d = await res.json();
      if (d.success) {
        setShowCreateModal(false);
        setNewPack({ name: '', description: '', subject: '', isPublic: false });
        fetchMyPacks();
      }
    } catch (e) {
      alert('Error creating pack');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePack = async (id: string, name: string, isPurchased: boolean) => {
    if (isPurchased) {
      alert('You cannot delete purchased question packs. Only your personal packs can be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${name}"? All questions in it will be removed.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-packs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) fetchMyPacks();
    } catch (e) {
      alert('Error deleting pack');
    }
  };

  const displayPacks = activeTab === 'my' ? packs : purchasedPacks;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            <BookOpen size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
            My Question Bank
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Manage your personal question collections and purchased content.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> New Pack
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--divider)', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            padding: '10px 4px',
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === 'my' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${activeTab === 'my' ? 'var(--accent)' : 'transparent'}`,
            background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Personal Packs ({packs.length})
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          style={{
            padding: '10px 4px',
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === 'purchased' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${activeTab === 'purchased' ? 'var(--accent)' : 'transparent'}`,
            background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Purchased Content ({purchasedPacks.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="db-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search your library..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)', margin: '0 auto' }} />
        </div>
      ) : displayPacks.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No packs found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {activeTab === 'my' ? "You haven't created any personal packs yet." : "You haven't added any marketplace packs yet."}
          </div>
          {activeTab === 'my' && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowCreateModal(true)}>
              Create Your First Pack
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {displayPacks.map((pack) => (
            <div key={pack.id} className="db-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: activeTab === 'my' ? 'rgba(255,107,43,0.15)' : 'rgba(33,150,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color={activeTab === 'my' ? 'var(--accent)' : '#2196F3'} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span className="pill pill-accent">{pack.questionCount || pack.totalQuestions || 0} Q</span>
                  {pack.isPublic && <span className="pill pill-success"><Globe size={10} /> Public</span>}
                </div>
              </div>

              <div className="card-title" style={{ marginBottom: 4 }}>{pack.name}</div>
              <div className="card-meta" style={{ marginBottom: 8, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {pack.description || 'No description provided'}
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                {pack.subject && <span className="pill pill-muted">{pack.subject}</span>}
                <span className="pill pill-muted">{activeTab === 'my' ? 'Personal' : 'Marketplace'}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <Link href={`/dashboard/my-question-bank/${pack.id}`} style={{ flex: 1 }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <ExternalLink size={13} /> View Questions
                  </button>
                </Link>
                {activeTab === 'my' && (
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => handleDeletePack(pack.id, pack.name, false)}
                    style={{ color: 'var(--badge-error-text)' }}
                    title="Delete this personal pack"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {activeTab === 'purchased' && (
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5 }}
                    title="Cannot delete purchased packs"
                    disabled
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="db-card" style={{ width: '100%', maxWidth: 450, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h2 className="page-title" style={{ marginBottom: 16 }}>Create Question Pack</h2>
            <form onSubmit={handleCreatePack} className="space-y-4">
              <div>
                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Pack Name</label>
                <input
                  required
                  className="db-input"
                  placeholder="e.g., Mathematics SSC CGL 2024"
                  value={newPack.name}
                  onChange={e => setNewPack({ ...newPack, name: e.target.value })}
                />
              </div>
              <div>
                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Description (Optional)</label>
                <textarea
                  className="db-input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  placeholder="What's inside this pack?"
                  value={newPack.description}
                  onChange={e => setNewPack({ ...newPack, description: e.target.value })}
                />
              </div>
              <div>
                <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Subject</label>
                <input
                  className="db-input"
                  placeholder="e.g., General Awareness"
                  value={newPack.subject}
                  onChange={e => setNewPack({ ...newPack, subject: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPack.isPublic}
                  onChange={e => setNewPack({ ...newPack, isPublic: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isPublic" style={{ fontSize: 13, cursor: 'pointer' }}>Make Public (Share with marketplace)</label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
