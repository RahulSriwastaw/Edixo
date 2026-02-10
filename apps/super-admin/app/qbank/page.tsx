'use client';

import React from 'react';
import { CreatorDashboard } from '../../components/qbank/CreatorDashboard';

export default function QBankPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <CreatorDashboard 
        onLaunchPresentation={(id) => console.log('Launch Presentation', id)}
        onLaunchPDF={(id) => console.log('Launch PDF', id)}
        onLaunchRefine={(id) => console.log('Launch Refine', id)}
      />
    </div>
  );
}
