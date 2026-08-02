import Row from "../components/Row";
import ToggleRow from "../components/ToggleRow";
import Section from "../components/Section";
import LoanPlanEditor from "../components/LoanPlanEditor";
import OtherCostsEditor from "../components/OtherCostsEditor";
import { getActiveLoanPlan, getLoanPlanDisplayName } from "../utils/buyerData";
import {
  parseNum,
  calcChuko,
  calcInshiBaibai,
  calcInshiKinsho,
  calcIdoKirokuAuto,
  calcTeitoSetsuBAuto,
  calcFudosanShutokuAuto,
  calcBuyerPlanSummary,
  calcLoanPlanCostBreakdown,
} from "../utils/calc";

export default function Buyer({ buyer, setB }) {
  const buyerPrice = parseNum(buyer.salePriceB);
  const activePlan = getActiveLoanPlan(buyer);
  const activeSummary = calcBuyerPlanSummary(buyer, activePlan);
  const activeLoanCosts = calcLoanPlanCostBreakdown(buyer, activePlan);
  const activePlanName = getLoanPlanDisplayName(buyer, activePlan);
  const buyerLoan = activeSummary.loanAmount;
  const buyerTotal = activeSummary.costsTotal;

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
              background: String(buyer.jukyoyo) === val ? "#a16a46" : "#fff",
              border: String(buyer.jukyoyo) === val ? "1px solid #a16a46" : "1px solid #e5e7eb",
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

        <LoanPlanEditor buyer={buyer} setB={setB} />

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

        <Section title="■ ローン関連（採用プラン）" color="green">
          <Row
            label="ローン事務手数料"
            value={activeLoanCosts.loanFee}
            auto
            note={activePlan.loanFeeMode === "auto"
              ? `${activePlanName}：借入額×${activePlan.loanFeeRate === "" ? "未入力" : activePlan.loanFeeRate}%`
              : `${activePlanName}：手入力額`}
          />
        </Section>

        <Section title="■ 保険" color="green">
          <Row label="火災保険・地震保険（概算）" value={buyer.kasai} onChange={v => setB("kasai", v)} />
        </Section>

        <Section title="■ その他費用" color="green">
          <Row label="リフォーム費用" value={buyer.reform} onChange={v => setB("reform", v)} />
          <Row label="引越し費用" value={buyer.hikkoshiB} onChange={v => setB("hikkoshiB", v)} />
          <OtherCostsEditor
            otherCosts={buyer.otherCosts}
            onChange={(otherCosts) => setB("otherCosts", otherCosts)}
          />
        </Section>

        {/* 諸費用合計 */}
        <div style={{ background: "#a16a46", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 600 }}>諸費用合計（概算）</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>¥{buyerTotal.toLocaleString()}</div>
        </div>
        {buyerPrice > 0 && (
          <>
            <div style={{ background: "#7c4a2a", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f5e6d3" }}>購入価格＋諸費用　総額</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#e8c87a" }}>
                ¥{activeSummary.purchaseTotal.toLocaleString()}
              </span>
            </div>
            <div className="own-funds-summary" aria-live="polite">
              <div className="own-funds-summary-head">
                <div>
                  <span className="own-funds-summary-label">必要自己資金（概算）</span>
                  <span className="own-funds-summary-plan">採用中：{activePlanName}</span>
                </div>
                <strong>¥{activeSummary.requiredOwnFunds.toLocaleString()}</strong>
              </div>
              <div className="own-funds-formula">
                購入総額 ¥{activeSummary.purchaseTotal.toLocaleString()}
                <span>－</span>
                借入予定額 ¥{activeSummary.loanAmount.toLocaleString()}
              </div>
              {activeSummary.borrowingExcess > 0 && (
                <div className="own-funds-warning" role="alert">
                  借入予定額が購入総額を¥{activeSummary.borrowingExcess.toLocaleString()}上回っています。
                </div>
              )}
              <p>手付金を支払済みの場合、手付金は必要自己資金の一部に含まれます。</p>
            </div>
          </>
        )}

        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, lineHeight: 1.8, borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
          ※本書は概算です。登記費用は実際の固定資産税評価額により変わります。<br />
          ※不動産取得税は軽減特例適用後の概算です。税理士にご確認ください。<br />
          ※印紙代は軽減税率（令和9年3月31日まで）を適用しています。
        </div>
      </div>

    </div>
  );
}
