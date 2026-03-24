from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()


DIRECTIONS = ["up", "down", "left", "right"]
client = Groq()

def commentary(board, move, score):
    direction = DIRECTIONS[move]
    flat = [v for row in board for v in row if v > 0]
    max_tile = max(flat) if flat else 0

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": (
                    f"Board max tile: {max_tile}. Score: {score}. "
                    f"The AI just chose to move {direction}. "
                    f"Explain why this move makes sense strategically."
                )
            }
        ],
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        reasoning_effort="medium",
        stream=True,
        stop=None
    )

    output = []
    for chunk in completion:
        text = chunk.choices[0].delta.content or ""
        print(text, end="")
        output.append(text)
    return "".join(output).strip()