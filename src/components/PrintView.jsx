import {
  parseNum, calcChuko, calcInshiBaibai,
  calcSellerExpense, calcJotoZei,
  calcBuyerCommonCostBreakdown, calcLoanPlanCostBreakdown,
  calcBuyerPlanSummary,
} from "../utils/calc";
import {
  getActiveLoanPlan,
  getLoanPlanDisplayName,
  normalizeBuyerData,
} from "../utils/buyerData";

const yen  = (n) => (!n && n !== 0) || n === "" ? "—" : `¥${Math.round(n).toLocaleString()}`;
const minus = (n) => !n || n === 0 ? "—" : `▲¥${Math.round(n).toLocaleString()}`;

const tdLabel = { padding: "4px 10px", fontSize: 11, borderBottom: "1px solid #e5e7eb", width: "60%" };
const tdValue = { padding: "4px 10px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #e5e7eb", width: "40%" };

function SectionHead({ label, color = "#1e3a5f" }) {
  return (
    <tr>
      <td colSpan={2} style={{ background: color, color: "#fff", padding: "4px 10px", fontWeight: 700, fontSize: 11 }}>
        {label}
      </td>
    </tr>
  );
}

function Row({ label, value, indent, bold, borderTop, color }) {
  const base = { ...tdLabel, paddingLeft: indent ? 24 : 10, fontWeight: bold ? 700 : 400, borderTop: borderTop ? "2px solid #374151" : undefined, color: color || "#111" };
  const val  = { ...tdValue, fontWeight: bold ? 700 : 400, borderTop: borderTop ? "2px solid #374151" : undefined, color: color || "#111" };
  return (
    <tr>
      <td style={base}>{label}</td>
      <td style={val}>{value}</td>
    </tr>
  );
}

