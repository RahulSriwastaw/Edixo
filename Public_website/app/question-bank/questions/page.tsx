"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, Search, Loader2, Edit2, Trash2, Globe, Eye, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function stripHtml(html?: string, truncate = false) {
  if (!html) return '';
  let text = html.replace(/<[^>]*>?/gm, '').trim();
  if (truncate) text = text.slice(0, 120) + (text.length > 120 ? '...' : '');
  return text;
}

function getSourceBadge(source: string) {
  if (source === 'marketplace') return <span className="pill pill-info"><Globe size={10} /> Marketplace</span>;
  if (source === 'self_created') return <span className="pill pill-success">Self Created</span>;
  return <span className="pill" style={{ background: '#2A1A3A', color: '#9C27B0' }}>Imported</span>;
}

export default function QuestionsViewPage() {
  const { getToken, user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewQ, setPreviewQ] = useState<any>(null);
  const LIMIT = 20;

  const fetchQuestions = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search.trim()) params.set('search', search.trim());
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (visibilityFilter !== 'all') params.set('visibility', visibilityFilter);
      const res = await fetch(`${API_URL}/user-qbank/my-questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setQuestions(d.data.questions || []);
        setTotal(d.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, page, search, sourceFilter, visibilityFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async () => {
    if (!questionToDelete) return;
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-questions/${questionToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
        setShowDeleteDialog(false);
        setQuestionToDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            <BookOpen size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
            My Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{total} questions in your personal bank</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/question-bank/ai-generate')}>
            AI Generate
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/question-bank/create')}>
            <Plus size={14} /> Create Question
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="db-input" style={{ paddingLeft: 32 }} placeholder="Search questions..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="db-input" style={{ width: 140 }} value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
          <option value="all">All Sources</option>
          <option value="self_created">Self Created</option>
          <option value="marketplace">Marketplace</option>
          <option value="imported">Imported</option>
        </select>
        <select className="db-input" style={{ width: 140 }} value={visibilityFilter} onChange={e => { setVisibilityFilter(e.target.value); setPage(1); }}>
          <option value="all">All Visibility</option>
          <option value="PRIVATE">Private</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} /></div>
      ) : questions.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No questions found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Create your first question or purchase a marketplace pack.</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => router.push('/question-bank/create')}>Create Question</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map((q: any) => (
            <div key={q.id} className="db-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    {getSourceBadge(q.source)}
                    {q.visibility === 'PUBLIC' && <span className="pill pill-accent"><Globe size={10} /> Public</span>}
                    <span className="pill pill-muted">{q.type?.replace('_', ' ') || 'MCQ'}</span>
                    <span className="pill pill-muted">{q.difficulty}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{stripHtml(q.textEn, true)}</div>
                  {q.sourcePackName && <div style={{ fontSize: 11, color: 'var(--badge-info-text)', marginTop: 2 }}>From: {q.sourcePackName}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPreviewQ(q)} title="Preview"><Eye size={14} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => router.push(`/question-bank/questions/${q.id}/edit`)} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--badge-error-text)' }}
                    onClick={() => { setQuestionToDelete(q); setShowDeleteDialog(true); }} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {previewQ && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewQ(null)}>
          <div className="db-card" style={{ width: '100%', maxWidth: 560, padding: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="page-title" style={{ margin: 0 }}>Preview</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPreviewQ(null)}><X size={16} /></button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: previewQ.textEn }} />
            {previewQ.options?.map((opt: any, i: number) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-btn)', background: opt.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-input)', border: `1px solid ${opt.isCorrect ? 'var(--badge-success-text)' : 'var(--border-input)'}`, fontSize: 13, marginTop: 6 }}>
                {String.fromCharCode(65 + i)}. {opt.textEn} {opt.isCorrect && <span style={{ marginLeft: 8, fontWeight: 600, color: 'var(--badge-success-text)' }}>✓ Correct</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteDialog && questionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="db-card" style={{ width: '100%', maxWidth: 420, padding: 20 }}>
            <h2 className="page-title" style={{ marginBottom: 8, color: 'var(--badge-error-text)' }}><Trash2 size={18} style={{ display: 'inline', marginRight: 6 }} /> Delete Question</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              {questionToDelete.source === 'marketplace'
                ? `This question will be removed from your Question Bank. It came from "${questionToDelete.sourcePackName || 'a marketplace pack'}". The original pack and other users will not be affected.`
                : 'This question will be permanently deleted from your Question Bank.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowDeleteDialog(false); setQuestionToDelete(null); }} disabled={deleting}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--badge-error-text)', color: '#fff' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Delete from My Bank'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}