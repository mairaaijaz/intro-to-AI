'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const path = usePathname();
  const links = [
    { href: '/',          label: '🏠 Home'      },
    { href: '/quiz',      label: '📝 Quiz'      },
    { href: '/wordlist',  label: '📖 Words'     },
    { href: '/analytics', label: '📊 Analytics' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,20,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: '8px',
      justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">ARABOT</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginLeft: '8px', fontWeight: 400 }}>HLR</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link${path === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
