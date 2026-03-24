"use client";

import { useEffect, useState } from "react";

const GRID_SIZE = 4;

function createGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function getEmptyCells(grid: number[][]): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid: number[][]): number[][] {
  const next = grid.map((row) => [...row]);
  const empty = getEmptyCells(next);
  if (!empty.length) return next;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function initGrid(): number[][] {
  return addRandomTile(addRandomTile(createGrid()));
}

function tileColor(value: number): string {
  if (value === 0) return "#cdc1b4";
  if (value <= 4) return "#eee4da";
  if (value <= 16) return "#f2b179";
  if (value <= 64) return "#f65e3b";
  if (value <= 256) return "#edcc61";
  if (value <= 1024) return "#edc53f";
  return "#edc22e";
}

export default function Board() {
  const [grid, setGrid] = useState<number[][]>(createGrid);

  useEffect(() => {
    setGrid(initGrid());
  }, []);

  const handleReset = () => setGrid(initGrid());

  return (
    <section>
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
        {grid.flat().map((value, idx) => (
          <div
            key={idx}
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
            }}
          >
            {value || ""}
          </div>
        ))}
      </div>
      <button
        onClick={handleReset}
        style={{
          marginTop: 12,
          border: "none",
          borderRadius: 6,
          padding: "8px 14px",
          background: "var(--button-bg)",
          color: "var(--button-fg)",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Reset Board
      </button>
    </section>
  );
}