function SellerPrint({ seller }) {
  const price    = parseNum(seller.salePriceS);
  const koteishi = parseNum(seller.koteishisanS);
  const kanri    = parseNum(seller.kanrisei);
  const income   = price + koteishi + kanri;
  const expense  = calcSellerExpense(seller);
  const tax      = calcJotoZei(seller);
  const zenZei   = income - expense;
  const final    = zenZei - tax.zei;
  const chuko    = seller.autoChukoS !== false ? calcChuko(price) : parseNum(seller.manualChukoS);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
      <tbody>
        {/* 収入 */}
        <SectionHead label="■ 収入" color="#1e3a5f" />
        <Row label="売却価格" value={yen(price)} indent />
        {koteishi > 0 && <Row label="固定資産税・都市計画税精算金" value={yen(koteishi)} indent />}
        {kanri > 0    && <Row label="管理費・修繕積立金精算" value={yen(kanri)} indent />}
        <Row label="収入合計" value={yen(income)} bold borderTop />

        {/* 経費 — ✅譲渡費用OK */}
        <SectionHead label="■ 経費（支出）　✅ 譲渡費用 or 取得費（税額計算に算入）" color="#1e3a5f" />
        <Row label="仲介手数料（消費税込）" value={minus(chuko)} indent />
        <Row label="印紙代（売買契約書）" value={minus(calcInshiBaibai(price))} indent />
        {parseNum(seller.kaitai)    > 0 && <Row label="解体費用"                value={minus(parseNum(seller.kaitai))}    indent />}
        {parseNum(seller.metshitsu) > 0 && <Row label="建物滅失登記費用"        value={minus(parseNum(seller.metshitsu))} indent />}
        {parseNum(seller.sokuryo)   > 0 && <Row label="測量費用（確定測量等）"  value={minus(parseNum(seller.sokuryo))}   indent />}
        {parseNum(seller.souzokuToroku)     > 0 && <Row label="相続登記費用（取得費）"     value={minus(parseNum(seller.souzokuToroku))}     indent />}
        {seller.ihinZanchiJoto !== false && parseNum(seller.ihinZanchi) > 0 && <Row label="遺品整理・残置物撤去費用" value={minus(parseNum(seller.ihinZanchi))} indent />}
        {parseNum(seller.otherJoto) > 0 && <Row label={seller.otherJotoLabel || "その他（譲渡費用算入可）"} value={minus(parseNum(seller.otherJoto))} indent />}

        {/* 経費 — ❌経費NG */}
        <SectionHead label="■ 経費（支出）　❌ その他経費（税額計算には含まれない）" color="#6b7280" />
        {parseNum(seller.teitoSetsu)        > 0 && <Row label="抵当権抹消登記費用"         value={minus(parseNum(seller.teitoSetsu))}        indent />}
        {parseNum(seller.jushoHenko)        > 0 && <Row label="住所変更登記費用"           value={minus(parseNum(seller.jushoHenko))}        indent />}
        {parseNum(seller.kenrishoPunshitsu) > 0 && <Row label="権利書紛失（本人確認情報）" value={minus(parseNum(seller.kenrishoPunshitsu))} indent />}
        {seller.ihinZanchiJoto === false && parseNum(seller.ihinZanchi) > 0 && <Row label="遺品整理・残置物撤去費用（買主要求）" value={minus(parseNum(seller.ihinZanchi))} indent />}
        {parseNum(seller.hikkoshi)          > 0 && <Row label="引越し費用"                 value={minus(parseNum(seller.hikkoshi))}          indent />}
        {parseNum(seller.otherS)            > 0 && <Row label={seller.otherSLabel || "その他"} value={minus(parseNum(seller.otherS))} indent />}
        {/* 旧フィールド後方互換 */}
        {parseNum(seller.otherS2) > 0 && <Row label={seller.otherS2Label || "その他"} value={minus(parseNum(seller.otherS2))} indent />}
        {parseNum(seller.otherS3) > 0 && <Row label={seller.otherS3Label || "その他"} value={minus(parseNum(seller.otherS3))} indent />}
        <Row label="経費合計（税除く）" value={minus(expense)} bold borderTop color="#6b7280" />

        {/* 税引前 */}
        <SectionHead label="■ 税引前手残り" color="#1e3a5f" />
        <Row label="税引前手残り（収入 ー 経費）" value={yen(zenZei)} bold />

        {/* 譲渡所得税 */}
        <SectionHead label="■ 譲渡所得税（概算）" color="#1e3a5f" />
        <Row label={seller.shotokuhi5pct ? "概算取得費（5%ルール）" : "取得費（実額）"} value={minus(Math.floor(tax.shotokuhi))} indent />
        <Row label="譲渡費用（仲介・印紙・解体・測量等）" value={minus(Math.floor(tax.jotoHiyo))} indent />
        <Row label="譲渡所得" value={yen(Math.floor(tax.jotoShotoku))} indent bold />
        {tax.kojo > 0 && (
          <Row
            label={`特別控除（${[seller.kojo3000 && "3,000万", seller.kojo3000Sozoku && "相続3,000万", seller.teiMiriyo && "低未利用100万"].filter(Boolean).join("＋")}）`}
            value={minus(tax.kojo)} indent
          />
        )}
        <Row label="課税譲渡所得" value={yen(Math.floor(tax.kazeiShotoku))} indent bold />
        <Row
          label={`税率（${seller.taxKubun === "short" ? "短期 39.63%" : seller.keigenZeiritsu ? "居住用軽減（6,000万以下 14.21%／超過分 20.315%）" : "長期 20.315%"}）`}
          value="" indent
        />
        <Row label="譲渡所得税額（概算）" value={minus(tax.zei)} bold borderTop color="#1e3a5f" />

        {/* 最終サマリー */}
        <SectionHead label="■ 精算サマリー" color="#1e3a5f" />
        <Row label="収入合計"         value={yen(income)}   indent />
        <Row label="経費合計（税除く）" value={minus(expense)} indent />
        <Row label="譲渡所得税（概算）" value={minus(tax.zei)} indent />
        <Row label="最終手残り概算" value={yen(final)} bold borderTop color={final >= 0 ? "#1e3a5f" : "#6b7280"} />
      </tbody>
    </table>
  );
}

