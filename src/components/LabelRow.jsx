import NumInput from "./NumInput";

export default function LabelRow({ label, value, onChange, placeholder = "項目名" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #e8edf2", padding: "8px 0" }}>
      <input
        type="text"
        value={label}
        onChange={e => onChange("label", e.target.value)}
        placeholder={placeholder}
        style={{ flex: "0 0 200px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}
      />
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <NumInput
          value={value}
          onChange={v => onChange("value", v)}
          style={{ flex: 1, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, textAlign: "right", width: "100%", boxSizing: "border-box" }}
        />
        <span style={{ fontSize: 12, color: "#6b7280", width: 14 }}>円</span>
      </div>
    </div>
  );
}
