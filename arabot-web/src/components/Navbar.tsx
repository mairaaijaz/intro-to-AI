'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { useEffect, useState } from 'react';

function useLocalLevelProgress() {
  const KEY = 'arabot_level_progress';
  const [maxUnlocked, setMaxUnlocked] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setMaxUnlocked(JSON.parse(saved).maxUnlocked ?? 1);
    } catch { /* ignore */ }
  }, []);

  return maxUnlocked;
}

export default function Navbar() {
  const path = usePathname();
  const { showDiacritics, toggleDiacritics } = useSettings();
  const maxUnlocked = useLocalLevelProgress();
  
  const links = [
    { href: '/',          label: '🏠 Home'      },
    { href: '/quiz',      label: '🎮 Play'      },
    { href: '/wordlist',  label: '📖 Words'     },
    { href: '/analytics', label: '📊 Stats' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--nav-bg)',
      borderBottom: '2px solid rgba(0,0,0,0.05)',
      backdropFilter: 'blur(20px)',
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', gap: '8px',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: '#ff6b6b', color: '#fff', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
          أ
        </div>
        <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em', color: '#1a1a2e' }}>
          Arabot <span style={{ color: '#ff6b6b' }}>Kids</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link${path === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
        
        <div style={{ width: '2px', height: '24px', background: 'rgba(0,0,0,0.08)', margin: '0 12px', borderRadius: '2px' }} />
        
        <div style={{ background: '#ffd93d', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⭐ Lvl {maxUnlocked}
        </div>

        <button onClick={toggleDiacritics} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '6px', marginLeft: '4px' }} title="Toggle Harakat (Diacritics)">
          {showDiacritics ? 'أَ' : 'ا'}
        </button>
      </div>
    </nav>
  );
}
