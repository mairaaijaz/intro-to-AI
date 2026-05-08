"""
hlr_model.py
Half-Life Regression (HLR) Model
Based on: "A Trainable Spaced Repetition Model for Language Learning"
Settles & Meeder, ACL 2016 (Duolingo Paper)

Key equations:
  p_recall   = 2^(-Δ/h)           ... Ebbinghaus forgetting curve
  h          = 2^(θ · x)          ... half-life as a function of features
  features x = [bias, √n_correct, √n_wrong, lexeme_feature]
  loss       = (p̂ - p)² + α·(ĥ - h̃)²
"""

import math
import json
import os
from datetime import datetime, timezone


# ── Constants ────────────────────────────────────────────────────────────────
ALPHA      = 0.01   # half-life regularisation weight
LEARN_RATE = 0.001  # SGD learning rate
MIN_HALF   = 0.5    # minimum half-life in days
MAX_HALF   = 274.0  # ~9 months ceiling
INIT_THETA = 0.1    # initial parameter value


def _pclamp(v, lo=0.0001, hi=0.9999):
    return max(lo, min(hi, v))


# ── HLR Model ────────────────────────────────────────────────────────────────
class HLRModel:
    """
    Implements the Half-Life Regression model from the Duolingo paper.

    Parameters (θ) are maintained per feature dimension:
      θ[0]  – bias term
      θ[1]  – coefficient for √(n_correct)
      θ[2]  – coefficient for √(n_wrong)
      θ[3]  – coefficient for lag-time feature (not used in prediction, stored for completeness)
    """

    def __init__(self, theta=None):
        if theta is None:
            self.theta = {
                "bias":      INIT_THETA,
                "sqrt_corr": INIT_THETA,
                "sqrt_wrong": -INIT_THETA,   # wrongs reduce half-life
            }
        else:
            self.theta = theta

    # ── Feature vector ───────────────────────────────────────────────────────
    def _features(self, n_correct: int, n_wrong: int) -> dict:
        return {
            "bias":       1.0,
            "sqrt_corr":  math.sqrt(n_correct),
            "sqrt_wrong": math.sqrt(n_wrong),
        }

    # ── Half-life prediction ─────────────────────────────────────────────────
    def predict_half_life(self, n_correct: int, n_wrong: int) -> float:
        """
        Predicted half-life in days: h = 2^(θ · x)
        """
        x = self._features(n_correct, n_wrong)
        dot = sum(self.theta[k] * x[k] for k in self.theta)
        h = 2.0 ** dot
        return max(MIN_HALF, min(MAX_HALF, h))

    # ── Recall probability ───────────────────────────────────────────────────
    def predict_recall(self, n_correct: int, n_wrong: int, lag_days: float) -> float:
        """
        Predicted recall probability: p = 2^(-lag/h)
        """
        h = self.predict_half_life(n_correct, n_wrong)
        p = 2.0 ** (-lag_days / h)
        return _pclamp(p)

    # ── Empirical half-life ──────────────────────────────────────────────────
    @staticmethod
    def empirical_half_life(p_observed: float, lag_days: float) -> float:
        """
        h̃ = -lag / log2(p_observed)   (inverted forgetting curve)
        """
        p = _pclamp(p_observed)
        h = -lag_days / math.log2(p)
        return max(MIN_HALF, min(MAX_HALF, h))

    # ── SGD update ───────────────────────────────────────────────────────────
    def update(self, n_correct: int, n_wrong: int, lag_days: float,
               recalled: bool) -> dict:
        """
        One stochastic gradient-descent step on the combined loss.

        Loss = (p̂ - p_obs)² + ALPHA*(ĥ - h̃)²

        Returns a dict of diagnostics.
        """
        p_obs   = 1.0 if recalled else 0.0
        p_hat   = self.predict_recall(n_correct, n_wrong, lag_days)
        h_hat   = self.predict_half_life(n_correct, n_wrong)
        p_obs_h = 0.9 if recalled else 0.1
        h_tilde = self.empirical_half_life(p_obs_h, max(lag_days, 1e-5))

        x = self._features(n_correct, n_wrong)
        ln2 = math.log(2.0)

        # Gradient of p-loss w.r.t. θ_k:  2(p̂-p_obs) · dp̂/dθ_k
        # dp̂/dθ_k = -ln2 * (Δ/h) * ln2 * x_k * p̂   (chain rule)
        p_grad_common = 2.0 * (p_hat - p_obs) * (-ln2 * (lag_days / h_hat) * ln2 * p_hat)

        # Gradient of h-loss w.r.t. θ_k:  2α(ĥ-h̃) · dh/dθ_k
        # dh/dθ_k = ln2 * h_hat * x_k
        h_grad_common = 2.0 * ALPHA * (h_hat - h_tilde) * (ln2 * h_hat)

        for k in self.theta:
            grad = (p_grad_common + h_grad_common) * x[k]
            self.theta[k] -= LEARN_RATE * grad

        loss = (p_hat - p_obs) ** 2 + ALPHA * (h_hat - h_tilde) ** 2
        return {
            "p_hat": round(p_hat, 4),
            "h_hat": round(h_hat, 4),
            "h_tilde": round(h_tilde, 4),
            "loss": round(loss, 6),
        }

    # ── Serialisation ────────────────────────────────────────────────────────
    def to_dict(self):
        return {"theta": self.theta}

    @classmethod
    def from_dict(cls, d):
        return cls(theta=d["theta"])


