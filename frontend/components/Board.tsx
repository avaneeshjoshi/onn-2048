"use client";

import type { CSSProperties } from "react";

const TILE_SIZE = 64;
const TILE_GAP = 8;
const GRID_SIZE = 4;

function getPosition(index: number): number {
  return TILE_GAP + index * (TILE_SIZE + TILE_GAP);
}

function tileColor(value: number): string {
  if (value === 2) return "#eee4da";
  if (value === 4) return "#ede0c8";
  if (value === 8) return "#f2b179";
  if (value === 16) return "#f59563";
  if (value === 32) return "#f67c5f";
  if (value === 64) return "#f65e3b";
  if (value === 128) return "#edcf72";
  if (value === 256) return "#edcc61";
  if (value === 512) return "#edc850";
  if (value >= 1024) return "#edc53f";
  return "#cdc1b4";
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
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Score: {score}</h2>
      </div>
      <div
        style={{
          position: "relative",
          width: getPosition(GRID_SIZE),
          height: getPosition(GRID_SIZE),
          background: "#bbada0",
          borderRadius: 8,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const row = Math.floor(idx / GRID_SIZE);
          const col = idx % GRID_SIZE;
          return (
            <div
              key={`bg-${idx}`}
              style={{
                position: "absolute",
                top: getPosition(row),
                left: getPosition(col),
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: "#cdc1b4",
                borderRadius: 6,
              }}
            />
          );
        })}

        {safeGrid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            if (value === 0) return null;
            const slideClass = lastDirection ? `tile-slide-${lastDirection}` : undefined;
            return (
              <div
                key={`tile-${rowIndex}-${colIndex}-${moveCounter}`}
                className={slideClass}
                style={{
                  position: "absolute",
                  top: getPosition(rowIndex),
                  left: getPosition(colIndex),
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 6,
                  background: tileColor(value),
                  color: value <= 4 ? "#776e65" : "#f9f6f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: value > 512 ? 18 : 24,
                  fontWeight: 700,
                  boxShadow: value > 0 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  zIndex: 10,
                  transition:
                    "top 160ms var(--slide-ease), left 160ms var(--slide-ease), background-color 160ms ease, transform 160ms ease",
                }}
              >
                {value}
              </div>
            );
          }),
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => void onReset()}
          disabled={isLoading}
          style={buttonBaseStyle(isLoading, false)}
        >
          New Game
        </button>
        <button
          onClick={() => void onStep()}
          disabled={isLoading || isOver}
          style={buttonBaseStyle(isLoading || isOver, false)}
        >
          Next AI Move
        </button>
        <button
          onClick={onToggleAutoPlay}
          disabled={isLoading || isOver}
          style={buttonBaseStyle(isLoading || isOver, isAutoPlay)}
        >
          {isAutoPlay ? "Stop Auto Play" : "Start Auto Play"}
        </button>
      </div>
      {isOver ? (
        <div
          style={{
            padding: "12px",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            borderRadius: 6,
            fontWeight: 700,
            textAlign: "center",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          Game Over!
        </div>
      ) : null}
    </section>
  );
}

function buttonBaseStyle(isDisabled: boolean, isActive: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 6,
    padding: "10px 16px",
    background: isActive ? "#2563eb" : "var(--button-bg)",
    color: "var(--button-fg)",
    cursor: isDisabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    opacity: isDisabled ? 0.6 : 1,
    transition: "opacity 200ms ease, background-color 200ms ease",
  };
}
