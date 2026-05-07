'use client';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { predictRecall, lagDays, predictHalfLife } from '@/lib/hlr';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const DARK = {
  text:    '#9090b0',
  grid:    'rgba(255,255,255,0.06)',
  tooltip: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e8e8f0' },
};

export default function AnalyticsPage() {
  const { data, loaded, resetData } = useStudentData();

  if (!loaded || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--muted)' }}>Loading…</span>
    </div>
  );

  const memories = Object.values(data.memories);
  const seen     = memories.filter(w => w.nTotal > 0);
  const stats    = data.stats;

  // ── Session accuracy chart data ──────────────────────────────────────────
  const sessionData = stats.sessionScores.map((acc, i) => ({
    session: i + 1,
    accuracy: parseFloat((acc * 100).toFixed(1)),
    halfLife: parseFloat((stats.halfLifeHistory[i] ?? 0).toFixed(2)),
  }));

  // ── Category accuracy ─────────────────────────────────────────────────────
  const catMap: Record<string, { correct: number; total: number }> = {};
  for (const w of memories) {
    if (!catMap[w.category]) catMap[w.category] = { correct: 0, total: 0 };
    catMap[w.category].correct += w.nCorrect;
    catMap[w.category].total   += w.nTotal;
  }
  const categoryData = Object.entries(catMap)
    .map(([cat, v]) => ({
      category: cat,
      accuracy: v.total > 0 ? parseFloat((v.correct / v.total * 100).toFixed(1)) : 0,
      attempts: v.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // ── Forgetting curves (sample 8 seen words) ───────────────────────────────
  const sample = seen.slice(0, 8);
  const forgetData = Array.from({ length: 31 }, (_, d) => {
    const row: Record<string, number | string> = { day: d };
    for (const w of sample) {
      const h = predictHalfLife(data.theta, w.nCorrect, w.nWrong);
      row[w.translit] = parseFloat((Math.pow(2, -d / h) * 100).toFixed(1));
    }
    return row;
  });
  const COLORS = ['#7c5cfc','#e040fb','#34d399','#f5c842','#fb923c','#38bdf8','#f472b6','#a78bfa'];

  // ── Recall distribution ───────────────────────────────────────────────────
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${(i + 1) * 10}%`,
    count: 0,
  }));
  for (const w of memories) {
    const p = predictRecall(data.theta, w.nCorrect, w.nWrong, 1);
    const idx = Math.min(9, Math.floor(p * 10));
    buckets[idx].count++;
  }

  // ── Overall stats ─────────────────────────────────────────────────────────
  const overallAcc = stats.totalAttempts > 0
    ? (stats.totalCorrect / stats.totalAttempts * 100).toFixed(1) + '%' : '—';
  const avgHL = seen.length > 0
    ? (seen.reduce((s, w) => s + w.halfLife, 0) / seen.length).toFixed(2) + 'd' : '—';
  const mastered = seen.filter(w => w.nCorrect / w.nTotal >= 0.8).length;

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
              Learning <span className="gradient-text">Analytics</span>
            </h1>
            <p style={{ color: 'var(--muted)' }}>HLR metrics tracked across {stats.totalSessions} sessions</p>
          </div>
          <button className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)' }}
            onClick={() => { if (confirm('Reset all progress?')) resetData(); }}>
            Reset Progress
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '36px' }}>
          {[
            { label: 'Overall Accuracy', value: overallAcc, color: '#7c5cfc' },
            { label: 'Avg Half-Life',    value: avgHL,       color: '#38bdf8' },
            { label: 'Mastered (≥80%)',  value: mastered,    color: '#34d399' },
            { label: 'Words Seen',       value: seen.length, color: '#e040fb' },
            { label: 'Total Attempts',   value: stats.totalAttempts, color: '#f5c842' },
          ].map(s => (
            <div key={s.label} className="glass stat-card">
              <span className="stat-number" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {stats.totalSessions === 0 && (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            No session data yet. Complete a quiz to see analytics!
          </div>
        )}

        {/* ── Session accuracy chart ───────────────────────────────────────── */}
        {sessionData.length >= 1 && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Quiz Accuracy over Sessions</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={sessionData}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c5cfc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK.grid} />
                <XAxis dataKey="session" stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} label={{ value: 'Session', position: 'insideBottom', offset: -2, fill: DARK.text }} />
                <YAxis stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} domain={[0, 100]} tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={DARK.tooltip} formatter={(v: any) => [v + '%', 'Accuracy']} />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="4 4" label={{ value: '80% target', fill: '#34d399', fontSize: 11, position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#7c5cfc" strokeWidth={2.5} fill="url(#accGrad)" dot={{ fill: '#7c5cfc', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Half-life growth ──────────────────────────────────────────────── */}
        {sessionData.length >= 2 && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Average Half-Life Growth (Memory Improvement)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK.grid} />
                <XAxis dataKey="session" stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} />
                <YAxis stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} tickFormatter={v => v + 'd'} />
                <Tooltip contentStyle={DARK.tooltip} formatter={(v: any) => [v + ' days', 'Avg Half-Life']} />
                <Line type="monotone" dataKey="halfLife" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Category accuracy ─────────────────────────────────────────────── */}
        {categoryData.some(c => c.attempts > 0) && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Accuracy by Category</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK.grid} />
                <XAxis dataKey="category" stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 11, angle: -35, textAnchor: 'end' }} interval={0} />
                <YAxis stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} domain={[0, 100]} tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={DARK.tooltip} formatter={(v: any, _: any, p: any) => [`${v}% (n=${p.payload.attempts})`, 'Accuracy']} />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="4 4" />
                <Bar dataKey="accuracy" fill="#7c5cfc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Forgetting curves ─────────────────────────────────────────────── */}
        {sample.length > 0 && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem' }}>Ebbinghaus Forgetting Curves</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
              p(t) = 2^(−t/h) — dashed lines show each word&apos;s half-life
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={forgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK.grid} />
                <XAxis dataKey="day" stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }}
                  label={{ value: 'Days since review', position: 'insideBottom', offset: -2, fill: DARK.text }} />
                <YAxis stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} domain={[0, 100]}
                  tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={DARK.tooltip} formatter={(v: any, name: any) => [v + '%', name]} />
                <Legend wrapperStyle={{ color: DARK.text, fontSize: '0.78rem', paddingTop: '10px' }} />
                {sample.map((w, i) => (
                  <Line key={w.wordId} type="monotone" dataKey={w.translit}
                    stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Recall distribution ───────────────────────────────────────────── */}
        <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem' }}>Recall Probability Distribution</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
            Predicted recall at 1-day lag across all 200 words
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK.grid} />
              <XAxis dataKey="range" stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 11 }} />
              <YAxis stroke={DARK.text} tick={{ fill: DARK.text, fontSize: 12 }} />
              <Tooltip contentStyle={DARK.tooltip} formatter={(v: any) => [v, 'Words']} />
              <Bar dataKey="count" fill="#e040fb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Theta params */}
        <section className="glass" style={{ padding: '28px' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>Learned HLR Parameters (θ)</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Updated via SGD after every answer. h = 2^(θ_bias + θ_corr·√correct + θ_wrong·√wrong)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { name: 'θ bias',      value: data.theta.bias,      desc: 'baseline half-life offset' },
              { name: 'θ correct',   value: data.theta.sqrtCorr,  desc: 'benefit of correct answers' },
              { name: 'θ wrong',     value: data.theta.sqrtWrong, desc: 'penalty for wrong answers' },
            ].map(p => (
              <div key={p.name} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.2rem', color: p.value >= 0 ? '#34d399' : '#f87171', marginBottom: '4px' }}>
                  {p.value >= 0 ? '+' : ''}{p.value.toFixed(4)}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
