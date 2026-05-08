'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import { selectWords } from '@/lib/hlr';
import { WordMemory } from '@/lib/hlr';
import { useSettings } from '@/hooks/useSettings';
import { formatArabic } from '@/lib/arabicWords';

type Phase = 'setup' | 'question' | 'feedback' | 'results';

interface SessionResult {
  word: WordMemory;
  recalled: boolean;
  userAnswer: string;
}

export default function QuizPage() {
  const { data, loaded, recordAttempt, finishSession } = useStudentData();
  const { showDiacritics } = useSettings();

  const [phase,       setPhase]       = useState<Phase>('setup');
  const [sessionSize, setSessionSize] = useState(10);
  const [words,       setWords]       = useState<WordMemory[]>([]);
  const [idx,         setIdx]         = useState(0);
  const [answer,      setAnswer]      = useState('');
  const [results,     setResults]     = useState<SessionResult[]>([]);
  const [lastResult,  setLastResult]  = useState<{ recalled: boolean; correct: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'question') inputRef.current?.focus();
  }, [phase, idx]);

  function startSession() {
    if (!data) return;
    const selected = selectWords(data.memories, data.theta, sessionSize, 0.3);
    setWords(selected);
    setIdx(0);
    setResults([]);
    setAnswer('');
    setLastResult(null);
    setPhase('question');
  }

  function submitAnswer() {
    if (!data || !words[idx]) return;
    const wm = words[idx];
    const userTrimmed = answer.trim().toLowerCase();
    const correctAnswers = wm.english.toLowerCase().split(/[\/,]/).map(s => s.trim());
    const recalled = correctAnswers.some(a => {
      if (userTrimmed === a) return true;
      // Allow substring matches only if the user typed most of the word (prevent single letter bypass)
      if (userTrimmed.length >= Math.min(3, a.length - 1)) {
        return userTrimmed.includes(a) || a.includes(userTrimmed);
      }
      return false;
    }) && userTrimmed.length > 0;

    recordAttempt(wm.wordId, recalled);
    setResults(prev => [...prev, { word: wm, recalled, userAnswer: answer.trim() }]);
    setLastResult({ recalled, correct: wm.english });
    setPhase('feedback');
  }

  function nextWord() {
    if (idx + 1 >= words.length) {
      const correct = results.filter(r => r.recalled).length + (lastResult?.recalled ? 0 : 0);
      // Count from results already recorded
      finishSession(
        results.filter(r => r.recalled).length,
        results.length
      );
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

  const current    = words[idx];
  const sessionCorrect = results.filter(r => r.recalled).length;

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (!loaded || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--muted)' }}>Loading…</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>

        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <div className="fade-in">
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
              Ready to <span className="gradient-text">Quiz?</span>
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: '36px' }}>
              Words are selected using HLR — the most-forgotten words come first.
            </p>

            <div className="glass" style={{ padding: '32px', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '16px' }}>
                Session size
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[5, 10, 15, 20].map(n => (
                  <button key={n}
                    onClick={() => setSessionSize(n)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: `2px solid ${sessionSize === n ? 'var(--accent)' : 'var(--border)'}`,
                      background: sessionSize === n ? 'rgba(124,92,252,0.15)' : 'transparent',
                      color: sessionSize === n ? 'var(--text)' : 'var(--muted)',
                      fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {n} words
                  </button>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '20px', marginBottom: '32px', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--text)' }}>HLR Scheduling:</strong>{' '}
              30% new words + 70% review words with lowest predicted recall probability p = 2^(-Δ/h)
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}
              onClick={startSession}>
              Start Session →
            </button>
          </div>
        )}

        {/* ── QUESTION ── */}
        {phase === 'question' && current && (
          <div className="fade-in" onKeyDown={handleKey}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {idx + 1} / {words.length}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                ✅ {sessionCorrect} correct
              </span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '32px' }}>
              <div className="progress-fill" style={{ width: `${((idx) / words.length) * 100}%` }} />
            </div>

            {/* Word card */}
            <div className="glass" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: 'rgba(124,92,252,0.15)', color: 'var(--accent)',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '24px',
              }}>
                {current.category}
              </div>

              <div className="arabic" style={{ fontSize: '4rem', marginBottom: '12px', lineHeight: 1 }}>
                {formatArabic(current.arabic, showDiacritics)}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '8px' }}>
                {current.translit}
              </div>

              {/* HLR info */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                <span>attempts: {current.nTotal}</span>
                <span>half-life: {current.halfLife.toFixed(1)}d</span>
                <span>accuracy: {current.nTotal > 0 ? ((current.nCorrect / current.nTotal) * 100).toFixed(0) + '%' : '—'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                Type the English meaning:
              </label>
              <input
                ref={inputRef}
                className="input-field"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Your answer…"
                autoComplete="off"
              />
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
              onClick={submitAnswer} disabled={answer.trim().length === 0}>
              Check Answer →
            </button>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {phase === 'feedback' && lastResult && current && (
          <div className="fade-in" onKeyDown={handleKey} tabIndex={0} style={{ outline: 'none' }}>
            <div className="progress-bar" style={{ marginBottom: '32px' }}>
              <div className="progress-fill" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
            </div>

            <div className="glass" style={{
              padding: '48px 32px', textAlign: 'center', marginBottom: '24px',
              borderColor: lastResult.recalled ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {lastResult.recalled ? '✅' : '❌'}
              </div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px',
                color: lastResult.recalled ? 'var(--green)' : 'var(--red)',
              }}>
                {lastResult.recalled ? 'Correct!' : 'Incorrect'}
              </div>

              <div className="arabic" style={{ fontSize: '3rem', margin: '16px 0 8px' }}>
                {formatArabic(current.arabic, showDiacritics)}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                = {lastResult.correct}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{current.translit}</div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                New half-life: <strong style={{ color: 'var(--text)' }}>{current.halfLife.toFixed(2)}d</strong>
                {' '}— Model updated via SGD
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
              onClick={nextWord}>
              {idx + 1 >= words.length ? 'See Results →' : 'Next Word →'}
            </button>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '10px' }}>
              Press Enter to continue
            </p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && (
          <div className="fade-in">
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
              Session <span className="gradient-text">Complete!</span>
            </h1>

            <div className="glass" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '4px' }}>
                <span style={{ color: sessionCorrect / results.length >= 0.8 ? 'var(--green)' : sessionCorrect / results.length >= 0.5 ? 'var(--gold)' : 'var(--red)' }}>
                  {(sessionCorrect / results.length * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                {sessionCorrect} / {results.length} correct
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => setPhase('setup')}>
                  New Session →
                </button>
              </div>
            </div>

            {/* Results list */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {results.map((r, i) => (
                <div key={i} className="glass" style={{
                  padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderColor: r.recalled ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)',
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span>{r.recalled ? '✅' : '❌'}</span>
                    <span className="arabic" style={{ fontSize: '1.4rem' }}>{formatArabic(r.word.arabic, showDiacritics)}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.word.english}</span>
                  </div>
                  {!r.recalled && (
                    <span style={{ color: 'var(--red)', fontSize: '0.8rem' }}>
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
