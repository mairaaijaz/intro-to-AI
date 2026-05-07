import math

# HELPER: sigmoid activation function
def sigmoid(x):
    """
    The sigmoid (logistic) function squashes any real number into [0, 1].
    This makes it useful as an output activation for binary classification.
    Formula: sigma(x) = 1 / (1 + e^(-x))
    """
    return 1 / (1 + math.exp(-x))


# FUNCTION: forward
def forward(x1, x2, w1, w2, bias):
    """
    Performs the forward pass of a single perceptron with 2 inputs.

    Steps:
      1. Compute the weighted sum (net input): z = w1*x1 + w2*x2 + bias
      2. Apply sigmoid activation to get the output probability.

    Parameters:
        x1, x2 (float): Input feature values
        w1, w2 (float): Learnable weights for each input
        bias   (float): Bias term (allows shifting the decision boundary)

    Returns:
        float: Output of the neuron (a value between 0 and 1)
    """
    # Weighted sum of inputs plus bias
    z = w1 * x1 + w2 * x2 + bias

    # Pass through sigmoid to get a probability-like output
    output = sigmoid(z)
    return output


# FUNCTION: train_perceptron
def train_perceptron(X, y, gate_name, epochs=100, lr=0.5,
                     w1_init=0.5, w2_init=0.5, bias_init=0.0):
    """
    Trains a single perceptron using the Delta Rule (also called
    the Widrow-Hoff rule) for a given number of epochs.

    Delta Rule update equations:
        error  = target - output
        w1    += lr * error * x1
        w2    += lr * error * x2
        bias  += lr * error

    Parameters:
        X         (list of tuples): Input pairs, e.g. [(0,0), (0,1), ...]
        y         (list of int):   Target labels matching each input
        gate_name (str):           Label for printing (e.g. 'AND', 'XOR')
        epochs    (int):           Number of full passes through the data
        lr        (float):         Learning rate
        w1_init, w2_init, bias_init (float): Starting parameter values

    Returns:
        tuple: Final (w1, w2, bias) after training
    """
    # Initialize weights and bias from the given starting values
    w1   = w1_init
    w2   = w2_init
    bias = bias_init

    print("=" * 55)
    print(f"  Training Perceptron on {gate_name} Gate")
    print("=" * 55)

    for epoch in range(1, epochs + 1):
        # ── One epoch: loop over every training example ──
        for (x1, x2), target in zip(X, y):

            # Forward pass: compute current output for this input pair
            output = forward(x1, x2, w1, w2, bias)

            # Compute error between target and network output
            error = target - output

            # Update weights using the Delta Rule
            # Each weight moves in the direction that reduces the error
            w1   += lr * error * x1   # weight for input x1
            w2   += lr * error * x2   # weight for input x2
            bias += lr * error         # bias is updated without an input multiplier

        # ── Print progress every 20 epochs ──
        if epoch % 20 == 0:
            print(f"\nEpoch {epoch}:")
            for (x1, x2), target in zip(X, y):
                out = forward(x1, x2, w1, w2, bias)
                # Round to 0 or 1: threshold at 0.5
                pred = 1 if out >= 0.5 else 0
                print(f"  [{x1},{x2}] --> {out:.4f} ({pred}), target={target}")

    return w1, w2, bias


# FUNCTION: print_truth_table
def print_truth_table(X, y, w1, w2, bias, gate_name):
    """
    After training, shows a side-by-side truth table of
    the actual targets vs. what the perceptron predicted.
    """
    print(f"\n--- Truth Table for {gate_name} Gate (after training) ---")
    print(f"{'x1':>3} {'x2':>3}  | {'Target':>6} | {'Predicted':>9}")
    print("-" * 35)
    for (x1, x2), target in zip(X, y):
        out  = forward(x1, x2, w1, w2, bias)
        pred = 1 if out >= 0.5 else 0
        print(f"{x1:>3} {x2:>3}  | {target:>6}  | {pred:>9}")
    print()


# DATASET: AND Gate
# The AND gate outputs 1 only when BOTH inputs are 1.
X_and = [(0, 0), (0, 1), (1, 0), (1, 1)]
y_and = [0, 0, 0, 1]

# Train perceptron on AND gate with specified hyperparameters
w1_and, w2_and, bias_and = train_perceptron(
    X_and, y_and, gate_name='AND',
    epochs=100, lr=0.5,
    w1_init=0.5, w2_init=0.5, bias_init=0.0
)

# Print final truth table for AND
print_truth_table(X_and, y_and, w1_and, w2_and, bias_and, gate_name='AND')


# DATASET: XOR Gate
# The XOR gate outputs 1 when inputs DIFFER (one 0 and one 1).
# This is NOT linearly separable, so a single perceptron cannot learn it.
X_xor = [(0, 0), (0, 1), (1, 0), (1, 1)]
y_xor = [0, 1, 1, 0]

# Train perceptron on XOR gate with the same hyperparameters
w1_xor, w2_xor, bias_xor = train_perceptron(
    X_xor, y_xor, gate_name='XOR',
    epochs=100, lr=0.5,
    w1_init=0.5, w2_init=0.5, bias_init=0.0
)

# Print final truth table for XOR
print_truth_table(X_xor, y_xor, w1_xor, w2_xor, bias_xor, gate_name='XOR')

# OBSERVATION NOTE
print("OBSERVATION:")
print("  AND gate: the perceptron LEARNS correctly (linearly separable).")
print("  XOR gate: the perceptron FAILS (not linearly separable).")
print("  A single-layer perceptron can only draw a straight decision")
print("  boundary, but XOR requires a non-linear boundary.")
