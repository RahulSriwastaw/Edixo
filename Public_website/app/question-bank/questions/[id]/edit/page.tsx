"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Info, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditQuestionPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    textEn: '', textHi: '', type: 'MCQ_SINGLE', difficulty: 'MEDIUM',
    subject: '', answer: '', explanationEn: '', explanationHi: '',
    visibility: 'PRIVATE',
  });
  const [options, setOptions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<any>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      const token = getToken();
      if (!token || !params.id) return;
      try {
        const res = await fetch(`${API_URL}/user-qbank/my-questions/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await res.json();
        if (d.success) {
          const q = d.data;
          setForm({
            textEn: q.textEn || '', textHi: q.textHi || '',
            type: q.type || 'MCQ_SINGLE', difficulty: q.difficulty || 'MEDIUM',
            subject: q.subjectName || q.subject || '', answer: q.answer || '',
            explanationEn: q.explanationEn || '', explanationHi: q.explanationHi || '',
            visibility: q.visibility || 'PRIVATE',
          });
          setOptions(q.options || []);
          setSourceInfo({ source: q.source, sourcePackName: q.sourcePackName });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchQuestion();
  }, [params.id, getToken]);

  const handleSave = async () => {
    if (!form.textEn.trim() && !form.textHi.trim()) return alert('Please enter question text');
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const body: any = { ...form };
      if (form.type === 'MCQ_SINGLE' || form.type === 'MCQ_MULTIPLE') body.options = options;
      const res = await fetch(`${API_URL}/user-qbank/my-questions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) router.push('/question-bank/questions');
      else alert(d.message || 'Failed to update');
    } catch { alert('Error updating'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => router.back()}><ArrowLeft size={18} /></button>
        <div><h1 className="page-title" style={{ marginBottom: 4 }}>Edit Question</h1><p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Update your question</p></div>
      </div>

      {sourceInfo?.source === 'marketplace' && (
        <div className="db-card" style={{ marginBottom: 16, background: 'var(--badge-info-bg)', border: '1px solid rgba(33,150,243,0.2)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info size={16} color="var(--badge-info-text)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, color: 'var(--badge-info-text)', fontWeight: 500, marginBottom: 2 }}>Marketplace Question</p>
              <p style={{ fontSize: 12, color: 'var(--badge-info-text)', opacity: 0.9 }}>
                This question came from "{sourceInfo.sourcePackName || 'a marketplace pack'}".
                Your edits will only affect your personal copy. The original in the marketplace remains unchanged.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="db-card">
          <div className="section-header" style={{ marginBottom: 8 }}>Question Text (English)</div>
          <textarea className="db-input" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
            value={form.textEn} onChange={e => setForm({ ...form, textEn: e.target.value })} />
        </div>
        <div className="db-card">
          <div className="section-header" style={{ marginBottom: 8 }}>Question Text (Hindi)</div>
          <textarea className="db-input" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
            value={form.textHi} onChange={e => setForm({ ...form, textHi: e.target.value })} />
        </div>
        <div className="db-card">
          <div className="section-header" style={{ marginBottom: 8 }}>Classification</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
              <select className="db-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="MCQ_SINGLE">MCQ (Single)</option>
                <option value="MCQ_MULTIPLE">MCQ (Multiple)</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="FILL_IN_BLANK">Integer/Fill</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Difficulty</label>
              <select className="db-input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Subject</label>
              <input className="db-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
        </div>
        {(form.type === 'MCQ_SINGLE' || form.type === 'MCQ_MULTIPLE') && (
          <div className="db-card">
            <div className="section-header" style={{ marginBottom: 8 }}>Options</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {options.map((opt: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (form.type === 'MCQ_SINGLE') setOptions(options.map((o: any, idx: number) => ({ ...o, isCorrect: idx === i })));
                      else setOptions(options.map((o: any, idx: number) => idx === i ? { ...o, isCorrect: !o.isCorrect } : o));
                    }}
                    style={{
                      width: 28, height: 28, borderRadius: form.type === 'MCQ_SINGLE' ? '50%' : 6,
                      background: opt.isCorrect ? 'var(--badge-success-text)' : 'var(--bg-input)',
                      border: `1px solid ${opt.isCorrect ? 'var(--badge-success-text)' : 'var(--border-input)'}`,
                      color: opt.isCorrect ? '#fff' : 'var(--text-primary)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >{opt.isCorrect ? '✓' : String.fromCharCode(65 + i)}</button>
                  <input className="db-input" style={{ flex: 1 }}
                    value={opt.textEn} onChange={e => setOptions(options.map((o: any, idx: number) => idx === i ? { ...o, textEn: e.target.value } : o))} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="db-card">
          <div className="section-header" style={{ marginBottom: 8 }}>Explanation</div>
          <textarea className="db-input" style={{ minHeight: 60 }} value={form.explanationEn}
            onChange={e => setForm({ ...form, explanationEn: e.target.value })} placeholder="Explanation (English)" />
          <div style={{ marginTop: 8 }}>
            <textarea className="db-input" style={{ minHeight: 60 }} value={form.explanationHi}
              onChange={e => setForm({ ...form, explanationHi: e.target.value })} placeholder="Explanation (Hindi)" />
          </div>
        </div>
        <div className="db-card">
          <div className="section-header" style={{ marginBottom: 8 }}>Visibility</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={`btn ${form.visibility === 'PRIVATE' ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ flex: 1 }}
              onClick={() => setForm({ ...form, visibility: 'PRIVATE' })}>🔒 Private</button>
            <button className={`btn ${form.visibility === 'PUBLIC' ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ flex: 1 }}
              onClick={() => setForm({ ...form, visibility: 'PUBLIC' })}>🌐 Public</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}