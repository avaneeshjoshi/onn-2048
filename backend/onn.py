import torch
import torch.nn as nn
from torchdiffeq import odeint
import numpy as np
from game import Game2048

DEPTH = 4  # faster per-move compute

def score_board(board):
    """Heuristic: rewards monotonicity, empty cells, mergeability, corner bias."""
    b = np.array(board, dtype=float)
    score = 0.0

    # empty cells
    score += np.sum(b == 0) * 2.7

    # monotonicity (tiles should decrease smoothly in rows/cols)
    for row in b:
        for i in range(3):
            if row[i] >= row[i+1]:
                score += 1.0
            else:
                score -= 1.5
    for col in b.T:
        for i in range(3):
            if col[i] >= col[i+1]:
                score += 1.0
            else:
                score -= 1.5

    # mergeability (adjacent equal tiles)
    for r in range(4):
        for c in range(3):
            if b[r, c] == b[r, c+1] and b[r, c] != 0:
                score += b[r, c] * 0.5
    for c in range(4):
        for r in range(3):
            if b[r, c] == b[r+1, c] and b[r, c] != 0:
                score += b[r, c] * 0.5

    # corner bias: highest tile in top-left
    max_val = b.max()
    if b[0, 0] == max_val:
        score += max_val * 2.0

    return score


def expectimax(board, score, depth, is_player):
    g = Game2048.__new__(Game2048)
    g.board = np.array(board)
    g.score = score

    if depth == 0 or g.is_over():
        return score_board(board)

    if is_player:
        best = float('-inf')
        for move in g.valid_moves():
            tmp = Game2048.__new__(Game2048)
            tmp.board = g.board.copy()
            tmp.score = g.score
            tmp.move(move)
            val = expectimax(tmp.board.tolist(), tmp.score, depth - 1, False)
            best = max(best, val)
        return best
    else:
        # chance node: average over empty cells
        empty = list(zip(*np.where(g.board == 0)))
        if not empty:
            return score_board(board)
        total = 0.0
        for (r, c) in empty:
            for val, prob in [(2, 0.9), (4, 0.1)]:
                tmp_board = g.board.copy()
                tmp_board[r, c] = val
                total += prob * expectimax(tmp_board.tolist(), score, depth - 1, True)
        return total / len(empty)


def best_move_expectimax(board, valid_moves):
    best_score, best_move = float('-inf'), valid_moves[0]
    for move in valid_moves:
        g = Game2048.__new__(Game2048)
        g.board = np.array(board)
        g.score = 0
        g.move(move)
        val = expectimax(g.board.tolist(), g.score, DEPTH - 1, False)
        if val > best_score:
            best_score, best_move = val, move
    return best_move


# Hopf ONN model (needs to be trained using train.py))
class HopfONN(nn.Module):
    def __init__(self, n=16, alpha=1.0, dt=0.5, steps=20):
        super().__init__()
        self.n = n
        self.alpha = alpha
        self.dt = dt
        self.steps = steps
        self.W = nn.Parameter(torch.randn(n, n, dtype=torch.cfloat) * 0.1)
        self.head = nn.Linear(n * 2, 4)
        self.trained = False

    def dynamics(self, t, z):
        mag2 = z.real**2 + z.imag**2
        dz = (self.alpha + 1j * torch.ones(self.n) - mag2) * z
        dz = dz + (self.W @ z.unsqueeze(-1)).squeeze(-1)
        return dz

    def forward(self, board_state):
        x = board_state.to(torch.float32)
        x = torch.log2(x.clamp(min=1)) / 11.0
        z0 = torch.polar(torch.ones(self.n), x * 2 * torch.pi).to(torch.cfloat)
        t_span = torch.linspace(0, self.dt * self.steps, self.steps)
        z_traj = odeint(self.dynamics, z0, t_span, method='rk4')
        z_final = z_traj[-1]
        feat = torch.cat([z_final.real, z_final.imag], dim=-1)
        return self.head(feat)

    def choose_move(self, board, valid_moves):
        # use ONN if trained, otherwise fall back to expectimax
        if not self.trained:
            return best_move_expectimax(board, valid_moves)

        flat = torch.tensor(board, dtype=torch.float32).flatten()
        with torch.no_grad():
            logits = self.forward(flat)
        mask = torch.full((4,), float('-inf'))
        for m in valid_moves:
            mask[m] = 0.0
        logits = logits + mask
        return int(torch.argmax(logits).item())


def load_agent():
    agent = HopfONN()
    try:
        agent.load_state_dict(torch.load("onn_weights.pt"))
        agent.trained = True
        print("Loaded trained ONN weights.")
    except FileNotFoundError:
        print("No trained weights found — using expectimax fallback.")
    return agent