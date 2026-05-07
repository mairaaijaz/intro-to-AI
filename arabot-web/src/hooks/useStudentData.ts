'use client';
/**
 * useStudentData — React hook for persisting HLR student data in localStorage.
 */
import { useState, useEffect, useCallback } from 'react';
import { ARABIC_VOCABULARY } from '@/lib/arabicWords';
import {
  StudentData, WordMemory, HLRTheta,
  freshTheta, freshStats,
  predictHalfLife, predictRecall, sgdUpdate, lagDays
} from '@/lib/hlr';

const STORAGE_KEY = 'arabot_hlr_v1';

function buildFreshData(): StudentData {
  const theta  = freshTheta();
  const memories: Record<string, WordMemory> = {};
  for (const w of ARABIC_VOCABULARY) {
    memories[w.arabic] = {
      wordId: w.arabic,
      arabic: w.arabic,
      translit: w.translit,
      english: w.english,
      category: w.category,
      nCorrect: 0,
      nWrong:   0,
      nTotal:   0,
      halfLife:   0.5,
      recallProb: 0.5,
      lastSeen: null,
      history:  [],
    };
  }
  return { theta, memories, stats: freshStats() };
}

export function useStudentData() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw) as StudentData);
      } else {
        setData(buildFreshData());
      }
    } catch {
      setData(buildFreshData());
    }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (data && loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loaded]);

  // Record an attempt result
  const recordAttempt = useCallback((wordId: string, recalled: boolean) => {
    setData(prev => {
      if (!prev) return prev;
      const wm    = prev.memories[wordId];
      if (!wm) return prev;

      const lag   = lagDays(wm.lastSeen);
      const { newTheta, pHat, hHat, loss } = sgdUpdate(
        prev.theta, wm.nCorrect, wm.nWrong, lag, recalled
      );

      const newNCorrect = wm.nCorrect + (recalled ? 1 : 0);
      const newNWrong   = wm.nWrong   + (recalled ? 0 : 1);
      const newHL  = predictHalfLife(newTheta, newNCorrect, newNWrong);
      const newRP  = predictRecall(newTheta, newNCorrect, newNWrong, 0);

      const attempt = {
        timestamp: new Date().toISOString(),
        recalled,
        lagDays: lag,
        pHat,
        hHat,
        loss,
      };

      const updatedMemory: WordMemory = {
        ...wm,
        nCorrect:   newNCorrect,
        nWrong:     newNWrong,
        nTotal:     wm.nTotal + 1,
        halfLife:   newHL,
        recallProb: newRP,
        lastSeen:   new Date().toISOString(),
        history:    [...wm.history, attempt],
      };

      return {
        theta: newTheta,
        memories: { ...prev.memories, [wordId]: updatedMemory },
        stats: prev.stats, // updated per-session via finishSession
      };
    });
  }, []);

  // Finish a session and record aggregate stats
  const finishSession = useCallback((correct: number, total: number) => {
    setData(prev => {
      if (!prev) return prev;
      const accuracy = total > 0 ? correct / total : 0;
      const avgHL    = Object.values(prev.memories).reduce((s, w) => s + w.halfLife, 0)
                     / Object.values(prev.memories).length;
      return {
        ...prev,
        stats: {
          totalSessions:   prev.stats.totalSessions + 1,
          totalAttempts:   prev.stats.totalAttempts + total,
          totalCorrect:    prev.stats.totalCorrect  + correct,
          sessionScores:   [...prev.stats.sessionScores, parseFloat(accuracy.toFixed(4))],
          halfLifeHistory: [...prev.stats.halfLifeHistory, parseFloat(avgHL.toFixed(4))],
        }
      };
    });
  }, []);

  const resetData = useCallback(() => {
    const fresh = buildFreshData();
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }, []);

  return { data, loaded, recordAttempt, finishSession, resetData };
}
