'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { selectWords } from '@/lib/hlr';
import { WordMemory } from '@/lib/hlr';
import { useSettings } from '@/hooks/useSettings';
import { formatArabic } from '@/lib/arabicWords';
import { LEVELS, Level } from '@/lib/levels';

type Phase = 'setup' | 'question' | 'feedback' | 'results';

interface SessionResult {
  word: WordMemory;
  recalled: boolean;
  userAnswer: string;
}

const PRAISE_CORRECT = ['Amazing! 🌟', 'You got it! 🎉', 'Fantastic! 🚀', 'Superstar! ⭐', 'Brilliant! 🧠', 'Wow! 👏', 'Keep it up! 💪', 'Excellent! 🥇'];
const PRAISE_WRONG   = ['Almost there! 🌈', 'Try again soon! 💙', 'Don\'t give up! 🌟', 'You\'re learning! 🌱', 'Next time! 💪'];
const CONFETTI_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff9f43','#c084fc','#f472b6'];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function expandContractions(str: string): string {
  return str
    .replace(/\byou're\b/g, 'you are')
    .replace(/\byou\s+re\b/g, 'you are')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bwon't\b/g, 'will not');
}

function getCleanWords(str: string): string[] {
  const expanded = expandContractions(str.toLowerCase());
  const words = expanded
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const filtered = words.filter(w => w !== 'to' && w !== 'the' && w !== 'a' && w !== 'an');
  return filtered.length > 0 ? filtered : words;
}

function getEditDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyMatch(user: string, target: string): boolean {
  const userWords = getCleanWords(user);
  const targetWords = getCleanWords(target);
  
  if (userWords.length === 0 || targetWords.length === 0) return false;

  if (userWords.join(' ') === targetWords.join(' ')) return true;

  let matchCount = 0;
  for (const tw of targetWords) {
    if (userWords.includes(tw)) {
      matchCount++;
    }
  }

  const coverage = matchCount / targetWords.length;
  
  if (targetWords.length === 1) {
    const tw = targetWords[0];
    const uw = userWords[0];
    if (tw === uw) return true;
    if (tw.length >= 4 && getEditDistance(tw, uw) <= 1) return true;
    return false;
  }
  
  if (targetWords.length === 2) {
    return matchCount === 2;
  }
  
  return coverage >= 0.65;
}

function useLocalLevelProgress() {
  const KEY = 'arabot_level_progress';
  const [maxUnlocked, setMaxUnlocked] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setMaxUnlocked(JSON.parse(saved).maxUnlocked ?? 1);
    } catch { /* ignore */ }
  }, []);

  function unlockNext(current: number) {
    const next = Math.min(current + 1, 20);
    setMaxUnlocked(prev => {
      const updated = Math.max(prev, next);
      localStorage.setItem(KEY, JSON.stringify({ maxUnlocked: updated }));
      return updated;
    });
  }

  return { maxUnlocked, unlockNext };
}

