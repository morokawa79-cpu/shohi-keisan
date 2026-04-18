import { useState, useEffect } from "react";
import Seller, { initSeller } from "./pages/Seller";
import Buyer, { initBuyer } from "./pages/Buyer";

const STORAGE_KEY = "shohi_cases";

export default function App() {
  const [tab, setTab] = useState("seller");
  const [seller, setSeller] = useState(initSeller);
  const [buyer, setBuyer] = useState(initBuyer);
  const [savedCases, setSavedCases] = useState([]);
  const [showList, setShowList] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setSavedCases(JSON.parse(raw)); } catch {}
    }
  }, []);

  const setS = (key, val) => setSeller(p => ({ ...p, [key]: val }));
  const setB = (key, val) => setBuyer(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    const name = tab === "seller"
      ? (seller.caseNameS || seller.customerNameS || "無題（売主）")
      : (buyer.caseNameB || buyer.customerNameB || "無題（買主）");
    const entry = {
      id: Date.now(),
      name,
      type: tab,
      date: new Date().toISOString().slice(0, 10),
      data: tab === "seller" ? seller : buyer,
    };
    const next = [entry, ...savedCases].slice(0, 50);
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedCases(next);
    setSaving(false);
  };

  const handleLoad = (entry) => {
    if (entry.type === "seller") {
      setSeller(entry.data);
      setTab("seller");
    } else {
      setBuyer(entry.data);
      setTab("buyer");
    }
    setShowList(false);
  };

  const handleDelete = (id) => {
    const next = savedCases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedCases(next);
  };

  return (
    <div style={{ fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif", minHeight: "100vh", background: "#f3f6fa" }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 10mm; }
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-area { box-shadow: none !important; max-width: 100% !important; padding: 0 !important; }
          input[type="text"], input[type="date"] {
            border: none !important;
            border-bottom: 1px solid #9ca3af !important;
            border-radius: 0 !important;
            background: transparent !important;
            padding: 2px 4px !important;
            font-size: 12px !important;
          }
          section, .print-block { break-inside: avoid; page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          h1, h2, h3 { margin: 4px 0 !important; }
          body, div, span, label { font-size: 11px !important; line-height: 1.4 !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 2px #bfdbfe; }
        input, select, textarea { font-size: 16px !important; }
      `}</style>

      {/* 印刷時のみ表示されるヘッダー */}
      <div className="print-only" style={{ padding: "8px 16px", borderBottom: "2px solid #1e3a5f", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f" }}>
          不動産諸費用計算書（{tab === "seller" ? "売主向け" : "買主向け"}）
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          {tab === "seller"
            ? `${seller.caseNameS || ""} / ${seller.customerNameS || ""} / ${seller.dateS}`
            : `${buyer.caseNameB || ""} / ${buyer.customerNameB || ""} / ${buyer.dateB}`}
        </div>
      </div>

      {/* ヘッダー */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ color: "#93c5fd", fontSize: 11, letterSpacing: "0.1em" }}>REAL ESTATE</div>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>諸費用計算書</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowList(!showList)} style={{
            padding: "6px 14px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer"
          }}>📁 過去案件</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "6px 14px", background: "#f59e0b", border: "none",
            borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>{saving ? "保存中…" : "💾 保存"}</button>
          <button onClick={() => {
            try { window.print(); }
            catch { alert("印刷はブラウザのショートカット（Windows: Ctrl+P / Mac: Cmd+P）をお使いください"); }
          }} style={{
            padding: "6px 14px", background: "#10b981", border: "none",
            borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>🖨️ 印刷 (Ctrl+P)</button>
        </div>
      </div>

      {/* 過去案件リスト */}
      {showList && (
        <div className="no-print" style={{
          background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 20px", maxHeight: 260, overflowY: "auto"
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#374151" }}>保存済み案件</div>
          {savedCases.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>まだ保存された案件はありません</div>
          ) : savedCases.map(c => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 6, background: "#f9fafb"
            }}>
              <div>
                <span style={{
                  fontSize: 11, padding: "2px 6px", borderRadius: 4, marginRight: 8,
                  background: c.type === "seller" ? "#fef3c7" : "#dbeafe",
                  color: c.type === "seller" ? "#92400e" : "#1e40af"
                }}>{c.type === "seller" ? "売主" : "買主"}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>{c.date}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleLoad(c)} style={{
                  padding: "3px 10px", background: "#2563eb", border: "none", borderRadius: 4, color: "#fff", fontSize: 12, cursor: "pointer"
                }}>読込</button>
                <button onClick={() => handleDelete(c.id)} style={{
                  padding: "3px 10px", background: "#ef4444", border: "none", borderRadius: 4, color: "#fff", fontSize: 12, cursor: "pointer"
                }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* タブ */}
      <div className="no-print" style={{ display: "flex", background: "#fff" }}>
        {[["seller", "🏠 売主向け", "#dc2626", "#fef2f2"], ["buyer", "🔑 買主向け", "#15803d", "#f0fdf4"]].map(([key, label, activeColor, activeBg]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: "12px", border: "none",
            borderBottom: tab === key ? `3px solid ${activeColor}` : "3px solid #e5e7eb",
            background: tab === key ? activeBg : "#fff",
            fontSize: 14, fontWeight: tab === key ? 700 : 400,
            color: tab === key ? activeColor : "#6b7280",
            cursor: "pointer", transition: "all 0.2s"
          }}>{label}</button>
        ))}
      </div>

      {/* 本体 */}
      <div className="print-area" style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 40px" }}>
        {tab === "seller" && <Seller seller={seller} setS={setS} />}
        {tab === "buyer" && <Buyer buyer={buyer} setB={setB} />}
      </div>
    </div>
  );
}
