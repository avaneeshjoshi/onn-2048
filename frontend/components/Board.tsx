"use client";

function tileColor(value: number): string {
  if (value === 0) return "#cdc1b4";
  if (value <= 4) return "#eee4da";
  if (value <= 16) return "#f2b179";
  if (value <= 64) return "#f65e3b";
  if (value <= 256) return "#edcc61";
  if (value <= 1024) return "#edc53f";
  return "#edc22e";
}

type BoardProps = {
  grid: number[][];
  score: number;
  isOver: boolean;
  isLoading: boolean;
  isAutoPlay: boolean;
  lastDirection?: "up" | "down" | "left" | "right";
  moveCounter: number;
  onReset: () => void | Promise<void>;
  onStep: () => void | Promise<void>;
  onToggleAutoPlay: () => void;
};

export default function Board({
  grid,
  score,
  isOver,
  isLoading,
  isAutoPlay,
  lastDirection,
  moveCounter,
  onReset,
  onStep,
  onToggleAutoPlay,
}: BoardProps) {
  const safeGrid =
    grid.length === 4 && grid.every((row) => row.length === 4)
      ? grid
      : Array.from({ length: 4 }, () => Array(4).fill(0));

  return (
    <section>
      <p style={{ marginTop: 0, marginBottom: 12, fontWeight: 700 }}>Score: {score}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(48px, 64px))",
          gap: 8,
          background: "#bbada0",
          padding: 8,
          borderRadius: 8,
        }}
      >
        {safeGrid.flat().map((value, idx) => (
          <div
            key={`${idx}-${moveCounter}`}
            className={value > 0 && lastDirection ? `tile-slide-${lastDirection}` : undefined}
            style={{
              width: 64,
              height: 64,
              borderRadius: 6,
              background: tileColor(value),
              color: value <= 4 ? "#776e65" : "#f9f6f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              transition:
                "background-color 240ms ease, color 240ms ease, transform 240ms ease",
            }}
          >
            {value || ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => void onReset()}
          disabled={isLoading}
          style={{
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            background: "var(--button-bg)",
            color: "var(--button-fg)",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          New Game
        </button>
        <button
          onClick={() => void onStep()}
          disabled={isLoading || isOver}
          style={{
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            background: "var(--button-bg)",
            color: "var(--button-fg)",
            cursor: isLoading || isOver ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isLoading || isOver ? 0.7 : 1,
          }}
        >
          Next AI Move
        </button>
        <button
          onClick={onToggleAutoPlay}
          disabled={isLoading || isOver}
          style={{
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            background: isAutoPlay ? "#2563eb" : "var(--button-bg)",
            color: "var(--button-fg)",
            cursor: isLoading || isOver ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isLoading || isOver ? 0.7 : 1,
          }}
        >
          {isAutoPlay ? "Stop Auto Play" : "Start Auto Play"}
        </button>
      </div>
      {isOver ? <p style={{ marginBottom: 0 }}>Game over.</p> : null}
    </section>
  );
}
