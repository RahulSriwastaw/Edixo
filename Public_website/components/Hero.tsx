import Link from "next/link";
import { ArrowRight, CheckCircle, BookOpen } from "lucide-react";

export function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden" style={{ background: 'var(--bg-body)', marginTop: '54px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
            Global <span style={{ color: 'var(--accent)' }}>Question Bank Pro</span>
          </h1>
          <p className="text-xl mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Professional question library for teachers and educators. Access thousands of curated questions, 
            create custom test papers, and manage your entire question repository from one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard/global-question-bank"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Explore Global Q-Bank
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/marketplace"
              className="btn btn-secondary"
              style={{ padding: '14px 32px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Browse Marketplace
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" style={{ color: 'var(--badge-success-text)' }} />
              10,000+ Questions
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" style={{ color: 'var(--badge-success-text)' }} />
              Multiple Subjects
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" style={{ color: 'var(--badge-success-text)' }} />
              Instant PDF/PPT Export
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient - subtle, no white */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-10 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full filter blur-3xl" style={{ background: 'var(--accent)' }}></div>
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full filter blur-3xl" style={{ background: '#2196F3' }}></div>
      </div>
    </div>
  );
}