export default function QuizPage() {
  const { data, loaded, recordAttempt, finishSession } = useStudentData();
  const { showDiacritics } = useSettings();
  const { maxUnlocked, unlockNext } = useLocalLevelProgress();

  const [phase,       setPhase]       = useState<Phase>('setup');
  const [chosenLevel, setChosenLevel] = useState<Level | null>(null);
  const [words,       setWords]       = useState<WordMemory[]>([]);
  const [idx,         setIdx]         = useState(0);
  const [answer,      setAnswer]      = useState('');
  const [results,     setResults]     = useState<SessionResult[]>([]);
  const [lastResult,  setLastResult]  = useState<{ recalled: boolean; correct: string; praise: string } | null>(null);
  const [levelUp,     setLevelUp]     = useState(false);
  const [confetti,    setConfetti]    = useState<{ id: number; color: string; x: number; delay: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'question') inputRef.current?.focus();
  }, [phase, idx]);

  function spawnConfetti() {
    const pieces = Array.from({ length: 22 }, (_, i) => ({
      id: i, color: randomFrom(CONFETTI_COLORS),
      x: Math.random() * 100, delay: Math.random() * 0.6,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1800);
  }

  function startLevel(level: Level) {
    if (!data) return;
    const pool = Object.fromEntries(
      Object.entries(data.memories).filter(([_, w]) => level.categories.includes(w.category))
    );
    const poolSize = Object.keys(pool).length;
    if (poolSize === 0) { alert('No words found for this level yet!'); return; }
    const selected = selectWords(pool, data.theta, Math.min(level.sessionSize, poolSize), 0.3);
    setChosenLevel(level);
    setWords(selected);
    setIdx(0);
    setResults([]);
    setAnswer('');
    setLastResult(null);
    setLevelUp(false);
    setPhase('question');
  }

  function submitAnswer() {
    if (!data || !words[idx]) return;
    const wm = words[idx];
    const correctAnswers = wm.english.split(/[\/,]/).map(s => s.trim());
    const recalled = correctAnswers.some(a => isFuzzyMatch(answer, a));

    recordAttempt(wm.wordId, recalled);
    setResults(prev => [...prev, { word: wm, recalled, userAnswer: answer.trim() }]);
    setLastResult({
      recalled,
      correct: wm.english,
      praise: recalled ? randomFrom(PRAISE_CORRECT) : randomFrom(PRAISE_WRONG),
    });
    if (recalled) spawnConfetti();
    setPhase('feedback');
  }

  function nextWord() {
    if (idx + 1 >= words.length) {
      const correctCount = results.filter(r => r.recalled).length + (lastResult?.recalled ? 1 : 0);
      finishSession(results.filter(r => r.recalled).length, results.length);
      const acc = correctCount / words.length;
      if (acc >= 0.8 && chosenLevel) {
        setLevelUp(true);
        unlockNext(chosenLevel.id);
        spawnConfetti();
      }
      setPhase('results');
    } else {
      setIdx(i => i + 1);
      setAnswer('');
      setLastResult(null);
      setPhase('question');
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (phase === 'question') submitAnswer();
      else if (phase === 'feedback') nextWord();
    }
  }

  const current        = words[idx];
  const sessionCorrect = results.filter(r => r.recalled).length;

  if (!loaded || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>Loading… 🌟</span>
    </div>
  );

  // ── TIER labels for the grid ─────────────────────────────────────────────
  const tiers = [
    { label: '⭐ Beginner', range: [1, 4]  },
    { label: '🌍 My World', range: [5, 8]  },
    { label: '🏘️ Community', range: [9, 12] },
    { label: '📚 Learning', range: [13, 16] },
    { label: '🏆 Advanced', range: [17, 20] },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* Confetti overlay */}
      {confetti.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
          {confetti.map(c => (
            <div key={c.id} className="confetti-piece" style={{
              background: c.color, left: `${c.x}%`, top: 0,
              animationDelay: `${c.delay}s`,
              borderRadius: c.id % 3 === 0 ? '50%' : '2px',
              width: 8 + (c.id % 5) * 2, height: 8 + (c.id % 4) * 2,
            }} />
          ))}
        </div>
      )}

      <Navbar />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px' }}>

        {/* ── SETUP: Level Select ── */}
        {phase === 'setup' && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '8px' }} className="float">🌟</div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text)' }}>
                Choose your <span className="gradient-text">Level!</span>
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
                Complete a level with ⭐ 80%+ to unlock the next one!
              </p>
            </div>

            {tiers.map(tier => (
              <div key={tier.label} style={{ marginBottom: '28px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '12px', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                  {tier.label}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {LEVELS.filter(l => l.id >= tier.range[0] && l.id <= tier.range[1]).map(level => {
                    const isLocked    = level.id > maxUnlocked;
                    const isCompleted = level.id < maxUnlocked;
                    const isCurrent   = level.id === maxUnlocked;
                    return (
                      <div
                        key={level.id}
                        className={`level-card ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                        style={{ background: level.color }}
                        onClick={() => !isLocked && startLevel(level)}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '4px' }}>
                          {isLocked ? '🔒' : isCompleted ? '✅' : level.emoji}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '2px' }}>
                          Lvl {level.id}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#555' }}>
                          {level.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '3px', lineHeight: 1.3 }}>
                          {level.sessionSize} words
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QUESTION ── */}
        {phase === 'question' && current && (
          <div className="fade-in" onKeyDown={handleKey}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                padding: '6px 14px', borderRadius: '30px', fontWeight: 800, fontSize: '0.82rem',
                background: chosenLevel?.color || '#ffb3ba', color: '#333',
              }}>
                {chosenLevel?.emoji} {chosenLevel?.name} — Level {chosenLevel?.id}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                ✅ {sessionCorrect} / {idx + 1}
              </span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '28px' }}>
              <div className="progress-fill" style={{ width: `${(idx / words.length) * 100}%` }} />
            </div>

            {/* Word card */}
            <div className="glass" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: '28px', background: 'rgba(255,255,255,0.88)' }}>
              <div style={{
                display: 'inline-block', padding: '5px 14px', borderRadius: '30px', marginBottom: '20px',
                background: '#fff3e0', color: '#e67e22', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase',
              }}>
                📂 {current.category}
              </div>
              <div className="arabic" style={{ fontSize: '5rem', marginBottom: '10px', lineHeight: 1, color: '#1a1a2e' }}>
                {formatArabic(current.arabic, showDiacritics)}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: '6px', fontWeight: 600 }}>
                {current.translit}
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                <span>🔁 {current.nTotal} attempts</span>
                <span>⏱ {current.halfLife.toFixed(1)}d half-life</span>
                <span>🎯 {current.nTotal > 0 ? ((current.nCorrect / current.nTotal) * 100).toFixed(0) + '%' : '—'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>
                ✏️ What does this mean in English?
              </label>
              <input
                ref={inputRef}
                className="input-field"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here…"
                autoComplete="off"
              />
            </div>
            <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}
              onClick={submitAnswer} disabled={answer.trim().length === 0}>
              Check Answer ✔
            </button>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {phase === 'feedback' && lastResult && current && (
          <div className="fade-in" onKeyDown={handleKey} tabIndex={0} style={{ outline: 'none' }}>
            <div className="progress-bar" style={{ marginBottom: '28px' }}>
              <div className="progress-fill" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
            </div>

            <div className="glass" style={{
              padding: '48px 32px', textAlign: 'center', marginBottom: '24px',
              background: lastResult.recalled ? 'rgba(220,252,231,0.9)' : 'rgba(255,235,235,0.9)',
              border: `3px solid ${lastResult.recalled ? '#86efac' : '#fca5a5'}`,
            }}>
              <span className="celebrate-emoji">{lastResult.recalled ? '🌟' : '💔'}</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: lastResult.recalled ? '#15803d' : '#dc2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                {lastResult.recalled ? 'Correct!' : 'Oops! Incorrect'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', marginTop: '4px',
                color: lastResult.recalled ? '#15803d' : '#dc2626' }}>
                {lastResult.praise}
              </div>
              <div className="arabic" style={{ fontSize: '4rem', margin: '16px 0 8px', color: '#1a1a2e' }}>
                {formatArabic(current.arabic, showDiacritics)}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>
                = {lastResult.correct}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>{current.translit}</div>
              <div style={{ marginTop: '16px', padding: '10px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                Memory updated! Half-life: <strong style={{ color: '#1a1a2e' }}>{current.halfLife.toFixed(2)}d</strong>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }} onClick={nextWord}>
              {idx + 1 >= words.length ? 'See Results 🏁' : 'Next Word →'}
            </button>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
              Press Enter to continue
            </p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && (
          <div className="fade-in">
            {levelUp ? (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '5rem' }} className="bounce-in">🏆</span>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px', marginTop: '12px' }}>
                  Level <span className="gradient-text">Complete!</span>
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: 600 }}>
                  You unlocked Level {Math.min((chosenLevel?.id ?? 0) + 1, 20)}! 🎉
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>
                  Session <span className="gradient-text">Done!</span>
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                  You need 80%+ to unlock the next level 💪
                </p>
              </div>
            )}

            <div className="glass" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px', background: 'rgba(255,255,255,0.88)' }}>
              {(() => {
                const totalCorrect = results.filter(r => r.recalled).length;
                const pct = results.length > 0 ? (totalCorrect / results.length * 100).toFixed(0) : '0';
                const num = Number(pct);
                return (
                  <>
                    <div style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '4px',
                      color: num >= 80 ? '#15803d' : num >= 50 ? '#d97706' : '#dc2626' }}>
                      {pct}%
                    </div>
                    <div style={{ color: 'var(--muted)', marginBottom: '24px', fontWeight: 600 }}>
                      {totalCorrect} / {results.length} correct
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {chosenLevel && (
                        <button className="btn-primary" onClick={() => startLevel(chosenLevel)}>
                          Try Again 🔄
                        </button>
                      )}
                      <button className="btn-ghost" onClick={() => setPhase('setup')}>
                        Choose Level 📋
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Results list */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {results.map((r, i) => (
                <div key={i} className="glass" style={{
                  padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: r.recalled ? 'rgba(220,252,231,0.7)' : 'rgba(255,235,235,0.7)',
                  border: `1.5px solid ${r.recalled ? '#86efac' : '#fca5a5'}`,
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.3rem' }}>{r.recalled ? '✅' : '❌'}</span>
                    <span className="arabic" style={{ fontSize: '1.5rem', color: '#1a1a2e' }}>{formatArabic(r.word.arabic, showDiacritics)}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>{r.word.english}</span>
                  </div>
                  {!r.recalled && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                      you: {r.userAnswer || '(blank)'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
