import Row from "../components/Row";
import ToggleRow from "../components/ToggleRow";
import LabelRow from "../components/LabelRow";
import Section from "../components/Section";
import {
  parseNum,
  calcChuko,
  calcInshiBaibai,
  calcSellerExpense,
  calcJotoZei,
} from "../utils/calc";

export const initSeller = {
  caseNameS: "",
  customerNameS: "",
  dateS: new Date().toISOString().slice(0, 10),
  salePriceS: "",
  koteishisanS: "",
  kanrisei: "",
  autoChukoS: true,
  manualChukoS: "",
  // ── 譲渡費用OK（税額計算に算入）
  kaitai: "",
  metshitsu: "50000",
  sokuryo: "",
  otherJoto: "",
  otherJotoLabel: "その他（譲渡費用算入可）",
  // ── 経費NG（手残りに影響・税額には含まれない）
  teitoSetsu: "",
  jushoHenko: "",
  kenrishoPunshitsu: "",
  souzokuToroku: "",
  ihinZanchi: "",
  ihinZanchiJoto: false,  // false=デフォルトNG（買主要求など特殊事情の場合のみOKに）
  hikkoshi: "",
  otherS: "",
  otherSLabel: "その他",
  // 旧フィールド（後方互換）
  otherS2: "", otherS2Label: "その他",
  otherS3: "", otherS3Label: "その他",
  nebiki: "",
  // ── 譲渡所得税
  taxKubun: "long",
  shotokuhi5pct: true,
  shotokuhi: "",
  kojo3000: false,
  kojoDate: "",
  kojo3000Sozoku: false,
  sozokuDate: "",
  teiMiriyo: false,
  keigenZeiritsu: false,
};

