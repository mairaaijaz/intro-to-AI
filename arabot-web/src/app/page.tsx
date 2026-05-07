'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { predictRecall, lagDays } from '@/lib/hlr';

const CATEGORY_COLORS: Record<string, string> = {
  greetings: '#7c5cfc', numbers: '#e040fb', colors: '#f5c842',
  family: '#f87171', body: '#34d399', food: '#fb923c',
  time: '#38bdf8', nature: '#4ade80', places: '#a78bfa',
  verbs: '#f472b6', adjectives: '#fbbf24', questions: '#60a5fa',
  transport: '#6ee7b7', education: '#c084fc', health: '#86efac',
  technology: '#67e8f9', animals: '#fdba74', abstract: '#e879f9',
};

export default function HomePage() {
  const { data, loaded } = useStudentData();

  if (!loaded || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)' }}>Loading…</div>
      </div>
    );
  }

  const memories = Object.values(data.memories);
  const total    = memories.length;
  const seen     = memories.filter(w => w.nTotal > 0).length;
  const mastered = memories.filter(w => w.nTotal > 0 && w.nCorrect / w.nTotal >= 0.8).length;
  const avgHL    = seen > 0
    ? memories.filter(w => w.nTotal > 0).reduce((s, w) => s + w.halfLife, 0) / seen
    : 0;
  const overallAcc = data.stats.totalAttempts > 0
    ? (data.stats.totalCorrect / data.stats.totalAttempts * 100).toFixed(1)
    : '—';

  // Most urgent words (lowest recall)
  const urgent = memories
    .filter(w => w.nTotal > 0)
    .map(w => ({ ...w, urgency: predictRecall(data.theta, w.nCorrect, w.nWrong, lagDays(w.lastSeen)) }))
    .sort((a, b) => a.urgency - b.urgency)
    .slice(0, 5);

  const stats = [
    { label: 'Total Words',   value: total,                  color: '#7c5cfc' },
    { label: 'Practiced',     value: seen,                   color: '#e040fb' },
    { label: 'Mastered',      value: mastered,               color: '#34d399' },
    { label: 'Sessions',      value: data.stats.totalSessions, color: '#f5c842' },
    { label: 'Accuracy',      value: overallAcc + '%',       color: '#fb923c' },
    { label: 'Avg Half-Life', value: avgHL > 0 ? avgHL.toFixed(1) + 'd' : '—', color: '#38bdf8' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Hero */}
        <section className="fade-in" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🌙</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
            Learn Arabic with<br/>
            <span className="gradient-text">AI-Powered Memory</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 32px' }}>
            Applies the <strong style={{ color: 'var(--text)' }}>Half-Life Regression</strong> model
            (Duolingo, ACL 2016) to schedule 200 Arabic words at exactly the right moment — just before you forget them.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/quiz">
              <button className="btn-primary pulse-glow" style={{ fontSize: '1.1rem', padding: '14px 36px' }}>
                Start Quiz →
              </button>
            </Link>
            <Link href="/wordlist">
              <button className="btn-ghost">Browse 200 Words</button>
            </Link>
          </div>
        </section>

        {/* Stats grid */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your Progress
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {stats.map(s => (
              <div key={s.label} className="glass stat-card">
                <span className="stat-number" style={{ color: s.color }}>{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress bar */}
        <section className="glass" style={{ padding: '24px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>Vocabulary Coverage</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{seen} / {total} words</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(seen / total) * 100}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span>0%</span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>{((seen / total) * 100).toFixed(0)}% explored</span>
            <span>100%</span>
          </div>
        </section>

        {/* Most urgent */}
        {urgent.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🔴 Most Urgent — Review Now
            </h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {urgent.map(w => (
                <div key={w.wordId} className="glass" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="arabic" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>{w.arabic}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{w.english}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{w.translit}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1.1rem' }}>
                      {(w.urgency * 100).toFixed(0)}%
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>recall</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="glass" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>How the HLR Model Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: '📉', title: 'Ebbinghaus Curve', desc: 'p = 2^(-Δ/h) — memory decays exponentially from last review' },
              { icon: '⏱️', title: 'Half-Life', desc: 'h = 2^(θ·x) — predicted time for recall to fall to 50%' },
              { icon: '🧠', title: 'Adaptive Learning', desc: 'SGD updates θ after every answer — the model learns YOU' },
              { icon: '📅', title: 'Smart Scheduling', desc: 'Words with lowest predicted recall are shown first' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.title}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{item.desc}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(124,92,252,0.1)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>Reference:</strong> Settles, B. &amp; Meeder, B. (2016). <em>A Trainable Spaced Repetition Model for Language Learning.</em> ACL 2016.{' '}
            <a href="https://research.duolingo.com/papers/settles.acl16.pdf" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>Link</a>
          </div>
        </section>

      </main>
    </div>
  );
}
