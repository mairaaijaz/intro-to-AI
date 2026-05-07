# Arabic Vocabulary Learning System — HLR Spaced Repetition

## Project Overview
**Assignment 2 | Introduction to AI | Group: ARABOT**
Members: Maira Aijaz · Muhammad Asad Piracha · Qadrain Qadri Khan

This system implements the **Half-Life Regression (HLR)** model from:

> Settles, B. & Meeder, B. (2016). *A Trainable Spaced Repetition Model for Language Learning.* ACL 2016. https://research.duolingo.com/papers/settles.acl16.pdf

Applied to a vocabulary of **200 Arabic words** translatable to English.

---

## The HLR Model — Key Equations

| Symbol | Meaning |
|--------|---------|
| `p(t)` | Probability of recalling a word after lag `t` days |
| `h`    | Memory half-life in days |
| `θ`    | Learned parameter vector |
| `x`    | Feature vector: `[1, √n_correct, √n_wrong]` |

```
Forgetting curve:   p = 2^(-Δ/h)            (Ebbinghaus 1885)
Half-life:          h = 2^(θ · x)            (HLR model)
Empirical h̃:        h̃ = -Δ / log₂(p_obs)
Loss:               L = (p̂ - p_obs)² + α(ĥ - h̃)²
```

Parameters `θ` are updated via **online SGD** after every answer.

---

## Vocabulary (200 Words, 14 Categories)

| Category     | Count | Examples |
|--------------|-------|---------|
| Numbers      | 15    | wahid (one), alf (thousand) |
| Verbs        | 20    | kataba (to write), fahima (to understand) |
| Food         | 15    | khubz (bread), qahwa (coffee) |
| Places       | 15    | madrasa (school), masjid (mosque) |
| Adjectives   | 15    | kabir (big), jamil (beautiful) |
| Colors       | 10    | ahmar (red), aswad (black) |
| Family       | 10    | ab (father), ukht (sister) |
| Body         | 10    | qalb (heart), ra's (head) |
| Nature       | 10    | shams (sun), bahr (sea) |
| Time         | 10    | yawm (day), ghadan (tomorrow) |
| Greetings    | 10    | marhaban (hello), shukran (thank you) |
| Transport    | 10    | sayyara (car), qitar (train) |
| Health       | 10    | tabib (doctor), dawa' (medicine) |
| Technology   | 10    | hatif (phone), hasub (computer) |
| + more…      | 20    | animals, abstract, clothes, education |

---

## Project Files

```
arabic_vocab_hlr/
├── arabic_words.py       — 200 Arabic words dataset
├── hlr_model.py          — HLR model + SGD + WordMemory class
├── session_manager.py    — Save/load + quiz session runner
├── analytics.py          — 5 analytics charts
├── main.py               — Interactive menu (run this!)
├── simulate_sessions.py  — Demo data generator
└── student_data.json     — Persisted student progress
```

---

## How to Run

### 1. Install dependencies
```bash
pip install matplotlib numpy
```

### 2. (Optional) Generate demo data first
```bash
python simulate_sessions.py
```

### 3. Launch the learning system
```bash
python main.py
```

Menu options:
- **[1]** Quiz — 10 words, selected by lowest predicted recall
- **[2]** Quiz — 20 words
- **[3]** Analytics — generates all 5 charts as PNG
- **[4]** Word list — browse by category

---

## Analytics Charts Generated

| Chart | Description |
|-------|-------------|
| `forgetting_curves.png`    | Ebbinghaus p(t) = 2^(-t/h) per word |
| `half_life_progress.png`   | Average h across sessions (memory improvement) |
| `category_heatmap.png`     | Accuracy per category vs 80% target |
| `session_accuracy.png`     | Per-session accuracy + rolling avg |
| `recall_distribution.png`  | Distribution of current recall probs |

---

## Spaced Repetition Scheduling

Words are scheduled using the HLR formula:
1. Words never seen get priority (30% of session = new words)
2. Seen words sorted by **lowest current recall probability**  
   `p = 2^(-lag_days / h)` — words most likely forgotten come first
3. After each answer, `θ` is updated via SGD to improve future predictions

---

## References
- Settles, B. & Meeder, B. (2016). ACL 2016.
- Ebbinghaus, H. (1885). *Über das Gedächtnis.*
