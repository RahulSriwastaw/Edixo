"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Download, ShoppingCart, Loader2, BookOpen, Star, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Question {
  id: string;
  text_en: string;
  text_hi?: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: string;
  createdBy?: string;
  isPublic?: boolean;
  price?: number;
  rating?: number;
}

interface Pack {
  id: string;
  name: string;
  description: string;
  subject: string;
  totalQuestions: number;
  price: number;
  rating: number;
  downloads: number;
  creator?: string;
  isPublic: boolean;
}

export default function GlobalQuestionBank() {
  const { getToken, user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'questions' | 'packs'>('packs');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    priceRange: 'all'
  });
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  // Fetch all public question packs
  const fetchPublicPacks = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);

      const res = await fetch(`${API_URL}/user-qbank/marketplace?${queryParams.toString()}`, { headers });
      const d = await res.json();
      if (d.success) {
        setPacks(d.data.packs || []);
      }
    } catch (e) {
      console.error('Error fetching packs:', e);
    } finally {
      setLoading(false);
    }
  }, [getToken, search, filters]);

  // Fetch individual questions within a pack
  const fetchPackQuestions = useCallback(async (packId: string) => {
    try {
      const token = getToken();
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/user-qbank/marketplace/${packId}/questions`, { headers });
      const d = await res.json();
      if (d.success) {
        setQuestions(d.data.questions || []);
      }
    } catch (e) {
      console.error('Error fetching pack questions:', e);
    }
  }, [getToken]);

  useEffect(() => {
    if (viewMode === 'packs') {
      fetchPublicPacks();
    }
  }, [viewMode, fetchPublicPacks]);

  const handleBuyPack = async (packId: string) => {
    if (!user) {
      alert('Please log in to purchase');
      return;
    }
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/user-qbank/marketplace/${packId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const d = await res.json();
      if (d.success) {
        alert('Pack purchased successfully!');
        fetchPublicPacks();
      } else {
        alert(d.message || 'Purchase failed');
      }
    } catch (e) {
      alert('Error purchasing pack');
    }
  };

  const handleViewPack = (pack: Pack) => {
    setSelectedPack(pack);
    fetchPackQuestions(pack.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'rgba(76, 175, 80, 0.15)';
      case 'medium': return 'rgba(255, 152, 0, 0.15)';
      case 'hard': return 'rgba(244, 67, 54, 0.15)';
      default: return 'rgba(255, 255, 255, 0.07)';
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return 'var(--text-secondary)';
    }
  };

  if (selectedPack) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <button
          onClick={() => {
            setSelectedPack(null);
            setQuestions([]);
          }}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 20 }}
        >
          ← Back to Marketplace
        </button>

        <div className="db-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 className="page-title">{selectedPack.name}</h2>
              <p className="card-meta">{selectedPack.description}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="pill pill-accent">{selectedPack.totalQuestions} Questions</span>
                <span className="pill pill-muted">{selectedPack.subject}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--badge-info-text)' }}>
                  <Star size={12} fill="currentColor" /> {(selectedPack.rating || 0).toFixed(1)}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                ₹{selectedPack.price}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleBuyPack(selectedPack.id)}
              >
                <ShoppingCart size={14} /> Buy Now
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 className="section-header" style={{ marginBottom: 16 }}>Questions in this pack ({questions.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map((q) => (
              <div key={q.id} className="db-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p className="card-title" style={{ marginBottom: 4 }}>{q.text_en}</p>
                    {q.text_hi && <p className="card-meta">{q.text_hi}</p>}
                  </div>
                  <span
                    className="pill"
                    style={{ background: getDifficultyColor(q.difficulty), color: getDifficultyTextColor(q.difficulty), flexShrink: 0 }}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={24} style={{ color: 'var(--accent)' }} />
            Global Question Bank
          </h1>
          <p className="card-meta">Browse and purchase question packs from our curated marketplace</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="db-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search question packs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="db-input"
          value={filters.subject}
          onChange={e => setFilters({ ...filters, subject: e.target.value })}
          style={{ minWidth: 120 }}
        >
          <option value="">All Subjects</option>
          <option value="Math">Mathematics</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
          <option value="SST">Social Studies</option>
          <option value="Sanskrit">Sanskrit</option>
        </select>

        <button className="btn btn-secondary" style={{ gap: 6 }}>
          <Filter size={14} /> More Filters
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)', margin: '0 auto' }} />
        </div>
      ) : packs.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>No question packs found</p>
          <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid-cards">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="db-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'rgba(255, 107, 43, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} style={{ color: '#FFC107' }} fill="#FFC107" />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{(pack.rating || 0).toFixed(1)}</span>
                </div>
              </div>

              <h3 className="card-title" style={{ marginBottom: 4 }}>{pack.name}</h3>
              <p className="card-meta" style={{ marginBottom: 12, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {pack.description}
              </p>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="pill pill-accent">{pack.totalQuestions} Q</span>
                <span className="pill pill-muted">{pack.subject}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--divider)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Download size={12} /> {pack.downloads} downloads
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>₹{pack.price}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyPack(pack.id);
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
