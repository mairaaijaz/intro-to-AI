# Final Exam – Spring 2025 Solutions (Introduction to AI)

## CONSTRAINT SATISFACTION PROBLEM

**1) Color the map with 5 variables**
Based on the provided map image, the adjacencies are:
- **V1** is adjacent to: V2, V3, V5
- **V2** is adjacent to: V1, V3, V4
- **V3** is adjacent to: V1, V2, V4, V5
- **V4** is adjacent to: V2, V3, V5
- **V5** is adjacent to: V1, V3, V4

- **Variables**: V1, V2, V3, V4, V5
- **Domain**: {Red, Green, Blue, Yellow}
- **Constraints**: Adjacent variables must have different colors
- **Variable order**: V3, V5, V1, V2, V4
- **Color order**: Yellow, Green, Blue, Red

**Step-by-Step Backtracking:**
1. **V3 = Yellow** (First variable, assigned the first color in the sequence)
2. **V5 = Green** (V5 is adjacent to V3, so it cannot be Yellow. The next available color is Green)
3. **V1 = Blue** (V1 is adjacent to V3 (Yellow) and V5 (Green). The next available color is Blue)
4. **V2 = Green** (V2 is adjacent to V1 (Blue) and V3 (Yellow). It is not adjacent to V5. The first available color is Green)
5. **V4 = Blue** (V4 is adjacent to V2 (Green), V3 (Yellow), and V5 (Green). It is not adjacent to V1. The first available color is Blue)

**Answer:**
| V3 | V5 | V1 | V2 | V4 |
|---|---|---|---|---|
| Yellow | Green | Blue | Green | Blue |

---

**2) Map coloring problem of Australia (Forward Checking)**

**Scenario 1:**
- **Order**: Q, NSW, SA, WA, V, NT. **Color order**: G, B, R.
1. **Q = G**
   - Forward Checking: NT removes G -> {B}, SA removes G -> {B}, NSW removes G -> {B}.
2. **NSW = B** (domain only has B remaining)
   - Forward Checking: SA removes B -> { } (Empty domain). V removes B -> {R, G}.
- **Variable with the empty domain**: SA
- **Variable whose assignment caused the empty domain**: NSW

**Scenario 2:**
- **Order**: WA, V, NT, Q, NSW, SA. **Color order**: B, G, R.
1. **WA = B** (first color in order)
   - Forward Checking: NT removes B -> {G}, SA removes B -> {G}.
2. **V = B** (V domain is {R, G, B}. Color order is B, G, R)
   - Forward Checking: NSW removes B -> {G}, SA is already {G}.
3. **NT = G** (domain is {G})
   - Forward Checking: SA removes G -> { } (Empty domain).
- **Variable with the empty domain**: SA
- **Variable whose assignment caused the empty domain**: NT

---

**3) Sequence of arcs (AC-3 Algorithm)**
Initial Domains: WA:{R,G}, NT:{G}, Q:{R,G}, NSW:{G,B}, V:{R,G,B}, SA:{R}

Let's check the arcs sequentially:
- **Arc1: SA -> WA:** SA={R}. WA={R,G}. For SA=R, WA can be G. Valid. No domain change.
- **Arc2: V -> SA:** V={R,G,B}. SA={R}. V cannot be R since SA is R. Remove R from V. V becomes {G,B}.
- **Arc3: WA -> NT:** WA={R,G}. NT={G}. WA cannot be G since NT is G. Remove G from WA. WA becomes {R}.
- **Arc4: SA -> Q:** SA={R}. Q={R,G}. SA=R, Q can be G. Valid. No domain change.
- **Arc5: SA -> NT:** SA={R}. NT={G}. Valid. No domain change.
- **Arc6: WA -> SA:** WA={R} (updated in Arc3). SA={R}. WA cannot be R since SA is R. Remove R from WA. WA becomes { } (Empty).

**Answers:**
- **Write arc which makes a variable’s domain empty**: Arc6 (WA -> SA)
- **Write variable whose domain becomes empty**: WA

---

## UNSUPERVISED LEARNING

**4) K-means algorithm (K=3, Manhattan Distance)**
Initial Centroids: C1=P3(2,-2), C2=P6(-5,-2), C3=P8(-3,-1)

