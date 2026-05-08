/**
 * hlr.ts — Half-Life Regression model (JS port of Settles & Meeder, ACL 2016)
 *
 * Recall probability:  p = 2^(-Δ/h)
 * Half-life:           h = 2^(θ · x)
 * Features x:         [1, √n_correct, √n_wrong]
 * Loss:                (p̂ - p_obs)² + α(ĥ - h̃)²
 * Update:              SGD on θ
 */

export interface HLRTheta {
  bias: number;
  sqrtCorr: number;
  sqrtWrong: number;
}

export interface WordMemory {
  wordId: string;        // arabic string as key
  arabic: string;
  translit: string;
  english: string;
  category: string;
  nCorrect: number;
  nWrong: number;
  nTotal: number;
  halfLife: number;      // days
  recallProb: number;
  lastSeen: string | null; // ISO timestamp
  history: AttemptRecord[];
}

export interface AttemptRecord {
  timestamp: string;
  recalled: boolean;
  lagDays: number;
  pHat: number;
  hHat: number;
  loss: number;
}

export interface StudentData {
  theta: HLRTheta;
  memories: Record<string, WordMemory>;
  stats: StudentStats;
}

export interface StudentStats {
  totalSessions: number;
  totalAttempts: number;
  totalCorrect: number;
  sessionScores: number[];
  halfLifeHistory: number[];
}

// ── Constants ────────────────────────────────────────────────────────────────
const ALPHA      = 0.01;
const LEARN_RATE = 0.001;
const MIN_HALF   = 0.5;
const MAX_HALF   = 274.0;
const INIT_THETA = 0.1;
const LN2        = Math.LN2;

function clamp(v: number, lo = 0.0001, hi = 0.9999) {
  return Math.max(lo, Math.min(hi, v));
}

function clampHL(h: number) {
  return Math.max(MIN_HALF, Math.min(MAX_HALF, h));
}

// ── Feature dot product ───────────────────────────────────────────────────────
function dot(theta: HLRTheta, nCorrect: number, nWrong: number): number {
  return theta.bias * 1.0
       + theta.sqrtCorr  * Math.sqrt(nCorrect)
       + theta.sqrtWrong * Math.sqrt(nWrong);
}

// ── Predictions ───────────────────────────────────────────────────────────────
export function predictHalfLife(theta: HLRTheta, nCorrect: number, nWrong: number): number {
  return clampHL(Math.pow(2, dot(theta, nCorrect, nWrong)));
}

export function predictRecall(theta: HLRTheta, nCorrect: number, nWrong: number, lagDays: number): number {
  const h = predictHalfLife(theta, nCorrect, nWrong);
  return clamp(Math.pow(2, -lagDays / h));
}

function empiricalHalfLife(pObs: number, lagDays: number): number {
  return clampHL(-lagDays / Math.log2(clamp(pObs)));
}

// ── SGD update ─────────────────────────────────────────────────────────────
export function sgdUpdate(
  theta: HLRTheta,
  nCorrect: number,
  nWrong: number,
  lagDays: number,
  recalled: boolean
): { newTheta: HLRTheta; pHat: number; hHat: number; loss: number } {
  const pObs  = recalled ? 1.0 : 0.0;
  const pHat  = predictRecall(theta, nCorrect, nWrong, lagDays);
  const hHat  = predictHalfLife(theta, nCorrect, nWrong);
  const pObsForH = recalled ? 0.9 : 0.1;
  const hTilde= empiricalHalfLife(pObsForH, Math.max(lagDays, 1e-5));

  // Gradient components
  const pGradCommon = 2 * (pHat - pObs) * (-LN2 * (lagDays / hHat) * LN2 * pHat);
  const hGradCommon = 2 * ALPHA * (hHat - hTilde) * (LN2 * hHat);
  const total = pGradCommon + hGradCommon;

  const features = { bias: 1.0, sqrtCorr: Math.sqrt(nCorrect), sqrtWrong: Math.sqrt(nWrong) };

  const newTheta: HLRTheta = {
    bias:      theta.bias      - LEARN_RATE * total * features.bias,
    sqrtCorr:  theta.sqrtCorr  - LEARN_RATE * total * features.sqrtCorr,
    sqrtWrong: theta.sqrtWrong - LEARN_RATE * total * features.sqrtWrong,
  };

  const loss = Math.pow(pHat - pObs, 2) + ALPHA * Math.pow(hHat - hTilde, 2);
  return { newTheta, pHat, hHat, loss };
}

// ── Lag computation ───────────────────────────────────────────────────────────
export function lagDays(lastSeen: string | null): number {
  if (!lastSeen) return 1.0;
  const diff = (Date.now() - new Date(lastSeen).getTime()) / 86400000;
  return Math.max(diff, 1e-5);
}

// ── Default / fresh data ──────────────────────────────────────────────────────
export function freshTheta(): HLRTheta {
  return { bias: INIT_THETA, sqrtCorr: INIT_THETA, sqrtWrong: -INIT_THETA };
}

export function freshStats(): StudentStats {
  return { totalSessions: 0, totalAttempts: 0, totalCorrect: 0, sessionScores: [], halfLifeHistory: [] };
}

// ── Spaced-repetition word selection ─────────────────────────────────────────
export function selectWords(
  memories: Record<string, WordMemory>,
  theta: HLRTheta,
  sessionSize = 10,
  unseenRatio = 0.3
): WordMemory[] {
  const all    = Object.values(memories);
  const unseen = all.filter(w => w.nTotal === 0);
  const seen   = all.filter(w => w.nTotal  > 0);

  // Sort seen by urgency (lowest recall first)
  seen.sort((a, b) =>
    predictRecall(theta, a.nCorrect, a.nWrong, lagDays(a.lastSeen)) -
    predictRecall(theta, b.nCorrect, b.nWrong, lagDays(b.lastSeen))
  );

  const nNew = Math.max(1, Math.round(sessionSize * unseenRatio));
  const nRev = sessionSize - nNew;

  const chosen = [...unseen.slice(0, nNew), ...seen.slice(0, nRev)];
  if (chosen.length < sessionSize) {
    const rest = [...unseen.slice(nNew), ...seen.slice(nRev)].filter(w => !chosen.includes(w));
    chosen.push(...rest.slice(0, sessionSize - chosen.length));
  }
  return chosen.slice(0, sessionSize);
}
