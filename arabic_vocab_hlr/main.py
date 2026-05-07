"""
main.py
Entry point for the Arabic HLR Vocabulary Learning System.
Run: python main.py
"""

import sys
import os

# Ensure imports work from this directory
sys.path.insert(0, os.path.dirname(__file__))

from session_manager import load_student_data, save_student_data, run_quiz_session
from analytics import generate_all


MENU = """
╔══════════════════════════════════════════════════════════╗
║    🌙  Arabic Vocabulary - HLR Spaced Repetition         ║
║    Based on: Settles & Meeder, ACL 2016 (Duolingo)       ║
╠══════════════════════════════════════════════════════════╣
║  [1]  Start Quiz Session (10 words)                      ║
║  [2]  Start Quiz Session (20 words)                      ║
║  [3]  View Analytics & Progress Report                   ║
║  [4]  View Word List by Category                         ║
║  [5]  Reset Progress (start fresh)                       ║
║  [Q]  Quit                                               ║
╚══════════════════════════════════════════════════════════╝
"""


def show_word_list(memories):
    from arabic_words import CATEGORIES
    print("\nCategories:", ", ".join(sorted(CATEGORIES)))
    cat = input("Enter category (or press Enter for all): ").strip().lower()

    print(f"\n{'Arabic':15s} {'Translit':20s} {'English':25s} {'Att':5s} {'Acc':6s} {'HL':7s}")
    print("-" * 80)
    for wm in memories.values():
        if cat and cat not in wm.category.lower():
            continue
        acc = f"{wm.accuracy:.0%}" if wm.n_total > 0 else "-"
        hl  = f"{wm.half_life:.1f}d" if wm.n_total > 0 else "-"
        print(f"{wm.arabic:15s} {wm.translit:20s} {wm.english:25s} "
              f"{wm.n_total:5d} {acc:6s} {hl:7s}")
    print()


def reset_progress():
    confirm = input("⚠️  This will erase all progress. Type YES to confirm: ")
    if confirm.strip().upper() == "YES":
        if os.path.exists("student_data.json"):
            os.remove("student_data.json")
        print("Progress reset.\n")
    else:
        print("Cancelled.\n")


def main():
    print("\nLoading student data...")
    model, memories, stats = load_student_data()
    print(f"Loaded {len(memories)} words | Sessions: {stats['total_sessions']}")

    while True:
        print(MENU)
        choice = input("Your choice: ").strip().upper()

        if choice == "1":
            model, memories, stats = run_quiz_session(model, memories, stats, session_size=10)
            save_student_data(model, memories, stats)

        elif choice == "2":
            model, memories, stats = run_quiz_session(model, memories, stats, session_size=20)
            save_student_data(model, memories, stats)

        elif choice == "3":
            generate_all(outdir=".")

        elif choice == "4":
            show_word_list(memories)

        elif choice == "5":
            reset_progress()
            model, memories, stats = load_student_data()

        elif choice == "Q":
            save_student_data(model, memories, stats)
            print("Progress saved. Good luck with your Arabic studies! 🌙\n")
            break

        else:
            print("Invalid choice. Please try again.\n")


if __name__ == "__main__":
    main()
