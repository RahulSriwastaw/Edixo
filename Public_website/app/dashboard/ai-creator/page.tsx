"use client";
import React from 'react';
import { CreatorDashboard } from '../../../components/qbank/CreatorDashboard';

export default function AICreatorPage() {
  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">AI Question Creator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Generate questions using AI, extract from text, or build custom sets.
        </p>
      </div>
      
      {/* Wrapper to handle the large component scroll/overflow if needed */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-card)', height: '100%', overflow: 'auto' }}>
        <CreatorDashboard />
      </div>
    </div>
  );
}
