export default function Section({ title, children, color = "blue" }) {
  const gradients = {
    blue:  "linear-gradient(90deg,#1e3a5f,#2563eb)",
    red:   "linear-gradient(90deg,#7f1d1d,#dc2626)",
    green: "linear-gradient(90deg,#14532d,#16a34a)",
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        background: gradients[color] || gradients.blue, color: "#fff",
        padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
        letterSpacing: "0.05em", marginBottom: 4
      }}>{title}</div>
      {children}
    </div>
  );
}
