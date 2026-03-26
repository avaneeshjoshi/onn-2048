"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Board from "@/components/Board";

type GameState = {
  board: number[][];
  score: number;
  over: boolean;
  direction?: "up" | "down" | "left" | "right";
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Home() {
  const [game, setGame] = useState<GameState>({
    board: Array.from({ length: 4 }, () => Array(4).fill(0)),
    score: 0,
    over: false,
  });
  const [lastMove, setLastMove] = useState<string>("waiting");
  const [lastDirection, setLastDirection] = useState<"up" | "down" | "left" | "right" | undefined>(undefined);
  const [moveCounter, setMoveCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const createGame = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setIsAutoPlay(false);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/new`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to create game (${res.status})`);
      const data = (await res.json()) as GameState;
      setGame(data);
      setLastMove("waiting");
      setLastDirection(undefined);
      setMoveCounter(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  const stepGame = useCallback(async () => {
    if (inFlightRef.current || game.over) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`Failed to step game (${res.status})`);
      const data = (await res.json()) as GameState & { error?: string };
      if (data.error) throw new Error(data.error);
      setGame(data);
      if (data.direction) {
        setLastMove(data.direction);
        setLastDirection(data.direction);
        setMoveCounter((prev) => prev + 1);
      }
      if (data.over) {
        setIsAutoPlay(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to step game");
      setIsAutoPlay(false);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [game.over]);

  useEffect(() => {
    void createGame();
  }, [createGame]);

  useEffect(() => {
    if (!isAutoPlay || game.over) return;
    const id = setInterval(() => {
      void stepGame();
    }, 450);
    return () => clearInterval(id);
  }, [isAutoPlay, game.over, stepGame]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--page-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          display: "grid",
          gap: 20,
          background: "var(--surface)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h1 style={{ margin: 0 }}>ONN 2048</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto minmax(160px, 220px)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <Board
            grid={game.board}
            score={game.score}
            isOver={game.over}
            isLoading={isLoading}
            isAutoPlay={isAutoPlay}
            lastDirection={lastDirection}
            moveCounter={moveCounter}
            onReset={createGame}
            onStep={stepGame}
            onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
          />
          <aside
            style={{
              border: "1px solid var(--surface-border)",
              borderRadius: 8,
              padding: 12,
              minHeight: 88,
              background: "var(--surface-muted)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 16 }}>ONN Move</h3>
            <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
              {error ? `error: ${error}` : isLoading ? "thinking..." : lastMove}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
