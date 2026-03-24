type CommentaryProps = {
  message?: string;
};

export default function Commentary({
  message = "Welcome to ONN-2048. Hook this into your backend inference to show move reasoning.",
}: CommentaryProps) {
  return (
    <aside
      style={{
        border: "1px solid var(--surface-border)",
        borderRadius: 8,
        padding: 12,
        minHeight: 88,
        background: "var(--surface-muted)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 16 }}>Commentary</h3>
      <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
        {message}
      </p>
    </aside>
  );
}
