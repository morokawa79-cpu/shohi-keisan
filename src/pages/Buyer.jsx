import Row from "../components/Row";
import ToggleRow from "../components/ToggleRow";
import LabelRow from "../components/LabelRow";
import Section from "../components/Section";
import {
  parseNum,
  calcChuko,
  calcInshiBaibai,
  calcInshiKinsho,
  calcIdoKirokuAuto,
  calcTeitoSetsuBAuto,
  calcFudosanShutokuAuto,
  calcLoanJimuAuto,
  calcLoan,
  calcBuyerTotal,
} from "../utils/calc";

export const initBuyer = {
  caseNameB: "",
  customerNameB: "",
  dateB: new Date().toISOString().slice(0, 10),
  salePriceB: "",
  loanAmtB: "",
  jukyoyo: true,
  shinchiku: false,
  autoChukoB: true,   manualChukoB: "",
  autoIdo: true,
  autoTeito: true,
  autoFudo: true,
  autoLoanJimu: true,
  idoKiroku: "",
  teitoSetsuB: "",
  fudosanShutoku: "",
  loanJimu: "",
  kasai: "",
  koteishisan: "",
  kanriB: "",
  reform: "",
  hikkoshiB: "",
  otherB: "",
  otherBLabel: "その他",
  loanKinri: "1.2",
  loanKikan: "35",
  loanJimuRate: "3.3",
};