# ── Word-Level Memory Record ─────────────────────────────────────────────────
class WordMemory:
    """
    Tracks per-word learning history for a student.
    """

    def __init__(self, word_id: str, word_data: tuple):
        self.word_id    = word_id          # e.g. "مرحبا"
        self.arabic     = word_data[0]
        self.translit   = word_data[1]
        self.english    = word_data[2]
        self.category   = word_data[3]

        self.n_correct   = 0
        self.n_wrong     = 0
        self.n_total     = 0
        self.half_life   = MIN_HALF        # days
        self.recall_prob = 0.5
        self.last_seen   = None            # datetime (UTC)
        self.history     = []              # list of attempt dicts

    def lag_days(self) -> float:
        if self.last_seen is None:
            return 1.0
        delta = datetime.now(timezone.utc) - self.last_seen
        return max(delta.total_seconds() / 86400.0, 1e-5)

    def record_attempt(self, recalled: bool, model: HLRModel):
        lag = self.lag_days()
        diag = model.update(self.n_correct, self.n_wrong, lag, recalled)

        if recalled:
            self.n_correct += 1
        else:
            self.n_wrong   += 1
        self.n_total += 1
        self.last_seen   = datetime.now(timezone.utc)
        self.half_life   = model.predict_half_life(self.n_correct, self.n_wrong)
        self.recall_prob = model.predict_recall(self.n_correct, self.n_wrong, 0.0)

        self.history.append({
            "timestamp":  self.last_seen.isoformat(),
            "recalled":   recalled,
            "lag_days":   round(lag, 4),
            **diag,
        })

    @property
    def accuracy(self):
        if self.n_total == 0:
            return 0.0
        return self.n_correct / self.n_total

    def to_dict(self):
        return {
            "word_id":    self.word_id,
            "arabic":     self.arabic,
            "translit":   self.translit,
            "english":    self.english,
            "category":   self.category,
            "n_correct":  self.n_correct,
            "n_wrong":    self.n_wrong,
            "n_total":    self.n_total,
            "half_life":  self.half_life,
            "recall_prob":self.recall_prob,
            "last_seen":  self.last_seen.isoformat() if self.last_seen else None,
            "history":    self.history,
        }

    @classmethod
    def from_dict(cls, d):
        word_data = (d["arabic"], d["translit"], d["english"], d["category"])
        wm = cls(d["word_id"], word_data)
        wm.n_correct   = d["n_correct"]
        wm.n_wrong     = d["n_wrong"]
        wm.n_total     = d["n_total"]
        wm.half_life   = d["half_life"]
        wm.recall_prob = d["recall_prob"]
        wm.last_seen   = (datetime.fromisoformat(d["last_seen"])
                          if d["last_seen"] else None)
        wm.history     = d["history"]
        return wm


# ── Session / Scheduler ──────────────────────────────────────────────────────
class SpacedRepetitionSession:
    """
    Selects which words to practice based on lowest predicted recall.
    Words with lowest p_recall are most in need of review.
    """

    def __init__(self, memories: dict, model: HLRModel,
                 session_size: int = 10):
        self.memories     = memories   # word_id -> WordMemory
        self.model        = model
        self.session_size = session_size

    def select_words(self, unseen_ratio: float = 0.3):
        """
        Mix unseen (new) words and words with lowest recall.
        unseen_ratio: fraction of session to fill with new words.
        """
        unseen = [wm for wm in self.memories.values() if wm.n_total == 0]
        seen   = [wm for wm in self.memories.values() if wm.n_total  > 0]

        # Sort seen by current recall probability (lowest first = most forgotten)
        def urgency(wm):
            return self.model.predict_recall(
                wm.n_correct, wm.n_wrong, wm.lag_days()
            )
        seen.sort(key=urgency)

        n_new = max(1, int(self.session_size * unseen_ratio))
        n_rev = self.session_size - n_new

        chosen = unseen[:n_new] + seen[:n_rev]
        # If not enough words, fill remainder
        if len(chosen) < self.session_size:
            remaining = [w for w in unseen[n_new:] + seen[n_rev:]
                         if w not in chosen]
            chosen += remaining[: self.session_size - len(chosen)]

        return chosen[: self.session_size]