export default function Seller({ seller, setS }) {
  const sellerPrice = parseNum(seller.salePriceS);
  const tax = calcJotoZei(seller);

  return (
    <div>
      {/* 案件情報 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>案件名</label>
            <input value={seller.caseNameS} onChange={e => setS("caseNameS", e.target.value)}
              placeholder="例：水戸市〇〇町 戸建" style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>売主様名</label>
            <input value={seller.customerNameS} onChange={e => setS("customerNameS", e.target.value)}
              placeholder="〇〇 様" style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>作成日</label>
            <input type="date" value={seller.dateS} onChange={e => setS("dateS", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
      </div>

      {/* ▼ 収入ブロック */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "2px solid #bbf7d0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "2px solid #bbf7d0", paddingBottom: 8 }}>
          <span style={{ fontSize: 18 }}>📥</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#15803d" }}>収　入</span>
        </div>

        <Row label="売却価格" value={seller.salePriceS} onChange={v => setS("salePriceS", v)} />
        <Row label="固定資産税・都市計画税精算金" value={seller.koteishisanS} onChange={v => setS("koteishisanS", v)} note="買主から受取（日割り）" />
        <Row label="管理費・修繕積立金精算" value={seller.kanrisei} onChange={v => setS("kanrisei", v)} note="買主から受取（日割り）・マンション用" />

        {(() => {
          const incomeTotal = sellerPrice + parseNum(seller.koteishisanS) + parseNum(seller.kanrisei);
          return (
            <div style={{ marginTop: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>収入合計</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#15803d" }}>
                {incomeTotal > 0 ? `¥${incomeTotal.toLocaleString()}` : "—"}
              </span>
            </div>
          );
        })()}
      </div>

      {/* ▼ 経費ブロック */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "2px solid #fecaca" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "2px solid #fecaca", paddingBottom: 8 }}>
          <span style={{ fontSize: 18 }}>📤</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#dc2626" }}>経　費（支出）</span>
        </div>

        {/* ── 譲渡費用OK ─────────────────────────── */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6 }}>
            ✅ 譲渡費用 or 取得費（税額計算に算入・ここが多いほど税金が減る）
          </div>
          <ToggleRow
            label="仲介手数料（消費税込）"
            autoValue={calcChuko(sellerPrice)}
            manualValue={seller.manualChukoS}
            onManualChange={v => setS("manualChukoS", v)}
            isAuto={seller.autoChukoS !== false}
            onToggle={v => setS("autoChukoS", v)}
            autoNote="上限額自動計算"
            note="実額を入力"
          />
          <Row label="印紙代（売買契約書）" value={calcInshiBaibai(sellerPrice)} auto note="軽減税率適用" />
          <Row label="解体費用" value={seller.kaitai} onChange={v => setS("kaitai", v)} note="売却のために必要な場合" />
          <Row label="建物滅失登記費用" value={seller.metshitsu} onChange={v => setS("metshitsu", v)} note="土地家屋調査士概算" />
          <Row label="測量費用（確定測量等）" value={seller.sokuryo} onChange={v => setS("sokuryo", v)} />
          <Row label="相続登記費用（取得費）" value={seller.souzokuToroku} onChange={v => setS("souzokuToroku", v)} note="相続で取得した物件の登記費用・取得費として算入可" />
          {seller.ihinZanchiJoto !== false && (
            <div>
              <Row label="遺品整理・残置物撤去費用" value={seller.ihinZanchi} onChange={v => setS("ihinZanchi", v)} note="売買条件として必要な場合は算入可" />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#1d4ed8", paddingLeft: 8, paddingBottom: 6, cursor: "pointer" }}>
                <input type="checkbox" checked onChange={e => setS("ihinZanchiJoto", e.target.checked)} style={{ accentColor: "#1d4ed8" }} />
                ✅ 譲渡費用として算入中　（チェックを外すとNG欄へ移動）
              </label>
            </div>
          )}
          <LabelRow
            label={seller.otherJotoLabel}
            value={seller.otherJoto}
            onChange={(f, v) => f === "label" ? setS("otherJotoLabel", v) : setS("otherJoto", v)}
            placeholder="その他（譲渡費用算入可）"
          />
        </div>

        {/* ── 経費NG ──────────────────────────────── */}
        <div style={{ background: "#f9fafb", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
            ❌ その他経費（手残りに影響・税額計算には含まれない）
          </div>
          <Row label="抵当権抹消登記費用" value={seller.teitoSetsu} onChange={v => setS("teitoSetsu", v)} note="司法書士報酬込・概算" />
          <Row label="住所変更登記費用" value={seller.jushoHenko} onChange={v => setS("jushoHenko", v)} note="司法書士報酬込・概算" />
          <Row label="権利書紛失（本人確認情報）" value={seller.kenrishoPunshitsu} onChange={v => setS("kenrishoPunshitsu", v)} note="司法書士報酬概算" />
          {seller.ihinZanchiJoto === false && (
            <div>
              <Row label="遺品整理・残置物撤去費用" value={seller.ihinZanchi} onChange={v => setS("ihinZanchi", v)} note="個人的な理由での処分は譲渡費用不可" />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", paddingLeft: 8, paddingBottom: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={false} onChange={e => setS("ihinZanchiJoto", e.target.checked)} style={{ accentColor: "#1d4ed8" }} />
                ❌ 譲渡費用に算入しない　（チェックを入れるとOK欄へ移動）
              </label>
            </div>
          )}
          <Row label="引越し費用" value={seller.hikkoshi} onChange={v => setS("hikkoshi", v)} />
          <LabelRow
            label={seller.otherSLabel}
            value={seller.otherS}
            onChange={(f, v) => f === "label" ? setS("otherSLabel", v) : setS("otherS", v)}
          />
        </div>

        {(() => {
          const exp = calcSellerExpense(seller);
          const incomeTotal = sellerPrice + parseNum(seller.koteishisanS) + parseNum(seller.kanrisei);
          const zanzei = incomeTotal - exp;
          return (
            <>
              <div style={{ marginTop: 4, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>経費小計（税除く）</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>▲ ¥{exp.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 8, background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0369a1" }}>小計（税引前・経費除く）</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0369a1" }}>¥{zanzei.toLocaleString()}</span>
              </div>
            </>
          );
        })()}
      </div>

      {/* ▼ 譲渡所得税セクション */}
      {(() => {
        const CB = ({ field, label }) => (
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #e8edf2", cursor: "pointer", fontSize: 13, color: "#374151" }}>
            <input type="checkbox" checked={seller[field]}
              onChange={e => setS(field, e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer" }} />
            {label}
          </label>
        );
        return (
          <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "2px solid #e0e7ff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "2px solid #e0e7ff", paddingBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🧮</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#4338ca" }}>譲渡所得税（概算）</span>
              <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>※税理士にご確認ください</span>
            </div>

            {/* 取得費 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>▶ 取得費</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={seller.shotokuhi5pct}
                  onChange={e => setS("shotokuhi5pct", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
                概算取得費（売却価格×5%）を使用
                {seller.shotokuhi5pct && sellerPrice > 0 &&
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>= ¥{(sellerPrice * 0.05).toLocaleString()}</span>}
              </label>
              {!seller.shotokuhi5pct && (
                <Row label="実際の取得費" value={seller.shotokuhi} onChange={v => setS("shotokuhi", v)} note="購入価格＋購入時諸費用" />
              )}
            </div>

            {/* 所有期間 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>▶ 所有期間</div>
              <div style={{ display: "flex", gap: 16 }}>
                {[["long","長期譲渡（5年超）20.315%"],["short","短期譲渡（5年以下）39.63%"]].map(([val, lbl]) => (
                  <label key={val} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="radio" name="taxKubun" value={val}
                      checked={seller.taxKubun === val}
                      onChange={() => setS("taxKubun", val)}
                      style={{ accentColor: "#2563eb" }} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* 控除チェックボックス */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>▶ 特別控除・特例</div>

              {/* マイホーム3000万 */}
              <div style={{ borderBottom: "1px solid #e8edf2", paddingBottom: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151", paddingTop: 7 }}>
                  <input type="checkbox" checked={seller.kojo3000}
                    onChange={e => setS("kojo3000", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb", marginTop: 2 }} />
                  <span>3,000万円特別控除（マイホーム売却）<br/>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>※居住用・親族売却不可・前年前々年に未使用</span>
                  </span>
                </label>
                {seller.kojo3000 && (
                  <>
                    <div style={{ marginLeft: 24, marginTop: 6 }}>
                      <label style={{ fontSize: 12, color: "#6b7280" }}>住まなくなった日</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <input type="date" value={seller.kojoDate} onChange={e => setS("kojoDate", e.target.value)}
                          style={{ padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                        {seller.kojoDate && (() => {
                          const d = new Date(seller.kojoDate);
                          const limit = new Date(d.getFullYear() + 3, 11, 31);
                          const ok = new Date() <= limit;
                          return <span style={{ fontSize: 12, fontWeight: 600, color: ok ? "#15803d" : "#dc2626" }}>
                            期限：{limit.getFullYear()}/12/31　{ok ? "✅ 期限内" : "❌ 期限切れ"}
                          </span>;
                        })()}
                      </div>
                    </div>
                    <div style={{ marginLeft: 24, marginTop: 8, background: "#fef9c3", borderRadius: 8, padding: "10px 12px", border: "1px solid #fde047" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>⚠️ 適用前に必ず確認</div>
                      {[
                        { key: "m3k_check1", label: "売主本人が居住していたことを確認した" },
                        { key: "m3k_check2", label: "住まなくなってから3年以内の売却であることを確認した" },
                        { key: "m3k_check3", label: "親族・特別関係者への売却でないことを確認した" },
                        { key: "m3k_check4", label: "前年・前々年に同特例を使用していないことを確認した" },
                      ].map(({ key, label }) => (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #fde047", cursor: "pointer", fontSize: 12, color: "#78350f" }}>
                          <input type="checkbox" checked={!!seller[key]} onChange={e => setS(key, e.target.checked)}
                            style={{ width: 15, height: 15, accentColor: "#d97706" }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 相続空き家3000万 */}
              <div style={{ borderBottom: "1px solid #e8edf2", paddingBottom: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151", paddingTop: 7 }}>
                  <input type="checkbox" checked={seller.kojo3000Sozoku}
                    onChange={e => setS("kojo3000Sozoku", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb", marginTop: 2 }} />
                  <span>3,000万円特別控除（相続空き家）<br/>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>※旧耐震S56.5.31以前・戸建のみ・1億円以下・相続人3人以上は2,000万・R9年末まで</span>
                  </span>
                </label>
                {seller.kojo3000Sozoku && sellerPrice > 100000000 && (
                  <div style={{ marginLeft: 24, marginTop: 6, padding: "6px 10px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                    ❌ 売却価格が1億円を超えているため本特例は適用できません
                  </div>
                )}
                {seller.kojo3000Sozoku && (
                  <>
                    <div style={{ marginLeft: 24, marginTop: 6 }}>
                      <label style={{ fontSize: 12, color: "#6b7280" }}>相続開始日</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <input type="date" value={seller.sozokuDate} onChange={e => setS("sozokuDate", e.target.value)}
                          style={{ padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
                        {seller.sozokuDate && (() => {
                          const d = new Date(seller.sozokuDate);
                          const limit = new Date(d.getFullYear() + 3, 11, 31);
                          const ok = new Date() <= limit;
                          return <span style={{ fontSize: 12, fontWeight: 600, color: ok ? "#15803d" : "#dc2626" }}>
                            期限：{limit.getFullYear()}/12/31　{ok ? "✅ 期限内" : "❌ 期限切れ"}
                          </span>;
                        })()}
                      </div>
                    </div>
                    <div style={{ marginLeft: 24, marginTop: 8, background: "#fef9c3", borderRadius: 8, padding: "10px 12px", border: "1px solid #fde047" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>⚠️ 適用前に必ず確認</div>
                      {[
                        { key: "sz_check1", label: "昭和56年5月31日以前建築の戸建であることを確認した" },
                        { key: "sz_check2", label: "相続から売却まで空き家のままであることを確認した（貸出・居住なし）" },
                        { key: "sz_check3", label: "売却価格が1億円以下であることを確認した" },
                        { key: "sz_check4", label: "相続人が3人以上の場合、控除額が2,000万円になることを説明した" },
                        { key: "sz_check5", label: "耐震改修または解体済み（買主が行う場合は翌年2月15日まで）を確認した" },
                      ].map(({ key, label }) => (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #fde047", cursor: "pointer", fontSize: 12, color: "#78350f" }}>
                          <input type="checkbox" checked={!!seller[key]} onChange={e => setS(key, e.target.checked)}
                            style={{ width: 15, height: 15, accentColor: "#d97706" }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 低未利用地 */}
              <div style={{ borderBottom: "1px solid #e8edf2", paddingBottom: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151", paddingTop: 7 }}>
                  <input type="checkbox" checked={seller.teiMiriyo}
                    onChange={e => setS("teiMiriyo", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb", marginTop: 2 }} />
                  <span>低未利用地の特例（100万円控除）<br/>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>※長期譲渡のみ・500万円以下（一定の場合800万円以下）・都市計画区域内・R7年末まで</span>
                  </span>
                </label>
                {seller.teiMiriyo && (
                  <div style={{ marginLeft: 24, marginTop: 8, background: "#fef9c3", borderRadius: 8, padding: "10px 12px", border: "1px solid #fde047" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>⚠️ 適用前に必ず確認</div>
                    {[
                      { key: "tm_check1", label: "都市計画区域内の土地であることを確認した" },
                      { key: "tm_check2", label: "所有期間が5年を超えている（長期譲渡）ことを確認した" },
                      { key: "tm_check3", label: "売却価格が500万円以下（一定の場合800万円以下）であることを確認した" },
                      { key: "tm_check4", label: "低未利用の状態（空き地・空き家等）であることを確認した" },
                      { key: "tm_check5", label: "市区町村に確認書申請が必要なことを説明した" },
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #fde047", cursor: "pointer", fontSize: 12, color: "#78350f" }}>
                        <input type="checkbox" checked={!!seller[key]} onChange={e => setS(key, e.target.checked)}
                          style={{ width: 15, height: 15, accentColor: "#d97706" }} />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 居住用軽減税率 */}
              <div style={{ paddingTop: 7 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                  <input type="checkbox" checked={seller.keigenZeiritsu}
                    onChange={e => setS("keigenZeiritsu", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb", marginTop: 2 }} />
                  <span>居住用財産の軽減税率（14.21%・6,000万以下部分）<br/>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>※所有10年超・居住用のみ・3,000万控除と併用可・相続人が居住していない場合は適用外</span>
                  </span>
                </label>
                {seller.keigenZeiritsu && (
                  <div style={{ marginLeft: 24, marginTop: 8, background: "#fef9c3", borderRadius: 8, padding: "10px 12px", border: "1px solid #fde047" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>⚠️ 適用前に必ず確認</div>
                    {[
                      { key: "kei_check1", label: "売主本人が居住していたことを確認した" },
                      { key: "kei_check2", label: "所有期間が10年を超えていることを確認した" },
                      { key: "kei_check3", label: "相続案件の場合：相続人自身が居住していたことを確認した" },
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #fde047", cursor: "pointer", fontSize: 12, color: "#78350f" }}>
                        <input type="checkbox" checked={!!seller[key]}
                          onChange={e => setS(key, e.target.checked)}
                          style={{ width: 15, height: 15, accentColor: "#d97706" }} />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })()}

      {/* ▼ 精算サマリー表 */}
      {(() => {
        const koteishisan = parseNum(seller.koteishisanS);
        const kanri       = parseNum(seller.kanrisei);
        const incomeTotal = sellerPrice + koteishisan + kanri;
        const expense     = calcSellerExpense(seller);
        const final       = incomeTotal - expense - tax.zei;

        if (!sellerPrice) return (
          <div style={{ background: "#f3f6fa", borderRadius: 10, padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: 13, border: "1px dashed #d1d5db" }}>
            売却価格を入力すると計算されます
          </div>
        );

        // 各経費項目
        const chuko    = seller.autoChukoS !== false ? calcChuko(sellerPrice) : parseNum(seller.manualChukoS);
        const inshi    = calcInshiBaibai(sellerPrice);
        const kaitai   = parseNum(seller.kaitai);
        const metsu    = parseNum(seller.metshitsu);
        const sokuryo  = parseNum(seller.sokuryo);
        const sozoku   = parseNum(seller.souzokuToroku);
        const ihin     = seller.ihinZanchiJoto !== false ? parseNum(seller.ihinZanchi) : 0;
        const otherJ   = parseNum(seller.otherJoto);
        const teito    = parseNum(seller.teitoSetsu);
        const jusho    = parseNum(seller.jushoHenko);
        const kenri    = parseNum(seller.kenrishoPunshitsu);
        const ihinNG   = seller.ihinZanchiJoto === false ? parseNum(seller.ihinZanchi) : 0;
        const hikkoshi = parseNum(seller.hikkoshi);
        const otherS   = parseNum(seller.otherS);

        const Row2 = ({ label, value, indent, bold, headBg, headColor, total, borderTop }) => {
          if (headBg) return (
            <div style={{ background: headBg, color: headColor || "#fff", padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>{label}</div>
          );
          const isTotal = total || bold;
          return (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 12px", paddingLeft: indent ? 24 : 12,
              borderTop: borderTop ? "2px solid #374151" : "1px solid #e5e7eb",
              background: isTotal ? "#f8fafc" : "transparent",
            }}>
              <span style={{ fontSize: 12, fontWeight: isTotal ? 700 : 400, color: "#374151" }}>{label}</span>
              <span style={{ fontSize: isTotal ? 14 : 12, fontWeight: isTotal ? 700 : 400, color: value?.startsWith("▲") ? "#dc2626" : "#111", fontVariantNumeric: "tabular-nums" }}>{value}</span>
            </div>
          );
        };

        const yen2  = n => n > 0 ? `¥${Math.round(n).toLocaleString()}` : "—";
        const min2  = n => n > 0 ? `▲¥${Math.round(n).toLocaleString()}` : "—";

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ background: "#1e3a5f", color: "#fff", padding: "10px 14px", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>
              📋 諸費用精算サマリー
            </div>

            {/* 収入 */}
            <Row2 label="■ 収入" headBg="#15803d" />
            <Row2 label="売却価格" value={yen2(sellerPrice)} indent />
            {koteishisan > 0 && <Row2 label="固定資産税・都市計画税精算金" value={yen2(koteishisan)} indent />}
            {kanri > 0       && <Row2 label="管理費・修繕積立金精算" value={yen2(kanri)} indent />}
            <Row2 label="収入合計" value={yen2(incomeTotal)} bold borderTop />

            {/* 経費 OK */}
            <Row2 label="■ 経費　✅ 譲渡費用 or 取得費（税額計算に算入）" headBg="#1d4ed8" />
            <Row2 label="仲介手数料（消費税込）" value={min2(chuko)} indent />
            <Row2 label="印紙代（売買契約書）" value={min2(inshi)} indent />
            {kaitai  > 0 && <Row2 label="解体費用" value={min2(kaitai)} indent />}
            {metsu   > 0 && <Row2 label="建物滅失登記費用" value={min2(metsu)} indent />}
            {sokuryo > 0 && <Row2 label="測量費用" value={min2(sokuryo)} indent />}
            {sozoku  > 0 && <Row2 label="相続登記費用（取得費）" value={min2(sozoku)} indent />}
            {ihin    > 0 && <Row2 label="遺品整理・残置物撤去費用" value={min2(ihin)} indent />}
            {otherJ  > 0 && <Row2 label={seller.otherJotoLabel || "その他（譲渡費用算入可）"} value={min2(otherJ)} indent />}

            {/* 経費 NG */}
            <Row2 label="■ 経費　❌ その他経費（税額計算には含まれない）" headBg="#6b7280" />
            {teito   > 0 && <Row2 label="抵当権抹消登記費用" value={min2(teito)} indent />}
            {jusho   > 0 && <Row2 label="住所変更登記費用" value={min2(jusho)} indent />}
            {kenri   > 0 && <Row2 label="権利書紛失（本人確認情報）" value={min2(kenri)} indent />}
            {ihinNG  > 0 && <Row2 label="遺品整理・残置物撤去費用" value={min2(ihinNG)} indent />}
            {hikkoshi> 0 && <Row2 label="引越し費用" value={min2(hikkoshi)} indent />}
            {otherS  > 0 && <Row2 label={seller.otherSLabel || "その他"} value={min2(otherS)} indent />}
            <Row2 label="経費合計（税除く）" value={min2(expense)} bold borderTop />

            {/* 税引前 */}
            <Row2 label="■ 税引前手残り" headBg="#0369a1" />
            <Row2 label="税引前手残り（収入 ー 経費）" value={yen2(incomeTotal - expense)} bold />

            {/* 譲渡所得税 */}
            <Row2 label="■ 譲渡所得税（概算）" headBg="#4338ca" />
            <Row2 label={`取得費${seller.shotokuhi5pct ? "（収入合計×5%）" : ""}`} value={min2(Math.floor(tax.shotokuhi))} indent />
            <Row2 label="譲渡費用合計（仲介・印紙・解体・測量等）" value={min2(Math.floor(tax.jotoHiyo))} indent />
            <Row2 label="譲渡所得" value={yen2(Math.floor(tax.jotoShotoku))} indent bold />
            {tax.kojo > 0 && (
              <Row2 label={`特別控除（${[seller.kojo3000 && "3,000万", seller.kojo3000Sozoku && "相続3,000万", seller.teiMiriyo && "低未利用100万"].filter(Boolean).join("＋")}）`} value={min2(tax.kojo)} indent />
            )}
            <Row2 label="課税譲渡所得" value={yen2(Math.floor(tax.kazeiShotoku))} indent bold />
            <Row2 label={`税率（${seller.taxKubun === "short" ? "短期 39.63%" : seller.keigenZeiritsu ? "居住用軽減 14.21%" : "長期 20.315%"}）`} value="" indent />
            <Row2 label="譲渡所得税額（概算）" value={min2(tax.zei)} bold borderTop />

            {/* 最終手残り */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1e3a5f", borderTop: "2px solid #374151" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>最終手残り概算</span>
              <span style={{ color: "#fbbf24", fontSize: 24, fontWeight: 800 }}>¥{final.toLocaleString()}</span>
            </div>

            <div style={{ padding: "8px 12px", background: "#fffbeb", borderTop: "1px solid #fde68a", fontSize: 11, color: "#92400e", lineHeight: 1.7 }}>
              ⚠️ 上記は概算です。取得費・控除の適用可否・税額は必ず税理士にご確認ください。
            </div>
          </div>
        );
      })()}

      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 12, lineHeight: 1.8, padding: "10px 4px" }}>
        ※本書は概算であり、実際の費用とは異なる場合があります。<br />
        ※譲渡税は税理士にご確認ください。<br />
        ※印紙代は軽減税率（令和9年3月31日まで）を適用しています。
      </div>
    </div>
  );
}