*Distance calculations (Manhattan = \|x1-x2\| + \|y1-y2\|):*
- P1(4,7): to C1=11, C2=18, C3=15 -> **C1**
- P2(-1,3): to C1=8, C2=9, C3=6 -> **C3**
- P3(2,-2): to C1=0 -> **C1**
- P4(5,1): to C1=6, C2=13, C3=10 -> **C1**
- P5(7,6): to C1=13, C2=20, C3=17 -> **C1**
- P6(-5,-2): to C2=0 -> **C2**
- P7(3,6): to C1=9, C2=16, C3=13 -> **C1**
- P8(-3,-1): to C3=0 -> **C3**
- P9(6,0): to C1=6, C2=13, C3=10 -> **C1**

Clusters formed:
- Cluster 1: {P1, P3, P4, P5, P7, P9}
- Cluster 2: {P6}
- Cluster 3: {P2, P8}

**a. Updated centroids (mean of assigned points):**
- **C1**: X = (4+2+5+7+3+6)/6 = 27/6 = 4.5. Y = (7-2+1+6+6+0)/6 = 18/6 = 3.0. -> **(4.5, 3.0)**
- **C2**: X = -5/1 = -5. Y = -2/1 = -2. -> **(-5, -2)**
- **C3**: X = (-1-3)/2 = -4/2 = -2. Y = (3-1)/2 = 1. -> **(-2, 1)**

**b. Within cluster sum of squares (WSS) using Euclidean distance:**
- WSS(C1) = (-0.5)^2+(4)^2 + (-2.5)^2+(-5)^2 + (0.5)^2+(-2)^2 + (2.5)^2+(3)^2 + (-1.5)^2+(3)^2 + (1.5)^2+(-3)^2 = 16.25 + 31.25 + 4.25 + 15.25 + 11.25 + 11.25 = **89.5**
- WSS(C2) = 0
- WSS(C3) = (1)^2+(2)^2 + (-1)^2+(-2)^2 = 5 + 5 = **10**
- **Total WSS** = 89.5 + 0 + 10 = **99.5**

**c. Comparison with K=1 WSS:**
**Answer**: K=3 is better. A lower WSS (99.5 vs 242) indicates that the data points are tighter and more accurately grouped around their respective cluster centroids, significantly reducing the overall error compared to placing all points in a single cluster.

**5) Proximity in K-means**
**Answer:** Proximity serves as the quantitative measure of similarity between data points. K-means clusters data by minimizing the distance (maximizing proximity) between points and their cluster centroids, meaning closer points are considered more similar and are grouped together.

**6) Hyperspherical clusters in K-means**
**Answer:** **C**. It uses Euclidean distance and assumes that clusters are distributed symmetrically around a centroid.

---

## SUPERVISED LEARNING

**7) Decision Tree**
Total Entropy: 3 Pass, 5 Fail.
E(S) = -(3/8)log2(3/8) - (5/8)log2(5/8) ≈ 0.9544

*Information Gains:*
- **Game Skills**:
  - Expert (3): 1P, 2F. E = 0.9183
  - Novice (5): 2P, 3F. E = 0.9710
  - IG = 0.9544 - [(3/8)*0.9183 + (5/8)*0.9710] ≈ **0.0031**
- **Favorite Campus**:
  - Main (3): 0P, 3F. E = 0
  - City (5): 3P, 2F. E = 0.9710
  - IG = 0.9544 - [(3/8)*0 + (5/8)*0.9710] ≈ **0.3475**
- **Favorite Drink**:
  - Next (4): 2P, 2F. E = 1.0
  - Fizup (3): 0P, 3F. E = 0
  - Pakola (1): 1P, 0F. E = 0
  - IG = 0.9544 - [(4/8)*1.0 + (3/8)*0 + (1/8)*0] = 0.9544 - 0.5 = **0.4544**

**Answers:**
- What is the Information Gain for the attribute Game Skills? **0.0031**
- What is the Information Gain for the attribute Favorite Campus? **0.3475**
- What is the Information Gain for the attribute Favorite Drink? **0.4544**
- Which attribute is selected at the root? **Favorite Drink**
- Which branch or branches of the root node has a decision (Pass or Fail) on it (i.e., leaf node)? **Fizup (decision: Fail) and Pakola (decision: Pass)**

**8) Neural Network**
Inputs: n1 = 0.4, n2 = 0.6. Target T = 0.65. Learning rate = 0.5.
Hidden node net inputs and outputs (using sigmoid):
- net_i = (0.4 * 0.20) + (0.6 * -0.10) = 0.02. Oi = 1 / (1 + e^-0.02) = 0.50500
- net_j = (0.4 * 0.10) + (0.6 * -0.10) = -0.02. Oj = 1 / (1 + e^0.02) = 0.49500
- net_k = (0.4 * 0.30) + (0.6 * 0.20) = 0.24. Ok = 1 / (1 + e^-0.24) = 0.55971

