'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { predictRecall, lagDays } from '@/lib/hlr';
import { CATEGORIES } from '@/lib/arabicWords';

export default function WordListPage() {
  const { data, loaded } = useStudentData();
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy,   setSortBy]   = useState<'alpha' | 'recall' | 'halflife' | 'accuracy'>('alpha');

  if (!loaded || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--muted)' }}>Loading…</span>
    </div>
  );

  const all = Object.values(data.memories);

  const filtered = all
    .filter(w => {
      const q = search.toLowerCase();
      return (
        (category === 'all' || w.category === category) &&
        (!q || w.arabic.includes(search) || w.english.toLowerCase().includes(q) || w.translit.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'alpha')   return a.english.localeCompare(b.english);
      if (sortBy === 'recall')  return predictRecall(data.theta, a.nCorrect, a.nWrong, lagDays(a.lastSeen))
                                     - predictRecall(data.theta, b.nCorrect, b.nWrong, lagDays(b.lastSeen));
      if (sortBy === 'halflife')return b.halfLife - a.halfLife;
      if (sortBy === 'accuracy'){
        const accA = a.nTotal > 0 ? a.nCorrect / a.nTotal : 0;
        const accB = b.nTotal > 0 ? b.nCorrect / b.nTotal : 0;
        return accB - accA;
      }
      return 0;
    });

  const CATEGORY_COLORS: Record<string, string> = {
    greetings: '#7c5cfc', numbers: '#e040fb', colors: '#f5c842',
    family: '#f87171', body: '#34d399', food: '#fb923c',
    time: '#38bdf8', nature: '#4ade80', places: '#a78bfa',
    verbs: '#f472b6', adjectives: '#fbbf24', questions: '#60a5fa',
    transport: '#6ee7b7', education: '#c084fc', health: '#86efac',
    technology: '#67e8f9', animals: '#fdba74', abstract: '#e879f9',
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Arabic <span className="gradient-text">Vocabulary</span>
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '28px' }}>
          {all.length} words · {all.filter(w => w.nTotal > 0).length} practiced
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input-field"
            style={{ maxWidth: '240px', padding: '10px 14px', fontSize: '0.9rem' }}
            placeholder="Search words…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 14px', color: 'var(--text)',
              fontSize: '0.9rem', cursor: 'pointer', outline: 'none',
            }}>
            <option value="all">All categories</option>
            {CATEGORIES.sort().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 14px', color: 'var(--text)',
              fontSize: '0.9rem', cursor: 'pointer', outline: 'none',
            }}>
            <option value="alpha">Sort: A–Z</option>
            <option value="recall">Sort: Lowest recall first</option>
            <option value="halflife">Sort: Longest half-life first</option>
            <option value="accuracy">Sort: Best accuracy first</option>
          </select>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div className="glass" style={{ overflow: 'auto' }}>
          <table className="word-table">
            <thead>
              <tr>
                <th>Arabic</th>
                <th>Transliteration</th>
                <th>English</th>
                <th>Category</th>
                <th>Attempts</th>
                <th>Accuracy</th>
                <th>Half-Life</th>
                <th>Recall %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const acc  = w.nTotal > 0 ? w.nCorrect / w.nTotal : null;
                const rec  = predictRecall(data.theta, w.nCorrect, w.nWrong, lagDays(w.lastSeen));
                const catColor = CATEGORY_COLORS[w.category] ?? '#888';
                return (
                  <tr key={w.wordId}>
                    <td>
                      <span className="arabic" style={{ fontSize: '1.4rem' }}>{w.arabic}</span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontStyle: 'italic' }}>{w.translit}</td>
                    <td style={{ fontWeight: 600 }}>{w.english}</td>
                    <td>
                      <span className="badge" style={{ background: catColor + '22', color: catColor }}>
                        {w.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: w.nTotal === 0 ? 'var(--muted)' : 'var(--text)' }}>
                      {w.nTotal === 0 ? '—' : w.nTotal}
                    </td>
                    <td>
                      {acc === null ? (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      ) : (
                        <span style={{ color: acc >= 0.8 ? 'var(--green)' : acc >= 0.5 ? 'var(--gold)' : 'var(--red)', fontWeight: 600 }}>
                          {(acc * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {w.nTotal === 0 ? '—' : w.halfLife.toFixed(1) + 'd'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${rec * 100}%`, height: '100%', background: rec > 0.7 ? 'var(--green)' : rec > 0.4 ? 'var(--gold)' : 'var(--red)', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{(rec * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
