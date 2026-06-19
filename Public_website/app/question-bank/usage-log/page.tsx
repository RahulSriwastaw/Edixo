"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { History, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function UsageLogPage() {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user-qbank/usage-logs?page=${page}&limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setLogs(d.data.logs || []);
        setTotal(d.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Created question',
      edited: 'Edited question',
      deleted: 'Deleted question',
      copied_from_public: 'Copied from public questions',
      used: 'Used in practice',
    };
    return labels[action] || action;
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          <History size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
          Usage Log
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Your activity across the question bank</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} /></div>
      ) : logs.length === 0 ? (
        <div className="db-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <History size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No activity yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Your actions will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log: any) => (
            <div key={log.id} className="db-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{getActionLabel(log.action)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
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
    </div>
  );
}