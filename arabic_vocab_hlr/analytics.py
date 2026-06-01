# -*- coding: utf-8 -*-
"""
analytics.py
Produces analytics and visualisations for the HLR Arabic vocabulary project.
Plots:
  1. Ebbinghaus forgetting curve per word
  2. Half-life improvement over sessions
  3. Vocabulary mastery heatmap by category
  4. Session accuracy over time
  5. Recall probability distribution
"""

import math
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
from datetime import datetime


def _load_data(filepath="student_data.json"):
    if not os.path.exists(filepath):
        print("No student data found. Run some quiz sessions first.")
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────────────────────
def plot_forgetting_curves(data, outdir="."):
    """Plot Ebbinghaus forgetting curves for words with history."""
    memories = data["memories"]
    theta    = data["model"]["theta"]

    # Get all seen words
    seen = [v for v in memories.values() if v["n_total"] > 0]
    if not seen:
        print("No seen words yet for forgetting curve.")
        return

    fig, ax = plt.subplots(figsize=(10, 6))
    days    = np.linspace(0, 30, 300)
    colors  = cm.tab10(np.linspace(0, 1, len(seen)))

    for wm, color in zip(seen, colors):
        nc, nw = wm["n_correct"], wm["n_wrong"]
        dot = (theta["bias"] * 1.0
               + theta["sqrt_corr"]  * math.sqrt(nc)
               + theta["sqrt_wrong"] * math.sqrt(nw))
        h = max(0.5, min(274, 2.0 ** dot))
        p = [2.0 ** (-d / h) for d in days]
        label = f"{wm['translit']} ({wm['english']})  h={h:.1f}d"
        ax.plot(days, p, color=color, linewidth=2, label=label)
        ax.axvline(h, color=color, linestyle="--", alpha=0.4)

    ax.set_xlabel("Days since last review", fontsize=12)
    ax.set_ylabel("Recall Probability p(t)", fontsize=12)
    ax.set_title("Ebbinghaus Forgetting Curves – Arabic Vocabulary (HLR)", fontsize=14, fontweight="bold")
    ax.set_ylim(0, 1.05)
    ax.set_xlim(0, 30)
    ax.legend(fontsize=8, loc="upper right")
    ax.grid(alpha=0.3)
    fig.tight_layout()

    out = os.path.join(outdir, "forgetting_curves.png")
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"Saved: {out}")


# ─────────────────────────────────────────────────────────────────────────────
def plot_half_life_progress(data, outdir="."):
    """Plot average half-life across sessions."""
    hl = data["stats"]["half_life_history"]
    if len(hl) < 2:
        print("Need at least 2 sessions for half-life progress chart.")
        return

    fig, ax = plt.subplots(figsize=(9, 5))
    sessions = list(range(1, len(hl) + 1))
    ax.plot(sessions, hl, marker="o", color="#6C63FF", linewidth=2.5,
            markersize=7, label="Avg Half-Life (days)")
    ax.fill_between(sessions, hl, alpha=0.15, color="#6C63FF")

    # Trend line
    z  = np.polyfit(sessions, hl, 1)
    p  = np.poly1d(z)
    ax.plot(sessions, p(sessions), "--", color="#FF6B6B", linewidth=1.5,
            label=f"Trend (slope={z[0]:+.3f} d/session)")

    ax.set_xlabel("Session Number", fontsize=12)
    ax.set_ylabel("Average Half-Life (days)", fontsize=12)
    ax.set_title("Memory Improvement: Half-Life Growth over Sessions", fontsize=14, fontweight="bold")
    ax.legend()
    ax.grid(alpha=0.3)
    fig.tight_layout()

    out = os.path.join(outdir, "half_life_progress.png")
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"Saved: {out}")


# ─────────────────────────────────────────────────────────────────────────────
def plot_category_heatmap(data, outdir="."):
    """Heatmap of accuracy per word category."""
    memories = data["memories"]

    cats = {}
    for wm in memories.values():
        c = wm["category"]
        if c not in cats:
            cats[c] = {"correct": 0, "total": 0, "words": []}
        cats[c]["correct"] += wm["n_correct"]
        cats[c]["total"]   += wm["n_total"]
        cats[c]["words"].append(wm["english"])

    labels   = sorted(cats.keys())
    accuracies = []
    totals     = []
    for c in labels:
        t = cats[c]["total"]
        accuracies.append(cats[c]["correct"] / t if t > 0 else 0.0)
        totals.append(t)

    fig, ax = plt.subplots(figsize=(10, 5))
    x       = np.arange(len(labels))
    bars    = ax.bar(x, accuracies, color=cm.RdYlGn(np.array(accuracies)),
                     edgecolor="white", linewidth=1.2)

    for bar, total in zip(bars, totals):
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h + 0.01,
                f"{h:.0%}\n(n={total})", ha="center", va="bottom", fontsize=9)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=11)
    ax.set_ylabel("Accuracy", fontsize=12)
    ax.set_ylim(0, 1.2)
    ax.set_title("Vocabulary Mastery by Category", fontsize=14, fontweight="bold")
    ax.axhline(0.8, color="green", linestyle="--", alpha=0.5, label="80% target")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()

    out = os.path.join(outdir, "category_heatmap.png")
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"Saved: {out}")


