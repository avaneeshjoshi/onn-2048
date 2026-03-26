"""
Train the Hopf ONN to imitate expectimax.

1. Run N self-play games using expectimax to generate (board, best_move) pairs
2. Train the ONN on those pairs via cross-entropy + BPTT through the ODE
3. Save weights to onn_weights.pt

Usage:
    python train.py --games 500 --epochs 20
"""

import argparse
import torch
import torch.nn as nn
import numpy as np
from tqdm import tqdm
from game import Game2048
from onn import HopfONN, best_move_expectimax

def collect_data(n_games=500):
    print(f"Collecting data from {n_games} expectimax games...")
    boards, labels = [], []
    for _ in tqdm(range(n_games)):
        g = Game2048()
        while not g.is_over():
            valid = g.valid_moves()
            move = best_move_expectimax(g.board.tolist(), valid)
            boards.append(g.board.flatten().copy())
            labels.append(move)
            g.move(move)
    print(f"Collected {len(boards)} board-move pairs.")
    return (
        torch.tensor(np.array(boards), dtype=torch.float32),
        torch.tensor(labels, dtype=torch.long)
    )


def train(boards, labels, epochs=20, batch_size=64, lr=1e-3):
    model = HopfONN()
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.CrossEntropyLoss()

    n = len(boards)
    print(f"Training ONN for {epochs} epochs on {n} samples...")

    for epoch in range(epochs):
        idx = torch.randperm(n)
        total_loss, correct = 0.0, 0

        for i in range(0, n, batch_size):
            batch_idx = idx[i:i+batch_size]
            bx = boards[batch_idx]
            by = labels[batch_idx]

            # forward pass (ODE solve + head)
            logits = torch.stack([model(bx[j]) for j in range(len(bx))])
            loss = loss_fn(logits, by)

            opt.zero_grad()
            loss.backward()
            # clip grads — ODE backprop can explode
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()

            total_loss += loss.item() * len(bx)
            correct += (logits.argmax(dim=1) == by).sum().item()

        acc = correct / n * 100
        avg_loss = total_loss / n
        print(f"Epoch {epoch+1}/{epochs} — loss: {avg_loss:.4f}, acc: {acc:.1f}%")

    torch.save(model.state_dict(), "onn_weights.pt")
    print("Saved weights to onn_weights.pt")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--games", type=int, default=500, help="Self-play games to collect")
    parser.add_argument("--epochs", type=int, default=20, help="Training epochs")
    parser.add_argument("--batch", type=int, default=64, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()

    boards, labels = collect_data(args.games)
    train(boards, labels, epochs=args.epochs, batch_size=args.batch, lr=args.lr)