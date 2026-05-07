"""
simulate_sessions.py
Simulates multiple learning sessions to generate rich analytics data.
Run: python simulate_sessions.py
This fills student_data.json with realistic multi-session data so analytics
charts are populated immediately for demonstration.
"""

import sys, os, math, random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))

from hlr_model import HLRModel, WordMemory, SpacedRepetitionSession
from arabic_words import ARABIC_VOCABULARY
from session_manager import save_student_data, _default_stats

random.seed(42)

NUM_SESSIONS   = 15        # simulate 15 sessions
SESSION_SIZE   = 15        # 15 words per session
DAYS_BETWEEN   = 1.5       # average days between sessions


def simulate():
    # Fresh start
    model    = HLRModel()
    memories = {}
    for word in ARABIC_VOCABULARY:
        wid = word[0]
        memories[wid] = WordMemory(wid, word)
    stats = _default_stats()

    print(f"Simulating {NUM_SESSIONS} sessions x {SESSION_SIZE} words …")

    # Artificially back-date last_seen for realistic lag simulation
    sim_time = datetime.now(timezone.utc) - timedelta(days=NUM_SESSIONS * DAYS_BETWEEN)

    for s in range(NUM_SESSIONS):
        sim_time += timedelta(days=DAYS_BETWEEN + random.uniform(-0.3, 0.3))

        # Force last_seen to sim_time for all seen words
        for wm in memories.values():
            if wm.last_seen is not None:
                wm.last_seen = sim_time - timedelta(days=DAYS_BETWEEN)

        scheduler = SpacedRepetitionSession(memories, model, SESSION_SIZE)
        words     = scheduler.select_words()

        session_correct = 0
        for wm in words:
            nc, nw = wm.n_correct, wm.n_wrong
            lag    = max(wm.lag_days(), 0.01)
            p_true = model.predict_recall(nc, nw, lag)

            # Simulated learner: improves over sessions + word-level noise
            session_factor = 0.4 + (s / NUM_SESSIONS) * 0.45
            difficulty     = 0.3 if wm.category in ("verbs", "adjectives") else 0.6
            p_learner      = min(0.95, p_true * session_factor + difficulty * 0.2)
            recalled       = random.random() < p_learner

            # Manually set last_seen for realistic lag
            wm.last_seen = sim_time - timedelta(days=DAYS_BETWEEN)
            wm.record_attempt(recalled, model)
            wm.last_seen = sim_time   # move forward

            if recalled:
                session_correct += 1

        accuracy = session_correct / len(words)
        avg_hl   = sum(wm.half_life for wm in memories.values()) / len(memories)
        stats["total_sessions"]    += 1
        stats["total_attempts"]    += len(words)
        stats["total_correct"]     += session_correct
        stats["session_scores"].append(round(accuracy, 4))
        stats["half_life_history"].append(round(avg_hl, 4))

        print(f"  Session {s+1:2d}: acc={accuracy:.0%}  avg_hl={avg_hl:.2f}d")

    save_student_data(model, memories, stats)
    print("\nSimulation complete. Data saved to student_data.json")
    print("Now run:  python analytics.py  to generate all charts.\n")


if __name__ == "__main__":
    simulate()
