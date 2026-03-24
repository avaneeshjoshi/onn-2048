import torch
import torch.nn as nn
from torchdiffeq import odeint

class HopfONN(nn.Module):
    """
    16 Hopf oscillators (one per board tile), complex-valued.
    Phase-locks to one of 4 attractor states = move direction.
    """
    def __init__(self, n=16, alpha=1.0, dt=0.5, steps=20):
        super().__init__()
        self.n = n
        self.alpha = alpha
        self.dt = dt
        self.steps = steps
        self.W = nn.Parameter(torch.randn(n, n, dtype=torch.cfloat) * 0.1)
        self.head = nn.Linear(n * 2, 4)  # real + imag concat -> 4 directions

    def dynamics(self, t, z):
        mag2 = z.real**2 + z.imag**2
        dz = (self.alpha + 1j * torch.ones(self.n) - mag2) * z
        dz = dz + (self.W @ z.unsqueeze(-1)).squeeze(-1)
        return dz

    def forward(self, board_state):
        x = board_state.to(torch.float32)
        x = torch.log2(x.clamp(min=1)) / 11.0  # normalize to 0-1
        z0 = torch.polar(torch.ones(self.n), x * 2 * torch.pi).to(torch.cfloat)

        t_span = torch.linspace(0, self.dt * self.steps, self.steps)
        z_traj = odeint(self.dynamics, z0, t_span, method='rk4')
        z_final = z_traj[-1]

        feat = torch.cat([z_final.real, z_final.imag], dim=-1)
        return self.head(feat)

    def choose_move(self, board, valid_moves):
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
    # load pretrained weights here if available:
    # agent.load_state_dict(torch.load("onn_weights.pt"))
    return agent