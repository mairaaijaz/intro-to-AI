"""
session_manager.py
Handles save/load of student progress and session orchestration.
"""

import json
import os
from hlr_model import HLRModel, WordMemory, SpacedRepetitionSession
from arabic_words import ARABIC_VOCABULARY

DATA_FILE = "student_data.json"


def load_student_data(filepath=DATA_FILE):
    """Load model + word memories from JSON. Creates fresh data if not found."""
    if not os.path.exists(filepath):
        return _fresh_data()

    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)

    model    = HLRModel.from_dict(raw["model"])
    memories = {k: WordMemory.from_dict(v) for k, v in raw["memories"].items()}
    stats    = raw.get("stats", _default_stats())
    return model, memories, stats


def save_student_data(model, memories, stats, filepath=DATA_FILE):
    data = {
        "model":    model.to_dict(),
        "memories": {k: v.to_dict() for k, v in memories.items()},
        "stats":    stats,
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _fresh_data():
    model    = HLRModel()
    memories = {}
    for word in ARABIC_VOCABULARY:
        wid = word[0]           # Arabic string as unique key
        memories[wid] = WordMemory(wid, word)
    stats = _default_stats()
    return model, memories, stats


def _default_stats():
    return {
        "total_sessions":    0,
        "total_attempts":    0,
        "total_correct":     0,
        "session_scores":    [],   # per-session accuracy list
        "half_life_history": [],   # average half-life after each session
    }


def run_quiz_session(model, memories, stats, session_size=10):
    """
    Runs an interactive quiz session in the terminal.
    Returns updated model, memories, stats.
    """
    scheduler = SpacedRepetitionSession(memories, model, session_size)
    words     = scheduler.select_words()

    if not words:
        print("No words available.")
        return model, memories, stats

    session_correct = 0
    session_total   = 0

    print("\n" + "="*60)
    print("   🌙 ARABIC VOCABULARY QUIZ - HLR Spaced Repetition")
    print("="*60)
    print(f"   Session words: {len(words)}  |  Type the English meaning")
    print("="*60 + "\n")

    for i, wm in enumerate(words, 1):
        lag = round(wm.lag_days(), 2)
        p   = round(model.predict_recall(wm.n_correct, wm.n_wrong, lag), 3)
        h   = round(model.predict_half_life(wm.n_correct, wm.n_wrong), 2)

        print(f"  [{i}/{len(words)}]  Arabic: {wm.arabic}  ({wm.translit})")
        print(f"          Category: {wm.category}  | predicted recall: {p:.0%}  | half-life: {h:.1f}d")

        answer = input("         Your answer: ").strip().lower()
        correct_answers = [syn.strip().lower() for syn in wm.english.split("/")]
        recalled = any(answer == a or answer in a or a in answer
                       for a in correct_answers)

        if recalled:
            print(f"  ✅  Correct! '{wm.english}'\n")
            session_correct += 1
        else:
            print(f"  ❌  Wrong. Correct answer: '{wm.english}'\n")

        wm.record_attempt(recalled, model)
        session_total += 1

    # Update global stats
    accuracy = session_correct / session_total if session_total else 0
    avg_hl   = sum(wm.half_life for wm in memories.values()) / len(memories)

    stats["total_sessions"]    += 1
    stats["total_attempts"]    += session_total
    stats["total_correct"]     += session_correct
    stats["session_scores"].append(round(accuracy, 4))
    stats["half_life_history"].append(round(avg_hl, 4))

    print("="*60)
    print(f"  Session Score: {session_correct}/{session_total}  ({accuracy:.0%})")
    print(f"  Avg Half-Life across all words: {avg_hl:.2f} days")
    print("="*60 + "\n")

    return model, memories, stats
