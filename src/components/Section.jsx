export default function Section({ title, children, color = "teal" }) {
  const colors = {
    navy:  "#1e3a5f",
    teal:  "#0f766e",
    brown: "#a16a46",
    taupe: "#78716c",
    gray:  "#6b7280",
    // 後方互換
    blue:  "#1e3a5f",
    green: "#78716c",
    red:   "#6b7280",
  };
  const c = colors[color] || colors.teal;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        background: c, color: "#fff",
        padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.05em", marginBottom: 4
      }}>{title}</div>
      {children}
    </div>
  );
}
