'use client';

import React from 'react';
import { Sidebar } from '../../components/saas/Sidebar';
import { Header } from '../../components/saas/Header';

export default function SaaSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar - Fixed */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? '80px' : '240px' }}
      >
        <Header 
          title="Admin Portal" 
          subtitle="Manage your organization: Q_Bank" 
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
