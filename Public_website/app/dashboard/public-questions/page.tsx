"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Eye, Search, Loader2, Copy, CheckCircle, X, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function PublicQuestionsPage() {
    const { getToken } = useAuth();
    const [questions, setQuestions] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subject, setSubject] = useState('all');
    const [page, setPage] = useState(1);
    const [previewQ, setPreviewQ] = useState<any>(null);
    const [copying, setCopying] = useState<string | null>(null);
    const LIMIT = 20;

    const fetchQuestions = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
            if (search.trim()) params.set('search', search.trim());
            if (subject !== 'all') params.set('subject', subject);
            const res = await fetch(`${API_URL}/user-qbank/public-questions?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setQuestions(d.data.questions || []);
                setTotal(d.data.total || 0);
                setSubjects(d.data.subjects || []);
            }
        } finally {
            setLoading(false);
        }
    }, [getToken, page, search, subject]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleCopyToBank = async (qId: string) => {
        const token = getToken();
        if (!token) return;
        setCopying(qId);
        try {
            const res = await fetch(`${API_URL}/user-qbank/public-questions/${qId}/copy`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                setQuestions(prev => prev.map(q => q.id === qId ? { ...q, copied: true } : q));
            } else {
                alert(d.message || 'Failed to copy');
            }
        } catch {
            alert('Network error');
        } finally {
            setCopying(null);
        }
    };

    const stripHtml = (html?: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <h1 className="page-title" style={{ marginBottom: 4 }}>
                    <Eye size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
                    Public Questions
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    Browse questions shared by other users. Copy them to your personal bank.
                </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="db-input" style={{ paddingLeft: 32 }} placeholder="Search public questions..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="db-input" style={{ width: 150 }} value={subject}
                    onChange={e => { setSubject(e.target.value); setPage(1); }}>
                    <option value="all">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', margin: '0 auto' }} />
                </div>
            ) : questions.length === 0 ? (
                <div className="db-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                    <div style={{ fontSize: 14, fontWeight: 500 }}>No public questions found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Other users haven't shared any public questions yet.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questions.map((q: any) => (
                        <div key={q.id} className="db-card" style={{ padding: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span className="pill pill-accent">Public</span>
                                        <span className="pill pill-muted">{q.type?.replace('_', ' ') || 'MCQ'}</span>
                                        <span className="pill pill-muted">{q.difficulty}</span>
                                        {q.subjectName && <span className="pill pill-muted">{q.subjectName}</span>}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                        {stripHtml(q.textEn)}...
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPreviewQ(q)} title="Preview">
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        className={`btn btn-sm ${q.copied ? 'btn-ghost' : 'btn-primary'}`}
                                        disabled={q.copied || copying === q.id}
                                        onClick={() => !q.copied && handleCopyToBank(q.id)}
                                    >
                                        {copying === q.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                            : q.copied ? <><CheckCircle size={13} /> Copied</>
                                                : <><Copy size={13} /> Copy to My Bank</>}
                                    </button>
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
                    <div className="db-card" style={{ width: '100%', maxWidth: 560, padding: 20, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 className="page-title" style={{ margin: 0 }}>Question Preview</h2>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPreviewQ(null)}><X size={16} /></button>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}
                            dangerouslySetInnerHTML={{ __html: previewQ.textEn }} />
                        {previewQ.options && previewQ.options.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                {previewQ.options.map((opt: any, i: number) => (
                                    <div key={i} style={{
                                        padding: '8px 12px', borderRadius: 'var(--radius-btn)',
                                        background: 'var(--bg-input)', border: '1px solid var(--border-input)', fontSize: 13
                                    }}>
                                        {String.fromCharCode(65 + i)}. {opt.textEn}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}