# ─────────────────────────────────────────────────────────────────────────────
def plot_session_accuracy(data, outdir="."):
    """Line chart of session-by-session accuracy."""
    scores = data["stats"]["session_scores"]
    if not scores:
        print("No session scores yet.")
        return

    fig, ax = plt.subplots(figsize=(9, 5))
    sessions = list(range(1, len(scores) + 1))
    ax.plot(sessions, scores, marker="s", color="#FF9F43", linewidth=2.5,
            markersize=7, label="Session Accuracy")

    # Rolling mean
    if len(scores) >= 3:
        roll = [np.mean(scores[max(0, i-2):i+1]) for i in range(len(scores))]
        ax.plot(sessions, roll, "--", color="#48DBFB", linewidth=2,
                label="3-session rolling avg")

    ax.set_xlabel("Session Number", fontsize=12)
    ax.set_ylabel("Accuracy", fontsize=12)
    ax.set_ylim(0, 1.05)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    ax.set_title("Quiz Performance over Sessions", fontsize=14, fontweight="bold")
    ax.axhline(0.8, color="green", linestyle=":", alpha=0.6, label="80% mastery target")
    ax.legend()
    ax.grid(alpha=0.3)
    fig.tight_layout()

    out = os.path.join(outdir, "session_accuracy.png")
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"Saved: {out}")


# ─────────────────────────────────────────────────────────────────────────────
def plot_recall_distribution(data, outdir="."):
    """Histogram of current recall probabilities across seen words."""
    memories = data["memories"]
    theta    = data["model"]["theta"]

    seen = [v for v in memories.values() if v["n_total"] > 0]

    probs = []
    for wm in seen:
        nc, nw = wm["n_correct"], wm["n_wrong"]
        lag    = 1.0  # assume 1 day lag for snapshot
        dot    = (theta["bias"] * 1.0
                  + theta["sqrt_corr"]  * math.sqrt(nc)
                  + theta["sqrt_wrong"] * math.sqrt(nw))
        h = max(0.5, min(274, 2.0 ** dot))
        p = 2.0 ** (-lag / h)
        probs.append(min(1.0, max(0.0, p)))

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.hist(probs, bins=20, color="#6C63FF", edgecolor="white",
            linewidth=0.8, alpha=0.85)
    ax.axvline(np.mean(probs), color="#FF6B6B", linestyle="--", linewidth=2,
               label=f"Mean p = {np.mean(probs):.2f}")
    ax.set_xlabel("Predicted Recall Probability at 1-day lag", fontsize=12)
    ax.set_ylabel("Number of Words", fontsize=12)
    ax.set_title(f"Distribution of Recall Probabilities ({len(probs)} Arabic Words)", fontsize=14, fontweight="bold")
    ax.legend()
    ax.grid(alpha=0.3)
    fig.tight_layout()

    out = os.path.join(outdir, "recall_distribution.png")
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"Saved: {out}")


# ─────────────────────────────────────────────────────────────────────────────
def print_summary_report(data):
    """Print a console summary report."""
    stats    = data["stats"]
    memories = data["memories"]

    total   = len(memories)
    seen    = sum(1 for v in memories.values() if v["n_total"] > 0)
    mastered= sum(1 for v in memories.values()
                  if v["n_total"] > 0 and (v["n_correct"] / v["n_total"]) >= 0.8)

    print("\n" + "="*60)
    print("      [REPORT] HLR ARABIC VOCABULARY -- SUMMARY REPORT")
    print("="*60)
    print(f"  Total vocabulary:    {total} words")
    print(f"  Words practiced:     {seen}  ({seen/total:.0%})")
    print(f"  Words mastered(>=80%):{mastered}")
    print(f"  Total sessions:      {stats['total_sessions']}")
    print(f"  Total attempts:      {stats['total_attempts']}")
    overall_acc = (stats['total_correct'] / stats['total_attempts']
                   if stats['total_attempts'] else 0)
    print(f"  Overall accuracy:    {overall_acc:.1%}")
    if stats["half_life_history"]:
        print(f"  Latest avg half-life:{stats['half_life_history'][-1]:.2f} days")
    if stats["session_scores"]:
        best = max(stats["session_scores"])
        print(f"  Best session score:  {best:.0%}")
    print("="*60)

    # Top 5 hardest words
    hard = sorted(
        [v for v in memories.values() if v["n_total"] > 0],
        key=lambda x: x["n_correct"] / x["n_total"]
    )[:5]
    if hard:
        print("\n  [!] Hardest Words (lowest accuracy):")
        for wm in hard:
            acc = wm["n_correct"] / wm["n_total"]
            print(f"    {wm['translit']:20s}  {wm['english']:20s}  acc={acc:.0%}  hl={wm['half_life']:.1f}d")

    # Top 5 best words
    easy = sorted(
        [v for v in memories.values() if v["n_total"] > 0],
        key=lambda x: x["n_correct"] / x["n_total"],
        reverse=True
    )[:5]
    if easy:
        print("\n  [*] Best Words (highest accuracy):")
        for wm in easy:
            acc = wm["n_correct"] / wm["n_total"]
            print(f"    {wm['translit']:20s}  {wm['english']:20s}  acc={acc:.0%}  hl={wm['half_life']:.1f}d")
    print()


# ─────────────────────────────────────────────────────────────────────────────
def generate_all(outdir="."):
    data = _load_data()
    if data is None:
        return
    print_summary_report(data)
    plot_forgetting_curves(data,    outdir)
    plot_half_life_progress(data,   outdir)
    plot_category_heatmap(data,     outdir)
    plot_session_accuracy(data,     outdir)
    plot_recall_distribution(data,  outdir)
    print("\nAll charts saved to: " + os.path.abspath(outdir))


if __name__ == "__main__":
    generate_all()
