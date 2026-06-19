"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Search, Loader2, Edit2, Trash2, 
  MoreVertical, Check, X, AlertCircle, Trash, Globe 
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function MyPackQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [packData, setPackData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  
  // Question Edit/Create state
  const [editingQ, setEditingQ] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const token = getToken();
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-packs/${id}/questions?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setQuestions(d.data.questions || []);
        setPackData({ name: d.data.packName });
        setIsGlobal(d.data.isGlobal);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, getToken, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    
    try {
      const method = editingQ.id ? 'PATCH' : 'POST';
      const url = editingQ.id 
        ? `${API_URL}/user-qbank/my-packs/${id}/questions/${editingQ.id}`
        : `${API_URL}/user-qbank/my-packs/${id}/questions`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingQ)
      });
      
      const d = await res.json();
      if (d.success) {
        setShowModal(false);
        fetchQuestions();
      }
    } catch (e) {
      alert('Error saving question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to remove this question?')) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user-qbank/my-packs/${id}/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) fetchQuestions();
    } catch (e) {
      alert('Error deleting question');
    }
  };

  const openCreateModal = () => {
    setEditingQ({
      textEn: '',
      textHi: '',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      subject: '',
      answer: '1',
      optionsJson: [
        { label: 'A', textEn: '', textHi: '', isCorrect: true },
        { label: 'B', textEn: '', textHi: '', isCorrect: false },
        { label: 'C', textEn: '', textHi: '', isCorrect: false },
        { label: 'D', textEn: '', textHi: '', isCorrect: false }
      ]
    });
    setShowModal(true);
  };

  const openEditModal = (q: any) => {
    setEditingQ({ ...q });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/my-question-bank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Library
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{packData?.name || 'Loading Pack...'}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="pill pill-muted">{questions.length} Questions</span>
              {isGlobal ? (
                <span className="pill pill-info" style={{ gap: 4 }}><Globe size={10} /> Marketplace Content (Read-only)</span>
              ) : (
                <span className="pill pill-accent">Personal Collection</span>
              )}
            </div>
          </div>
          
          {!isGlobal && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={14} /> Add Question
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="db-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search questions in this pack..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)', margin: '0 auto' }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No questions found</div>
          {!isGlobal && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={openCreateModal}>
              Add Your First Question
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="db-card animate-fade-in">
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                    {q.textEn || q.textHi}
                  </div>
                  {q.textEn && q.textHi && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                      {q.textHi}
                    </div>
                  )}

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 16 }}>
                    {(q.options || q.optionsJson || []).map((opt: any, oIdx: number) => (
                      <div 
                        key={oIdx} 
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid var(--border-card)',
                          background: opt.isCorrect ? 'var(--badge-success-bg)' : 'transparent',
                          color: opt.isCorrect ? 'var(--badge-success-text)' : 'var(--text-secondary)',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <span style={{ fontWeight: 700, opacity: 0.5 }}>{opt.label || String.fromCharCode(65 + oIdx)}:</span>
                        <span>{opt.textEn || opt.textHi || opt.text}</span>
                        {opt.isCorrect && <Check size={12} style={{ marginLeft: 'auto' }} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, borderTop: '1px solid var(--divider)', paddingTop: 10 }}>
                    <span className="pill pill-muted" style={{ fontSize: 10 }}>{q.difficulty}</span>
                    <span className="pill pill-info" style={{ fontSize: 10 }}>{q.type}</span>
                    {q.subjectName && <span className="pill pill-muted" style={{ fontSize: 10 }}>{q.subjectName}</span>}
                    
                    {!isGlobal && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(q)} style={{ padding: 4 }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteQuestion(q.id)} style={{ padding: 4, color: 'var(--badge-error-text)' }}>
                          <Trash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && editingQ && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="db-card" style={{ width: '100%', maxWidth: 700, padding: 24, margin: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="page-title">{editingQ.id ? 'Edit Question' : 'Add New Question'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="space-y-4">
                  <div>
                    <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Question Text (English)</label>
                    <textarea
                      required
                      className="db-input"
                      style={{ minHeight: 80 }}
                      value={editingQ.textEn}
                      onChange={e => setEditingQ({ ...editingQ, textEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Question Text (Hindi - Optional)</label>
                    <textarea
                      className="db-input"
                      style={{ minHeight: 80 }}
                      value={editingQ.textHi}
                      onChange={e => setEditingQ({ ...editingQ, textHi: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Difficulty</label>
                      <select 
                        className="db-input"
                        value={editingQ.difficulty}
                        onChange={e => setEditingQ({ ...editingQ, difficulty: e.target.value })}
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="section-header" style={{ display: 'block', marginBottom: 6 }}>Subject</label>
                      <input 
                        className="db-input"
                        value={editingQ.subject}
                        onChange={e => setEditingQ({ ...editingQ, subject: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="section-header" style={{ display: 'block', marginBottom: 2 }}>Options</label>
                  {(editingQ.optionsJson || []).map((opt: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name="correctOpt" 
                        checked={opt.isCorrect}
                        onChange={() => {
                          const newOpts = editingQ.optionsJson.map((o: any, i: number) => ({ ...o, isCorrect: i === idx }));
                          setEditingQ({ ...editingQ, optionsJson: newOpts });
                        }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <input 
                          className="db-input" 
                          style={{ padding: '4px 8px', fontSize: 12 }} 
                          placeholder={`Option ${opt.label} (English)`}
                          value={opt.textEn}
                          onChange={e => {
                            const newOpts = [...editingQ.optionsJson];
                            newOpts[idx].textEn = e.target.value;
                            setEditingQ({ ...editingQ, optionsJson: newOpts });
                          }}
                        />
                        <input 
                          className="db-input" 
                          style={{ padding: '4px 8px', fontSize: 11, fontStyle: 'italic' }} 
                          placeholder={`Hindi (Optional)`}
                          value={opt.textHi}
                          onChange={e => {
                            const newOpts = [...editingQ.optionsJson];
                            newOpts[idx].textHi = e.target.value;
                            setEditingQ({ ...editingQ, optionsJson: newOpts });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