Output node x:
- net_x = (0.50500 * 0.10) + (0.49500 * 0.50) + (0.55971 * 0.20) = 0.05050 + 0.24750 + 0.11194 = 0.40994
- Ox = 1 / (1 + e^-0.40994) = 0.60107

Error at node x:
- Error(x) = (T - Ox) * Ox * (1 - Ox)
- Error(x) = (0.65 - 0.60107) * 0.60107 * (1 - 0.60107) = 0.04893 * 0.60107 * 0.39893 = 0.01173

Weight update:
- wkx_new = wkx + r * Error(x) * Ok
- wkx_new = 0.20 + (0.5 * 0.01173 * 0.55971) = 0.20 + 0.00328 = 0.20328

**Answers:**
- What is the output at node x? **0.60107**
- What is the error at node x? **0.01173**
- What is the updated value of weight wkx? **0.20328**

**9) Generalization**
**Answer:** This goal is called **Generalization**. It is central to the learning process because the true utility of a machine learning model lies in its predictive power on new, real-world data, not just memorizing the training data. A model that generalizes well captures underlying patterns rather than noise.

**10) Decision tree split**
**Answer:** **C**. It chooses the split that results in the most homogeneous (pure) branches.

**11) Main goal of cross-validation**
**Answer:** The main goal is to assess how well a model will generalize to an independent, unseen dataset. It helps evaluate performance robustly and prevents overfitting by ensuring the model doesn't just memorize a specific subset of the training data.

**12) Confusion matrix**
TP = 560, FN = 40, FP = 50, TN = 50.
- **Precision** = TP / (TP + FP) = 560 / 610 = **0.9180 (91.80%)**
- **Recall** = TP / (TP + FN) = 560 / 600 = **0.9333 (93.33%)**
- **F-measure (F1)** = 2 * (Precision * Recall) / (Precision + Recall) = **0.9256 (92.56%)**

---

## KNOWLEDGE REPRESENTATION (LOGICAL REASONING)

**13) Main limitation of propositional logic**
**Answer:** The main limitation is its limited expressive power. It cannot represent relationships between objects or generalize properties to groups of objects using quantifiers (like "all" or "some"), leading to an explosion of propositions when dealing with large domains.

**14) FOL Rules in Prolog**
```prolog
mother(X, Y) :- parent(X, Y), female(X).
daughter(X, Y) :- parent(Y, X), female(X).
sibling(X, Y) :- parent(Z, X), parent(Z, Y), X \= Y.
grandMother(X, Y) :- parent(X, Z), parent(Z, Y), female(X).
```

**15) Validate argument using propositional logic**
**a. ARGUMENT#1:**
- Premise 1: S -> P (If I study, I will pass)
- Premise 2: ~P (I did not pass)
- Conclusion: ~S (Therefore, I did not study)
- **Inferencing rule**: Modus Tollens
- **Valid / invalid**: Valid

**b. ARGUMENT#2:**
- Premise 1: W -> C (If it is winter, then it is cold)
- Premise 2: C (It is cold)
- Conclusion: W (Therefore, it is winter)
- **Inferencing rule**: Fallacy of Affirming the Consequent
- **Valid / invalid**: Invalid

---

## KNOWLEDGE REPRESENTATION (PROBABILISTIC REASONING)

**16) Bayesian Network**
Based on the conditional probability tables given, M and W are parents of S, and W is the parent of H.
- **Joint probability equation**: P(S, H, M, W) = P(M) * P(W) * P(S | M, W) * P(H | W)
- **More independent probability values needed**: **2** (We need the prior probabilities for the root nodes: P(M=T) and P(W=T)).

**17) Singly connected Bayesian Network**
*(Note: Figure (a) and Figure (b) are missing from the textual extraction. Thus, exact posterior probabilities cannot be computed without the Conditional Probability Tables or marginals. However, the generic approach using Bayes' Theorem and structural factorization is outlined below.)*
- **Posterior probability of y1 or P*(y1)**: Calculated as P(y1 | z1) = P(y1, z1) / P(z1). You would marginalize over X and W using the CPTs to find the joint probability.
- **Posterior probability of x1 or P*(x1)**: Calculated as P(x1 | z1) = P(x1, z1) / P(z1).

**18) Joint distribution from factorization**
**Answer:** **b) Multiply the conditional probabilities of each variable given its parents.**
