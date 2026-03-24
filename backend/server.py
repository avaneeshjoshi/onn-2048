from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from game import Game2048
from onn import load_agent
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

games: dict[str, Game2048] = {}
agent = load_agent()

@app.post("/new")
def new_game():
    games["game1"] = Game2048()
    return games["game1"].state_dict()

@app.post("/step")
def step(body: dict):
    g = games.get("game1")
    if g is None or g.is_over():
        return {"error": "game over or not started"}

    valid = g.valid_moves()
    move = agent.choose_move(g.board.tolist(), valid)
    g.move(move)

    return {
        **g.state_dict(),
        "move": move,
        "direction": ["up", "down", "left", "right"][move],
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)