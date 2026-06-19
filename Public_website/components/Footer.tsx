import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-sidebar)', borderTop: '1px solid var(--divider)', padding: '40px 0 24px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginBottom: 16, textDecoration: 'none' }}>
              <BookOpen size={20} /> Q-Bank Pro
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
              Empowering educators with a professional question bank platform.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><Link href="/dashboard/global-question-bank" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Global Q-Bank</Link></li>
              <li><Link href="/dashboard/marketplace" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Marketplace</Link></li>
              <li><Link href="/tools/creator" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>AI Creator</Link></li>
              <li><Link href="/tools/pdf-studio" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>PDF Studio</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><Link href="/about" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>About Us</Link></li>
              <li><Link href="/blog" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Blog</Link></li>
              <li><Link href="/contact" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          <p>&copy; {new Date().getFullYear()} Q-Bank Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}