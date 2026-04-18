import NumInput from "./NumInput";
import { parseNum } from "../utils/calc";

export default function Row({ label, value, onChange, auto, unit = "円", note }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", borderBottom: "1px solid #e8edf2",
      padding: "8px 0", gap: 8
    }}>
      <div style={{ flex: "0 0 200px", fontSize: 13, color: "#374151", lineHeight: 1.4 }}>
        {label}
        {note && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{note}</div>}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        {auto ? (
          <div style={{
            flex: 1, padding: "6px 10px", background: "#f0f7ff", border: "1px solid #bfdbfe",
            borderRadius: 6, fontSize: 13, color: "#1e40af", textAlign: "right"
          }}>
            {value != null && value !== "" ? `¥${Math.round(parseNum(value)).toLocaleString()}` : "—"}
          </div>
        ) : (
          <NumInput
            value={value}
            onChange={onChange}
            style={{
              flex: 1, padding: "6px 10px", border: "1px solid #d1d5db",
              borderRadius: 6, fontSize: 13, textAlign: "right",
              outline: "none", background: "#fff", width: "100%", boxSizing: "border-box"
            }}
          />
        )}
        <span style={{ fontSize: 12, color: "#6b7280", width: 14 }}>{unit}</span>
      </div>
    </div>
  );
}