export default function Buyer({ buyer, setB }) {
  const buyerPrice = parseNum(buyer.salePriceB);
  const buyerLoan = parseNum(buyer.loanAmtB);
  const buyerTotal = calcBuyerTotal(buyer);

  return (
    <div>
      {/* 案件情報 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>案件名</label>
            <input value={buyer.caseNameB} onChange={e => setB("caseNameB", e.target.value)}
              placeholder="例：ひたちなか市〇〇 戸建" style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>買主様名</label>
            <input value={buyer.customerNameB} onChange={e => setB("customerNameB", e.target.value)}
              placeholder="〇〇 様" style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>作成日</label>
            <input type="date" value={buyer.dateB} onChange={e => setB("dateB", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb" }}>
        {/* 物件種別 */}
        <div style={{ background: "#faf3e8", border: "1px solid #f5e6d3", borderRadius: 8, padding: "8px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>物件種別：</span>
          {[["true", "🏠 居住用"], ["false", "🏢 非居住用"]].map(([val, lbl]) => (
            <label key={val} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: String(buyer.jukyoyo) === val ? "#7c4a2a" : "#fff",
              border: String(buyer.jukyoyo) === val ? "1px solid #7c4a2a" : "1px solid #e5e7eb",
              color: String(buyer.jukyoyo) === val ? "#fff" : "#374151" }}>
              <input type="radio" name="jukyoyo" value={val}
                checked={String(buyer.jukyoyo) === val}
                onChange={() => setB("jukyoyo", val === "true")}
                style={{ display: "none" }} />
              {lbl}
            </label>
          ))}
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>概算チェックで自動/手入力を切替</span>
        </div>

        <Section title="■ 売買金額" color="green">
          <Row label="売買金額" value={buyer.salePriceB} onChange={v => setB("salePriceB", v)} />
          <Row label="固定資産税・都市計画税精算" value={buyer.koteishisan} onChange={v => setB("koteishisan", v)} note="売主へ支払い（日割り）" />
          <Row label="管理費・修繕積立金精算" value={buyer.kanriB} onChange={v => setB("kanriB", v)} note="売主へ支払い（日割り）・マンション用" />
        </Section>

        <Section title="■ 仲介費用" color="green">
          <ToggleRow
            label="仲介手数料（消費税込）"
            autoValue={calcChuko(buyerPrice)}
            manualValue={buyer.manualChukoB}
            onManualChange={v => setB("manualChukoB", v)}
            isAuto={buyer.autoChukoB !== false}
            onToggle={v => setB("autoChukoB", v)}
            autoNote="上限額自動計算"
            note="実額を入力"
          />
        </Section>

        <Section title="■ 印紙代" color="green">
          <Row label="印紙代（売買契約書）" value={calcInshiBaibai(buyerPrice)} auto note="軽減税率適用" />
          <Row label="印紙代（金銭消費貸借契約書）" value={calcInshiKinsho(buyerLoan)} auto note="軽減税率適用" />
        </Section>

        <Section title="■ 登記費用" color="green">
          <ToggleRow
            mode="概算"
            label="所有権移転登記費用"
            autoValue={calcIdoKirokuAuto(buyerPrice, buyer.jukyoyo !== false)}
            manualValue={buyer.idoKiroku}
            onManualChange={v => setB("idoKiroku", v)}
            isAuto={buyer.autoIdo !== false}
            onToggle={v => setB("autoIdo", v)}
            autoNote={buyer.jukyoyo !== false ? "居住用：土地1.5%＋建物0.3%＋司法書士7万" : "非居住用：評価額×2%＋司法書士7万"}
            note="実額を入力"
          />
          <ToggleRow
            mode="概算"
            label="抵当権設定登記費用"
            autoValue={calcTeitoSetsuBAuto(buyerLoan, buyer.jukyoyo !== false)}
            manualValue={buyer.teitoSetsuB}
            onManualChange={v => setB("teitoSetsuB", v)}
            isAuto={buyer.autoTeito !== false}
            onToggle={v => setB("autoTeito", v)}
            autoNote={buyer.jukyoyo !== false ? "居住用軽減：借入額×0.1%＋司法書士4万" : "非居住用：借入額×0.4%＋司法書士4万"}
            note="実額を入力"
          />
        </Section>

        <Section title="■ 税金" color="green">
          <ToggleRow
            mode="概算"
            label="不動産取得税（概算）"
            autoValue={calcFudosanShutokuAuto(buyerPrice, buyer.jukyoyo !== false)}
            manualValue={buyer.fudosanShutoku}
            onManualChange={v => setB("fudosanShutoku", v)}
            isAuto={buyer.autoFudo !== false}
            onToggle={v => setB("autoFudo", v)}
            autoNote={buyer.jukyoyo !== false ? "居住用：軽減措置で実質0円のケース多数（必要時は手入力へ）" : "非居住用：評価額×4%（評価額≈価格×70%）"}
            note="実額を入力"
          />
        </Section>

        <Section title="■ ローン関連" color="green">
          <ToggleRow
            mode="概算"
            label="ローン事務手数料"
            autoValue={calcLoanJimuAuto(buyerLoan, parseFloat(buyer.loanJimuRate) || 3.3)}
            manualValue={buyer.loanJimu}
            onManualChange={v => setB("loanJimu", v)}
            isAuto={buyer.autoLoanJimu !== false}
            onToggle={v => setB("autoLoanJimu", v)}
            autoNote={`借入額×${buyer.loanJimuRate || 3.3}%（定率型）`}
            note="実額を入力"
          />
          {buyer.autoLoanJimu !== false && (
            <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: "#6b7280", alignSelf: "center" }}>手数料率：</span>
              {["2.2", "3.3"].map(rate => (
                <label key={rate} style={{
                  display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                  padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: (buyer.loanJimuRate || "3.3") === rate ? "#7c4a2a" : "#e5e7eb",
                  color: (buyer.loanJimuRate || "3.3") === rate ? "#fff" : "#374151"
                }}>
                  <input type="radio" name="loanJimuRate" value={rate}
                    checked={(buyer.loanJimuRate || "3.3") === rate}
                    onChange={() => setB("loanJimuRate", rate)}
                    style={{ display: "none" }} />
                  {rate}%
                </label>
              ))}
            </div>
          )}
        </Section>

        <Section title="■ 保険" color="green">
          <Row label="火災保険・地震保険（概算）" value={buyer.kasai} onChange={v => setB("kasai", v)} />
        </Section>

        <Section title="■ その他費用" color="green">
          <Row label="リフォーム費用" value={buyer.reform} onChange={v => setB("reform", v)} />
          <Row label="引越し費用" value={buyer.hikkoshiB} onChange={v => setB("hikkoshiB", v)} />
          <LabelRow
            label={buyer.otherBLabel}
            value={buyer.otherB}
            onChange={(f, v) => f === "label" ? setB("otherBLabel", v) : setB("otherB", v)}
          />
        </Section>

        {/* 諸費用合計 */}
        <div style={{ background: "#7c4a2a", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 600 }}>諸費用合計（概算）</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>¥{buyerTotal.toLocaleString()}</div>
        </div>
        {buyerPrice > 0 && (
          <div style={{ background: "#5c3820", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f5e6d3" }}>購入価格＋諸費用　総額</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#e8c87a" }}>
              ¥{(buyerPrice + buyerTotal).toLocaleString()}
            </span>
          </div>
        )}

        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, lineHeight: 1.8, borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
          ※本書は概算です。登記費用は実際の固定資産税評価額により変わります。<br />
          ※不動産取得税は軽減特例適用後の概算です。税理士にご確認ください。<br />
          ※印紙代は軽減税率（令和9年3月31日まで）を適用しています。
        </div>
      </div>

      {/* ▼ 借入予定額 */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginTop: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb", borderLeft: "3px solid #7c4a2a" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#7c4a2a", marginBottom: 8 }}>🏦 借入予定額</div>
        <Row label="借入予定額" value={buyer.loanAmtB} onChange={v => setB("loanAmtB", v)} />
      </div>

      {/* ▼ ローンシミュレーション */}
      {(() => {
        const loan = calcLoan(buyerLoan, parseFloat(buyer.loanKinri) || 0, parseFloat(buyer.loanKikan) || 0);
        return (
          <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginTop: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#7c4a2a" }}>ローンシミュレーション</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>元利均等返済</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ flex: "1 1 100px" }}>
                <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>金利（年率%）</label>
                <input type="text" inputMode="decimal" value={buyer.loanKinri}
                  onChange={e => setB("loanKinri", e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", textAlign: "right" }} />
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>返済期間（年）</label>
                <input type="text" inputMode="numeric" value={buyer.loanKikan}
                  onChange={e => setB("loanKikan", e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", textAlign: "right" }} />
              </div>
            </div>

            {loan && buyerLoan > 0 ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    ["月々返済額", `¥${loan.monthly.toLocaleString()}`, "#7c4a2a", "#faf3e8", "#f5e6d3"],
                    ["総返済額", `¥${loan.total.toLocaleString()}`, "#5c3820", "#faf3e8", "#f5e6d3"],
                    ["総利息", `¥${loan.interest.toLocaleString()}`, "#92400e", "#fffbeb", "#fde68a"],
                  ].map(([lbl, val, color, bg, bd]) => (
                    <div key={lbl} style={{ background: bg, borderRadius: 8, padding: "10px 12px", textAlign: "center", border: `1px solid ${bd}` }}>
                      <div style={{ fontSize: 11, color, marginBottom: 4 }}>{lbl}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", marginBottom: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>📋 必要年収の目安（返済比率別）</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[["25%", 0.25], ["30%", 0.30], ["35%", 0.35]].map(([label, ratio]) => {
                      const annual = loan.monthly * 12;
                      const needed = Math.ceil(annual / ratio / 10000) * 10000;
                      return (
                        <div key={label} style={{ textAlign: "center", background: "#fff", borderRadius: 6, padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>比率{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#7c4a2a" }}>¥{needed.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 6 }}>※金融機関により審査基準は異なります</div>
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.8 }}>
                  ※元利均等返済・ボーナス払いなし・概算です<br/>
                  ※変動金利の場合、将来の返済額は変わります
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px", color: "#9ca3af", fontSize: 13 }}>
                借入額・金利・期間を入力すると計算します
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
