'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';

export default function Navbar() {
  const path = usePathname();
  const { theme, showDiacritics, toggleTheme, toggleDiacritics } = useSettings();
  
  const links = [
    { href: '/',          label: '🏠 Home'      },
    { href: '/quiz',      label: '📝 Quiz'      },
    { href: '/wordlist',  label: '📖 Words'     },
    { href: '/analytics', label: '📊 Analytics' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: '8px',
      justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">ARABOT</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '8px', fontWeight: 400 }}>HLR</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link${path === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
        
        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />
        
        <button onClick={toggleDiacritics} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px' }} title="Toggle Diacritics">
          {showDiacritics ? 'أَ' : 'ا'}
        </button>
        <button onClick={toggleTheme} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px' }} title="Toggle Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
