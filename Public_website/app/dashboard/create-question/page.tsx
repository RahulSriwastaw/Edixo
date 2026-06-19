"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Save, Plus, X, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function CreateQuestionPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        textEn: '', textHi: '', type: 'MCQ_SINGLE', difficulty: 'MEDIUM',
        subject: '', answer: '', explanationEn: '', explanationHi: '',
        visibility: 'PRIVATE',
    });
    const [options, setOptions] = useState([
        { id: 'A', textEn: '', textHi: '', isCorrect: false, sortOrder: 0 },
        { id: 'B', textEn: '', textHi: '', isCorrect: false, sortOrder: 1 },
        { id: 'C', textEn: '', textHi: '', isCorrect: false, sortOrder: 2 },
        { id: 'D', textEn: '', textHi: '', isCorrect: false, sortOrder: 3 },
    ]);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.textEn.trim() && !form.textHi.trim()) return alert('Please enter question text (English or Hindi)');
        const token = getToken();
        if (!token) return;
        setSaving(true);
        try {
            const body: any = { ...form };
            if (form.type === 'MCQ_SINGLE' || form.type === 'MCQ_MULTIPLE') {
                body.options = options;
            }
            const res = await fetch(`${API_URL}/user-qbank/my-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const d = await res.json();
            if (d.success) {
                router.push('/dashboard/my-questions');
            } else {
                alert(d.message || 'Failed to save');
            }
        } catch (e) {
            alert('Error saving question');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => router.back()}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="page-title" style={{ marginBottom: 4 }}>Create Question</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Add a new question to your personal bank</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Question Text */}
                <div className="db-card">
                    <div className="section-header" style={{ marginBottom: 8 }}>Question Text (English)</div>
                    <textarea className="db-input" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
                        placeholder="Enter question text in English..."
                        value={form.textEn} onChange={e => setForm({ ...form, textEn: e.target.value })} />
                </div>

                <div className="db-card">
                    <div className="section-header" style={{ marginBottom: 8 }}>Question Text (Hindi / Bilingual)</div>
                    <textarea className="db-input" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
                        placeholder="Enter question text in Hindi (optional)..."
                        value={form.textHi} onChange={e => setForm({ ...form, textHi: e.target.value })} />
                </div>

                {/* Classification */}
                <div className="db-card">
                    <div className="section-header" style={{ marginBottom: 8 }}>Classification</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Type</label>
                            <select className="db-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="MCQ_SINGLE">MCQ (Single)</option>
                                <option value="MCQ_MULTIPLE">MCQ (Multiple)</option>
                                <option value="TRUE_FALSE">True/False</option>
                                <option value="FILL_IN_BLANK">Integer/Fill</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Difficulty</label>
                            <select className="db-input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Subject</label>
                            <input className="db-input" placeholder="e.g., Physics, Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Options */}
                {(form.type === 'MCQ_SINGLE' || form.type === 'MCQ_MULTIPLE') && (
                    <div className="db-card">
                        <div className="section-header" style={{ marginBottom: 8 }}>Options</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {options.map((opt, i) => (
                                <div key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button
                                        onClick={() => {
                                            if (form.type === 'MCQ_SINGLE') {
                                                setOptions(options.map((o, idx) => ({ ...o, isCorrect: idx === i })));
                                            } else {
                                                setOptions(options.map((o, idx) => idx === i ? { ...o, isCorrect: !o.isCorrect } : o));
                                            }
                                        }}
                                        style={{
                                            width: 28, height: 28, borderRadius: form.type === 'MCQ_SINGLE' ? '50%' : 6,
                                            background: opt.isCorrect ? 'var(--badge-success-text)' : 'var(--bg-input)',
                                            border: `1px solid ${opt.isCorrect ? 'var(--badge-success-text)' : 'var(--border-input)'}`,
                                            color: opt.isCorrect ? '#fff' : 'var(--text-primary)',
                                            fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >{opt.isCorrect ? '✓' : opt.id}</button>
                                    <input className="db-input" style={{ flex: 1 }} placeholder={`Option ${opt.id} text (English)`}
                                        value={opt.textEn} onChange={e => setOptions(options.map((o, idx) => idx === i ? { ...o, textEn: e.target.value } : o))} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Answer / Explanation */}
                <div className="db-card">
                    <div className="section-header" style={{ marginBottom: 8 }}>Answer & Explanation</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {form.type === 'FILL_IN_BLANK' && (
                            <div>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Correct Answer</label>
                                <input className="db-input" placeholder="e.g., 42" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} />
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Explanation (English)</label>
                            <textarea className="db-input" style={{ minHeight: 60 }} placeholder="Explain the solution..."
                                value={form.explanationEn} onChange={e => setForm({ ...form, explanationEn: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Explanation (Hindi)</label>
                            <textarea className="db-input" style={{ minHeight: 60 }} placeholder="हल समझाएं..."
                                value={form.explanationHi} onChange={e => setForm({ ...form, explanationHi: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Visibility */}
                <div className="db-card">
                    <div className="section-header" style={{ marginBottom: 8 }}>Visibility</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className={`btn ${form.visibility === 'PRIVATE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            style={{ flex: 1 }}
                            onClick={() => setForm({ ...form, visibility: 'PRIVATE' })}
                        >🔒 Private (Only Me)</button>
                        <button
                            className={`btn ${form.visibility === 'PUBLIC' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            style={{ flex: 1 }}
                            onClick={() => setForm({ ...form, visibility: 'PUBLIC' })}
                        >🌐 Public (All Users)</button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                        Public questions become visible to all users. They can copy it but cannot edit your original.
                    </p>
                </div>

                {/* Save */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : <><Save size={14} /> Save to My Bank</>}
                    </button>
                </div>
            </div>
        </div>
    );
}