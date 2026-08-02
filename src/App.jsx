import { useState } from "react";
import Seller from "./pages/Seller";
import Buyer from "./pages/Buyer";
import PrintView from "./components/PrintView";
import { initBuyer, normalizeBuyerData } from "./utils/buyerData";
import { initSeller, normalizeSellerData } from "./utils/sellerData";

const STORAGE_KEY = "shohi_cases";

export default function App() {
  const [tab, setTab] = useState("seller");
  const [seller, setSeller] = useState(() => normalizeSellerData(initSeller));
  const [buyer, setBuyer] = useState(() => normalizeBuyerData(initBuyer));
  const [savedCases, setSavedCases] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showList, setShowList] = useState(false);
  const [saving, setSaving] = useState(false);

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
      data: tab === "seller" ? normalizeSellerData(seller) : normalizeBuyerData(buyer),
    };
    const next = [entry, ...savedCases].slice(0, 50);
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedCases(next);
    setSaving(false);
  };

  const handleLoad = (entry) => {
    if (entry.type === "seller") {
      setSeller(normalizeSellerData(entry.data));
      setTab("seller");
    } else {
      setBuyer(normalizeBuyerData(entry.data));
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
    <div style={{ fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif", minHeight: "100vh", background: "#f9fafb" }}>
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
          .print-detail-table tr, .print-loan-comparison tr { break-inside: avoid; page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          h1, h2, h3 { margin: 4px 0 !important; }
          body, div, span, label { font-size: 11px !important; line-height: 1.4 !important; }
          .buyer-print-area { box-shadow: none !important; max-width: 100% !important; padding: 0 !important; }
          .buyer-print-area,
          .buyer-print-area div,
          .buyer-print-area span,
          .buyer-print-area label { font-size: 10px !important; line-height: 1.35 !important; }
          .buyer-print-area .print-document-title { font-size: 16px !important; line-height: 1.3 !important; }
          .buyer-print-area .print-document-meta { flex-wrap: wrap !important; gap: 3px 16px !important; }
          .buyer-print-area .print-document-meta span { font-size: 10px !important; line-height: 1.4 !important; }
          .buyer-print-area .print-detail-table th,
          .buyer-print-area .print-detail-table td { font-size: 10px !important; line-height: 1.25 !important; padding-top: 3px !important; padding-bottom: 3px !important; }
          .buyer-print-area .print-loan-comparison th span { font-size: 8px !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        input:focus { border-color: #1e3a5f !important; box-shadow: 0 0 0 2px #bfd0e4; }
        input, select, textarea { font-size: 16px !important; }
      `}</style>

      {/* 印刷用テーブルビュー */}
      <PrintView tab={tab} seller={seller} buyer={buyer} />

      {/* ヘッダー */}
      <div className="no-print app-header" style={{
        background: "#1e3a5f",
        padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "2px solid #d4a744"
      }}>
        <div>
          <div style={{ color: "#d4a744", fontSize: 10, letterSpacing: "0.2em", fontWeight: 600 }}>REAL ESTATE</div>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, letterSpacing: "0.05em" }}>諸費用計算書</div>
        </div>
        <div className="app-header-actions" style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowList(!showList)} style={{
            padding: "6px 14px", background: "transparent", border: "1px solid rgba(212,167,68,0.4)",
            borderRadius: 6, color: "#e0e7ee", fontSize: 12, cursor: "pointer"
          }}>📁 過去案件</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "6px 14px", background: "transparent", border: "1px solid rgba(212,167,68,0.4)",
            borderRadius: 6, color: "#e0e7ee", fontSize: 12, fontWeight: 500, cursor: "pointer"
          }}>{saving ? "保存中…" : "💾 保存"}</button>
          <button onClick={() => {
            try { window.print(); }
            catch { alert("印刷はブラウザのショートカット（Windows: Ctrl+P / Mac: Cmd+P）をお使いください"); }
          }} style={{
            padding: "6px 14px", background: "#d4a744", border: "1px solid #d4a744",
            borderRadius: 6, color: "#1e3a5f", fontSize: 12, fontWeight: 700, cursor: "pointer"
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
                  fontSize: 11, padding: "2px 8px", borderRadius: 4, marginRight: 8,
                  background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb"
                }}>{c.type === "seller" ? "売主" : "買主"}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>{c.date}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleLoad(c)} style={{
                  padding: "3px 10px", background: "#1e3a5f", border: "none", borderRadius: 4, color: "#fff", fontSize: 12, cursor: "pointer"
                }}>読込</button>
                <button onClick={() => handleDelete(c.id)} style={{
                  padding: "3px 10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, color: "#6b7280", fontSize: 12, cursor: "pointer"
                }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* タブ */}
      <div className="no-print" style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        {[["seller", "🏠 売主向け"], ["buyer", "🔑 買主向け"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: "14px", border: "none",
            borderBottom: tab === key ? "2px solid #1e3a5f" : "2px solid transparent",
            background: "#fff",
            fontSize: 14, fontWeight: tab === key ? 700 : 500,
            color: tab === key ? "#1e3a5f" : "#6b7280",
            cursor: "pointer", transition: "all 0.15s",
            letterSpacing: "0.03em"
          }}>{label}</button>
        ))}
      </div>

      {/* 本体（印刷時は非表示） */}
      <div className="no-print app-main" style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 40px" }}>
        {tab === "seller" && <Seller seller={seller} setS={setS} />}
        {tab === "buyer" && <Buyer buyer={buyer} setB={setB} />}
      </div>
    </div>
  );
}