function BuyerPrint({ buyer }) {
  const data = normalizeBuyerData(buyer);
  const price = parseNum(data.salePriceB);
  const activePlan = getActiveLoanPlan(data);
  const commonCosts = calcBuyerCommonCostBreakdown(data);
  const activeLoanCosts = calcLoanPlanCostBreakdown(data, activePlan);
  const activeSummary = calcBuyerPlanSummary(data, activePlan);
  const activePlanName = getLoanPlanDisplayName(data, activePlan);
  const comparablePlans = data.loanPlans.filter(
    (plan) => plan.enabled && plan.amount != null && String(plan.amount).trim() !== "",
  );
  const comparisonPlans = comparablePlans.map((plan) => ({
    plan,
    summary: calcBuyerPlanSummary(data, plan),
  }));
  const otherCosts = data.otherCosts.filter((item) => parseNum(item.amount) > 0);
  const loanFeeLabel = activePlan.loanFeeMode === "auto"
    ? `ローン事務手数料（${activePlan.loanFeeRate === "" ? "率未入力" : `${activePlan.loanFeeRate}%`}）`
    : "ローン事務手数料（手入力）";

  const comparisonRows = [
    { label: "金融機関・商品名", value: ({ plan }) => plan.lenderName || "—" },
    { label: "借入額", value: ({ summary }) => yen(summary.loanAmount) },
    { label: "金利", value: ({ plan }) => plan.annualRate === "" ? "—" : `${plan.annualRate}%` },
    { label: "期間", value: ({ plan }) => plan.years === "" ? "—" : `${plan.years}年` },
    { label: "月々返済額", value: ({ summary }) => summary.loan ? yen(summary.loan.monthly) : "—" },
    { label: "総返済額", value: ({ summary }) => summary.loan ? yen(summary.loan.total) : "—" },
    { label: "総利息", value: ({ summary }) => summary.loan ? yen(summary.loan.interest) : "—" },
    { label: "必要自己資金", value: ({ summary }) => yen(summary.requiredOwnFunds) },
  ];

  return (
    <div className="buyer-print-content">
      <table className="print-detail-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
        <tbody>
          <SectionHead label="■ 売買金額" color="#78716c" />
          <Row label="売買金額" value={yen(price)} indent />
          {commonCosts.propertyTaxSettlement > 0 && <Row label="固定資産税・都市計画税精算" value={yen(commonCosts.propertyTaxSettlement)} indent />}
          {commonCosts.managementFeeSettlement > 0 && <Row label="管理費・修繕積立金精算" value={yen(commonCosts.managementFeeSettlement)} indent />}

          <SectionHead label={`■ 諸費用内訳（採用：${activePlanName}）`} color="#78716c" />
          <Row label="仲介手数料（消費税込）" value={yen(commonCosts.brokerage)} indent />
          <Row label="印紙代（売買契約書）" value={yen(commonCosts.saleContractStamp)} indent />
          <Row label="印紙代（金銭消費貸借契約書）" value={yen(activeLoanCosts.loanContractStamp)} indent />
          <Row label={`所有権移転登記費用${data.autoIdo !== false ? "（概算）" : ""}`} value={yen(commonCosts.ownershipRegistration)} indent />
          <Row label={`抵当権設定登記費用${data.autoTeito !== false ? "（概算）" : ""}`} value={yen(activeLoanCosts.mortgageRegistration)} indent />
          <Row label={`不動産取得税${data.autoFudo !== false ? "（概算）" : ""}`} value={yen(commonCosts.realEstateAcquisitionTax)} indent />
          <Row label={loanFeeLabel} value={yen(activeLoanCosts.loanFee)} indent />
          {commonCosts.insurance > 0 && <Row label="火災保険・地震保険（概算）" value={yen(commonCosts.insurance)} indent />}
          {commonCosts.renovation > 0 && <Row label="リフォーム費用" value={yen(commonCosts.renovation)} indent />}
          {commonCosts.moving > 0 && <Row label="引越し費用" value={yen(commonCosts.moving)} indent />}
          {otherCosts.map((item) => (
            <Row key={item.id} label={item.label || "その他"} value={yen(parseNum(item.amount))} indent />
          ))}
          <Row label="諸費用合計（概算）" value={yen(activeSummary.costsTotal)} bold borderTop />

          <SectionHead label="■ 購入サマリー" color="#a16a46" />
          <Row label="売買金額" value={yen(price)} indent />
          <Row label="諸費用合計（概算）" value={yen(activeSummary.costsTotal)} indent />
          <Row label="購入総額（概算）" value={yen(activeSummary.purchaseTotal)} bold />
          <Row label="採用ローンプラン" value={`${activePlanName}${activePlan.lenderName ? `（${activePlan.lenderName}）` : ""}`} indent />
          <Row label="採用プラン借入予定額" value={yen(activeSummary.loanAmount)} indent />
          <Row label="必要自己資金（概算）" value={yen(activeSummary.requiredOwnFunds)} bold borderTop color="#a16a46" />
          {activeSummary.borrowingExcess > 0 && (
            <tr className="print-overloan-warning">
              <td colSpan={2}>
                ※借入予定額が購入総額を{yen(activeSummary.borrowingExcess)}上回っています。
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {comparisonPlans.length > 0 && (
        <div className="print-loan-comparison-block print-block">
          <div className="print-comparison-title">■ ローンプラン比較（元利均等返済）</div>
          <table className="print-loan-comparison">
          <thead>
            <tr>
              <th>比較項目</th>
              {comparisonPlans.map(({ plan }) => (
                <th key={plan.id} className={plan.id === data.activeLoanPlanId ? "is-active" : ""}>
                  {getLoanPlanDisplayName(data, plan)}
                  {plan.id === data.activeLoanPlanId && <span>採用中</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {comparisonPlans.map((comparisonPlan) => (
                  <td key={comparisonPlan.plan.id} className={comparisonPlan.plan.id === data.activeLoanPlanId ? "is-active" : ""}>
                    {row.value(comparisonPlan)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PrintView({ tab, seller, buyer }) {
  const isSeller = tab === "seller";
  const headColor = isSeller ? "#1e3a5f" : "#a16a46";
  const info = isSeller
    ? { title: "売主向け", name: seller.caseNameS, customer: seller.customerNameS, date: seller.dateS }
    : { title: "買主向け", name: buyer.caseNameB,  customer: buyer.customerNameB,  date: buyer.dateB };

  return (
    <div className={isSeller ? "print-only" : "print-only buyer-print-area"} style={{ fontFamily: "'Hiragino Sans','Noto Sans JP',sans-serif", fontSize: 11, color: "#111", padding: "0 4mm" }}>
      {/* ヘッダー */}
      <div style={{ borderBottom: `3px solid ${headColor}`, paddingBottom: 8, marginBottom: 12 }}>
        <div className="print-document-title" style={{ fontSize: 16, fontWeight: 700, color: headColor }}>
          不動産諸費用計算書（{info.title}）
        </div>
        <div className="print-document-meta" style={{ display: "flex", gap: 24, marginTop: 6, fontSize: 11, color: "#374151" }}>
          {info.name     && <span>案件名：{info.name}</span>}
          {info.customer && <span>{isSeller ? "売主" : "買主"}様名：{info.customer}</span>}
          {info.date     && <span>作成日：{info.date}</span>}
          {!isSeller && <span>物件種別：{buyer.jukyoyo !== false ? "居住用" : "非居住用"}</span>}
        </div>
      </div>

      {/* テーブルヘッダー */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 4 }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ padding: "4px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, width: "60%", borderBottom: "2px solid #374151" }}>項目</th>
            <th style={{ padding: "4px 10px", textAlign: "right", fontSize: 11, fontWeight: 700, width: "40%", borderBottom: "2px solid #374151" }}>金額</th>
          </tr>
        </thead>
      </table>

      {isSeller ? <SellerPrint seller={seller} /> : <BuyerPrint buyer={buyer} />}

      {/* 免責事項 */}
      {isSeller ? (
        <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 6, fontSize: 9, color: "#9ca3af", lineHeight: 1.7 }}>
          ※本書は概算であり、実際の費用とは異なる場合があります。
          ※譲渡所得税の計算は必ず税理士にご確認ください。
          ※登記費用は実際の固定資産税評価額により変わります。
          ※印紙代は軽減税率（令和9年3月31日まで）を適用しています。
        </div>
      ) : (
        <div className="print-disclaimer" style={{ borderTop: "1px solid #d1d5db", paddingTop: 6, fontSize: 9, color: "#9ca3af", lineHeight: 1.7 }}>
          <span>※本書は概算であり、実際の費用とは異なる場合があります。</span>
          <span>※登記費用は実際の固定資産税評価額により変わります。</span>
          <span>※印紙代は軽減税率（令和9年3月31日まで）を適用しています。</span>
        </div>
      )}
    </div>
  );
}
