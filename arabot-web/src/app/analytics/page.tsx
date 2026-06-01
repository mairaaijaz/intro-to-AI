'use client';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { predictRecall, lagDays, predictHalfLife } from '@/lib/hlr';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useState } from 'react';

const chartColors = {
  text:    '#6b7280',
  grid:    'rgba(0,0,0,0.06)',
  tooltip: { background: '#ffffff', border: 'none', borderRadius: '14px', color: '#1a1a2e', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontWeight: 700 },
};

export default function AnalyticsPage() {
  const { data, loaded, resetData } = useStudentData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [curveCategory, setCurveCategory] = useState<string>('All');

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

  // ── Category accuracy and Word details ─────────────────────────────────────
  const catMap: Record<string, {
    correct: number;
    total: number;
    words: Array<{
      id: string;
      arabic: string;
      translit: string;
      accuracy: number;
      halfLife: number;
      attempts: number;
      nTotal: number;
    }>
  }> = {};
  for (const w of memories) {
    if (!catMap[w.category]) catMap[w.category] = { correct: 0, total: 0, words: [] };
    catMap[w.category].correct += w.nCorrect;
    catMap[w.category].total   += w.nTotal;
    catMap[w.category].words.push({
      id: w.wordId,
      arabic: w.arabic,
      translit: w.translit,
      accuracy: w.nTotal > 0 ? parseFloat((w.nCorrect / w.nTotal * 100).toFixed(1)) : 0,
      halfLife: parseFloat(w.halfLife.toFixed(1)),
      attempts: w.nTotal,
      nTotal: w.nTotal,
    });
  }
  const categoryData = Object.entries(catMap)
    .map(([cat, v]) => ({
      category: cat,
      accuracy: v.total > 0 ? parseFloat((v.correct / v.total * 100).toFixed(1)) : 0,
      attempts: v.total,
      words: v.words.sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts);

  // ── Forgetting curves (up to 8 most recently reviewed words) ────────────────
  const curveCategories = ['All', ...Array.from(new Set(seen.map(w => w.category)))].sort();
  const curveSeen = curveCategory === 'All' ? seen : seen.filter(w => w.category === curveCategory);
  const sample = [...curveSeen]
    .sort((a, b) => new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime())
    .slice(0, 8);
  const forgetData = Array.from({ length: 31 }, (_, d) => {
    const row: Record<string, number | string> = { day: d };
    for (const w of sample) {
      const h = predictHalfLife(data.theta, w.nCorrect, w.nWrong);
      row[w.translit] = parseFloat((Math.pow(2, -d / h) * 100).toFixed(1));
    }
    return row;
  });
  const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff9f43','#c084fc','#f472b6','#22c55e'];

  // ── Recall distribution ───────────────────────────────────────────────────
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${(i + 1) * 10}%`,
    count: 0,
  }));
  for (const w of seen) {
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
            { label: 'Overall Accuracy', value: overallAcc, color: '#ff6b6b' },
            { label: 'Avg Half-Life',    value: avgHL,       color: '#4d96ff' },
            { label: 'Mastered (≥80%)',  value: mastered,    color: '#6bcb77' },
            { label: 'Words Seen',       value: seen.length, color: '#c084fc' },
            { label: 'Total Attempts',   value: stats.totalAttempts, color: '#f5a623' },
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="session" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} label={{ value: 'Session', position: 'insideBottom', offset: -2, fill: chartColors.text }} />
                <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} domain={[0, 100]} tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={chartColors.tooltip} formatter={(v: any) => [v + '%', 'Accuracy']} />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="4 4" label={{ value: '80% target', fill: '#34d399', fontSize: 11, position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#9d174d" strokeWidth={2.5} fill="url(#accGrad)" dot={{ fill: '#9d174d', r: 4 }} />
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="session" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} />
                <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={v => v + 'd'} />
                <Tooltip contentStyle={chartColors.tooltip} formatter={(v: any) => [v + ' days', 'Avg Half-Life']} />
                <Line type="monotone" dataKey="halfLife" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Category accuracy ─────────────────────────────────────────────── */}
        {categoryData.some(c => c.attempts > 0) && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Accuracy by Category</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Click a bar to see word details</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="category" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 11, angle: -35, textAnchor: 'end' }} interval={0} />
                <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} domain={[0, 100]} tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={chartColors.tooltip} formatter={(v: any, _: any, p: any) => [`${v}% (n=${p.payload.attempts})`, 'Accuracy']} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="4 4" />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} onClick={(data: any) => setSelectedCategory(data?.payload?.category || data?.category)} cursor="pointer">
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.category === selectedCategory ? '#ff6b6b' : '#f97316'} 
                      opacity={selectedCategory && entry.category !== selectedCategory ? 0.6 : 1}
                      stroke={entry.category === selectedCategory ? '#1a1a2e' : 'none'}
                      strokeWidth={entry.category === selectedCategory ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Word details shown ONLY when a category is selected */}
            {selectedCategory && (
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${chartColors.grid}` }}>
                {categoryData.filter(c => c.category === selectedCategory).map(c => (
                  <div key={c.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                        <span style={{ color: '#ff6b6b' }}>{c.category}</span> Details
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span><span style={{ color: 'var(--muted)' }}>Accuracy:</span> {c.accuracy}%</span>
                        <span><span style={{ color: 'var(--muted)' }}>Attempts:</span> {c.attempts}</span>
                        <button 
                          onClick={() => setSelectedCategory(null)} 
                          style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: `1px solid ${chartColors.grid}`, cursor: 'pointer' }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto', border: `1px solid ${chartColors.grid}`, borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: `1px solid ${chartColors.grid}` }}>
                            <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Arabic</th>
                            <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Transliteration</th>
                            <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--muted)' }}>Accuracy</th>
                            <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--muted)' }}>Half-life</th>
                            <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--muted)' }}>Attempts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.words.map(w => (
                            <tr key={w.id} style={{ borderBottom: `1px solid ${chartColors.grid}` }}>
                              <td style={{ padding: '12px 20px', fontSize: '1.1rem', fontFamily: 'var(--font-arabic)' }}>{w.arabic}</td>
                              <td style={{ padding: '12px 20px', color: 'var(--text)' }}>{w.translit}</td>
                              <td style={{ padding: '12px 20px', textAlign: 'right', color: w.nTotal > 0 ? (w.accuracy >= 80 ? '#34d399' : w.accuracy < 50 ? '#f87171' : 'var(--text)') : 'var(--muted)' }}>
                                {w.nTotal > 0 ? `${w.accuracy}%` : '—'}
                              </td>
                              <td style={{ padding: '12px 20px', textAlign: 'right', color: w.nTotal > 0 ? '#38bdf8' : 'var(--muted)' }}>
                                {w.nTotal > 0 ? `${w.halfLife.toFixed(1)}d` : '—'}
                              </td>
                              <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--muted)' }}>{w.attempts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Forgetting curves ─────────────────────────────────────────────── */}
        {sample.length > 0 && (
          <section className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem' }}>Ebbinghaus Forgetting Curves</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
                  Showing up to 8 most recently reviewed words. p(t) = 2^(−t/h)
                </p>
              </div>
              <select
                value={curveCategory}
                onChange={(e) => setCurveCategory(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: `1px solid ${chartColors.grid}`, padding: '6px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {curveCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={forgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="day" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }}
                  label={{ value: 'Days since review', position: 'insideBottom', offset: -2, fill: chartColors.text }} />
                <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} domain={[0, 100]}
                  tickFormatter={v => v + '%'} />
                <Tooltip contentStyle={chartColors.tooltip} formatter={(v: any, name: any) => [v + '%', name]} />
                <Legend wrapperStyle={{ color: chartColors.text, fontSize: '0.78rem', paddingTop: '10px' }} />
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
            Predicted recall at 1-day lag across {seen.length} seen words
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="range" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 11 }} />
              <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartColors.tooltip} formatter={(v: any) => [v, 'Words']} />
              <Bar dataKey="count" fill="#9333ea" radius={[6, 6, 0, 0]} />
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
