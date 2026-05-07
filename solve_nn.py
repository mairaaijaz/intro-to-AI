import math

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

# Given values
O1 = 0.4
O2 = 0.6
T = 0.65
r = 0.5

# Weights (initial)
w1i = 0.20
w1j = 0.10
w1k = 0.30
w2i = -0.10
w2j = -0.10
w2k = 0.20
wix = 0.10
wjx = 0.50
wkx = 0.20

def solve():
    # Hidden layer net inputs
    net_i = w1i * O1 + w2i * O2
    net_j = w1j * O1 + w2j * O2
    net_k = w1k * O1 + w2k * O2
    
    # Round to 5 decimal places as per instruction (assuming intermediate steps)
    net_i = round(net_i, 5)
    net_j = round(net_j, 5)
    net_k = round(net_k, 5)
    
    print(f"net_i: {net_i:.5f}")
    print(f"net_j: {net_j:.5f}")
    print(f"net_k: {net_k:.5f}")
    
    # Hidden layer outputs
    Oi = round(sigmoid(net_i), 5)
    Oj = round(sigmoid(net_j), 5)
    Ok = round(sigmoid(net_k), 5)
    
    print(f"Oi: {Oi:.5f}")
    print(f"Oj: {Oj:.5f}")
    print(f"Ok: {Ok:.5f}")
    
    # Output layer net input
    net_x = wix * Oi + wjx * Oj + wkx * Ok
    net_x = round(net_x, 5)
    print(f"net_x: {net_x:.5f}")
    
    # Output layer output
    Ox = round(sigmoid(net_x), 5)
    print(f"Ox: {Ox:.5f}")
    
    # Error at node x
    # Formula: Error(x) = (T - Ox) * Ox * (1 - Ox)
    error_x = (T - Ox) * Ox * (1 - Ox)
    error_x = round(error_x, 5)
    print(f"Error(x): {error_x:.5f}")
    
    # Updated value of weight wkx
    # Formula: delta_wkx = r * Error(x) * Ok
    delta_wkx = r * error_x * Ok
    delta_wkx = round(delta_wkx, 5)
    wkx_new = wkx + delta_wkx
    wkx_new = round(wkx_new, 5)
    
    print(f"delta_wkx: {delta_wkx:.5f}")
    print(f"wkx_new: {wkx_new:.5f}")

solve()
