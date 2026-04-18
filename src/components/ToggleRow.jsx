import NumInput from "./NumInput";

export default function ToggleRow({ label, autoValue, manualValue, onManualChange, isAuto, onToggle, note, autoNote, mode = "規定" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #e8edf2", padding: "8px 0", gap: 8 }}>
      <div style={{ flex: "0 0 190px", fontSize: 13, color: "#374151", lineHeight: 1.4 }}>
        {label}
        {(isAuto ? autoNote : note) && (
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{isAuto ? autoNote : note}</div>
        )}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer", whiteSpace: "nowrap" }}>
        <input type="checkbox" checked={isAuto} onChange={e => onToggle(e.target.checked)}
          style={{ width: 14, height: 14, accentColor: "#2563eb" }} />
        <span style={{ fontSize: 10, color: isAuto ? "#2563eb" : "#9ca3af", fontWeight: 600 }}>{mode}</span>
      </label>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        {isAuto ? (
          <div style={{ flex: 1, padding: "6px 10px", background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 13, color: "#1e40af", textAlign: "right" }}>
            {autoValue != null ? `¥${Math.round(autoValue).toLocaleString()}` : "—"}
          </div>
        ) : (
          <NumInput value={manualValue} onChange={onManualChange}
            style={{ flex: 1, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, textAlign: "right", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" }} />
        )}
        <span style={{ fontSize: 12, color: "#6b7280", width: 14 }}>円</span>
      </div>
    </div>
  );
}
