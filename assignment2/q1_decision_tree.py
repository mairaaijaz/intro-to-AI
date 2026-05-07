import math

# The Play Tennis dataset with 5 examples.
# Each row is a dictionary with feature keys and a 'Play' label.
data = [
    {'Outlook': 'Sunny',    'Humidity': 'High',   'Play': 'No'},
    {'Outlook': 'Sunny',    'Humidity': 'Normal',  'Play': 'Yes'},
    {'Outlook': 'Overcast', 'Humidity': 'High',   'Play': 'Yes'},
    {'Outlook': 'Rain',     'Humidity': 'High',   'Play': 'No'},
    {'Outlook': 'Rain',     'Humidity': 'Normal',  'Play': 'Yes'},
]


# Function 1: entropy
def entropy(labels):
    """
    Computes the Shannon entropy of a list of class labels.

    Entropy measures the impurity (or uncertainty) in a set.
    Formula: H(S) = -sum(p_i * log2(p_i))  for each unique class i

    Parameters:
        labels (list): A list of class labels, e.g. ['Yes', 'No', 'Yes']

    Returns:
        float: The entropy value (0 = pure, 1 = maximum impurity for 2 classes)
    """
    n = len(labels)  # total number of examples in this set

    if n == 0:
        return 0.0   # empty set has no uncertainty

    #Count how mny times each unique label appears
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1

    #calc entropy using the formula H = -sum(p * log2(p))
    h = 0.0
    for count in counts.values():
        p = count / n          # proportion of this class in the set
        h -= p * math.log2(p)  # subtract p*log2(p) from entropy total

    return h

#function 2: info_gain
def info_gain(data, attr, target='Play'):
    """
    Computes Information Gain when splitting the dataset on a given attribute.

    Information Gain = Entropy(parent) - Weighted Average Entropy(children)

    A higher gain means this attribute does a better job of separating the classes.

    Parameters:
        data  (list of dict): The dataset (each dict is one example).
        attr  (str): The attribute name to split on (e.g. 'Outlook').
        target(str): The class label key (default 'Play').

    Returns:
        float: The information gain for splitting on 'attr'.
    """
    n = len(data)  # total number of examples

    #step1: Compute parent entropy (the whole dataset before splitting)
    parent_labels = [row[target] for row in data]
    parent_entropy = entropy(parent_labels)

    # Step 2: Find all unique values for the chosen attribute
    # e.g., for 'Outlook': {'Sunny', 'Overcast', 'Rain'}
    unique_values = set(row[attr] for row in data)

    # Step 3: Compute the weighted entropy after splitting on 'attr'
    weighted_entropy = 0.0
    for value in unique_values:
        # Collect all rows where this attribute equals 'value'
        subset = [row for row in data if row[attr] == value]

        # Extract only the class labels from this subset
        subset_labels = [row[target] for row in subset]

        # Weight = (size of subset) / (total size of dataset)
        weight = len(subset) / n

        # Add this subset's weighted entropy to the running total
        weighted_entropy += weight * entropy(subset_labels)

    # Step 4: Information Gain = parent entropy - weighted child entropy
    gain = parent_entropy - weighted_entropy
    return gain

# MAIN: Build the Decision Stump
# Candidate attributes we want to compare as root splits
candidates = ['Outlook', 'Humidity']

# Calculate information gain for each candidate attribute
gains = {}
for attr in candidates:
    gains[attr] = info_gain(data, attr)
    print(f"Gain({attr}) = {gains[attr]:.4f}")

# Choose the attribute with the highest information gain as the root
chosen_root = max(gains, key=gains.get)
print(f"\nChosen root: {chosen_root}")

# PREDICTION RULES for the chosen root
# For each value of the chosen attribute, determine the majority class.
# In a decision stump (depth-1 tree), each leaf predicts the majority label.
print("\nRules:")

unique_values = sorted(set(row[chosen_root] for row in data))  # sorted for consistent output

for value in unique_values:
    # Get all rows that match this value of the root attribute
    subset = [row for row in data if row[chosen_root] == value]

    # Count 'Yes' and 'No' in this subset to find the majority label
    label_counts = {}
    for row in subset:
        label = row['Play']
        label_counts[label] = label_counts.get(label, 0) + 1

    # Majority vote: pick the label that appears most often
    majority_label = max(label_counts, key=label_counts.get)

    # Print the prediction rule for this branch
    print(f"  - {chosen_root} = {value} --> Play = {majority_label}")
