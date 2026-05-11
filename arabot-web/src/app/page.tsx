'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { useEffect, useState } from 'react';
import { getLevelById } from '@/lib/levels';

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

export default function HomePage() {
  const { data, loaded } = useStudentData();
  const maxUnlocked = useLocalLevelProgress();

  if (!loaded || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: '1.2rem', fontWeight: 700 }}>Loading... 🌟</div>
      </div>
    );
  }

  const memories = Object.values(data.memories);
  const total    = memories.length;
  const seen     = memories.filter(w => w.nTotal > 0).length;
  const mastered = memories.filter(w => w.nTotal > 0 && w.nCorrect / w.nTotal >= 0.8).length;
  
  const currentLvl = getLevelById(maxUnlocked);

  const stats = [
    { label: 'Words Found',   value: seen,                   color: 'var(--accent4)' },
    { label: 'Super Mastered',value: mastered,               color: 'var(--accent3)' },
    { label: 'Quizzes Done',  value: data.stats.totalSessions, color: 'var(--accent2)' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Floating orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
      <div className="orb orb4" />

      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Hero */}
        <section className="fade-in" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '12px' }} className="float">🚀</div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
            Learn Arabic<br/>
            <span className="gradient-text">Like Magic!</span> ✨
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.15rem', maxWidth: '520px', margin: '0 auto 32px', fontWeight: 600 }}>
            Play quizzes, unlock awesome levels, and learn {total} new words! 
            The AI remembers what you need to practice.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/quiz">
              <button className="btn-primary pulse-glow" style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '24px' }}>
                Play Now! 🎮
              </button>
            </Link>
          </div>
        </section>

        {/* Current Level Card */}
        <section className="fade-in" style={{ marginBottom: '40px', animationDelay: '0.1s' }}>
          <div className="glass" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.9)' }}>
            <div style={{ fontSize: '4rem', background: currentLvl?.color || '#eee', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              {currentLvl?.emoji || '🏆'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Your Progress
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>
                Level {maxUnlocked}: {currentLvl?.name || 'Awesome'}
              </h2>
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>
                {currentLvl?.description}
              </p>
            </div>
            <div>
              <Link href="/quiz">
                <button className="btn-ghost" style={{ borderRadius: '20px' }}>Go to Map 🗺️</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="fade-in" style={{ marginBottom: '48px', animationDelay: '0.2s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {stats.map(s => (
              <div key={s.label} className="glass stat-card" style={{ alignItems: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.85)' }}>
                <span className="stat-number" style={{ color: s.color, fontSize: '2.5rem' }}>{s.value}</span>
                <span className="stat-label" style={{ color: '#555' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress bar */}
        <section className="glass fade-in" style={{ padding: '28px', marginBottom: '48px', animationDelay: '0.3s', background: 'rgba(255,255,255,0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Words Discovered</span>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem' }}>{seen} / {total}</span>
          </div>
          <div className="progress-bar" style={{ height: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.05)' }}>
            <div className="progress-fill" style={{ width: `${(seen / total) * 100}%`, borderRadius: '16px', background: 'linear-gradient(90deg, #ffd93d, #ff6b6b)' }} />
          </div>
        </section>

      </main>
    </div>
  );
}
