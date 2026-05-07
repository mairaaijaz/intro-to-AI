# Arabic Vocabulary Learning System — HLR Spaced Repetition

## Project Overview
**Assignment 2 | Introduction to AI | Group: ARABOT**
Members: Maira Aijaz · Muhammad Asad Piracha · Qadrain Qadri Khan

This system implements the **Half-Life Regression (HLR)** model from:

> Settles, B. & Meeder, B. (2016). *A Trainable Spaced Repetition Model for Language Learning.* ACL 2016. https://research.duolingo.com/papers/settles.acl16.pdf

Applied to a vocabulary of **200 Arabic words** translatable to English.

---

## Two Implementations Provided

We have provided two complete implementations of this project:

1. **`arabic_vocab_hlr/`**: A Python CLI implementation that runs in the terminal and generates analytics charts using matplotlib.
2. **`arabot-web/`**: A fully interactive **Next.js Web Application** with a beautiful UI, client-side persistence, and interactive Recharts. This version is ready to be deployed to Vercel.

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

## Web Application (Next.js)

The web app provides a gamified, beautiful interface for the HLR model.

### How to Run the Web App Locally

```bash
cd arabot-web
npm install
npm run dev
```
Then open `http://localhost:3000` in your browser.

### Deploying to Vercel

The `arabot-web` folder is pre-configured for Vercel deployment. You can easily deploy it by:
1. Pushing the folder to a GitHub repository.
2. Importing the repository into Vercel.
3. Vercel will automatically detect the Next.js framework and deploy it.

---

## Python CLI Application

### How to Run the Python App

```bash
cd arabic_vocab_hlr
pip install matplotlib numpy
python main.py
```

Menu options:
- **[1]** Quiz — 10 words, selected by lowest predicted recall
- **[2]** Quiz — 20 words
- **[3]** Analytics — generates all 5 charts as PNG
- **[4]** Word list — browse by category

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
