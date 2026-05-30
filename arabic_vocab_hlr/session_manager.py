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


def expand_contractions(text: str) -> str:
    text = text.replace("you're", "you are")
    text = text.replace("you re", "you are")
    text = text.replace("don't", "do not")
    text = text.replace("it's", "it is")
    text = text.replace("won't", "will not")
    return text


def get_clean_words(text: str) -> list:
    expanded = expand_contractions(text.lower())
    import re
    cleaned = re.sub(r'[.,\/#!$%\^&\*;:{}=\-_`~()?]', ' ', expanded)
    words = [w.strip() for w in cleaned.split() if w.strip()]
    filtered = [w for w in words if w not in {"to", "the", "a", "an"}]
    return filtered if filtered else words


def get_edit_distance(a: str, b: str) -> int:
    if len(a) < len(b):
        return get_edit_distance(b, a)
    if not b:
        return len(a)
    
    previous_row = range(len(b) + 1)
    for i, c1 in enumerate(a):
        current_row = [i + 1]
        for j, c2 in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
        
    return previous_row[-1]


def is_fuzzy_match(user: str, target: str) -> bool:
    user_words = get_clean_words(user)
    target_words = get_clean_words(target)
    
    if not user_words or not target_words:
        return False
        
    if " ".join(user_words) == " ".join(target_words):
        return True
        
    match_count = sum(1 for tw in target_words if tw in user_words)
    coverage = match_count / len(target_words)
    
    if len(target_words) == 1:
        tw = target_words[0]
        uw = user_words[0]
        if tw == uw:
            return True
        if len(tw) >= 4 and get_edit_distance(tw, uw) <= 1:
            return True
        return False
        
    if len(target_words) == 2:
        return match_count == 2
        
    return coverage >= 0.65


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

        answer = input("         Your answer: ")
        correct_answers = [syn.strip() for syn in wm.english.split("/")]
        recalled = any(is_fuzzy_match(answer, a) for a in correct_answers)

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
