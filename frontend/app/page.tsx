import Board from "@/components/Board";
import Commentary from "@/components/Commentary";

export default function Home() {
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
        <Board />
        <Commentary />
      </div>
    </main>
  );
}
