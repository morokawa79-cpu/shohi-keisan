import {
  parseNum, calcChuko, calcInshiBaibai, calcInshiKinsho,
  calcSellerExpense, calcJotoZei,
  calcIdoKirokuAuto, calcTeitoSetsuBAuto, calcFudosanShutokuAuto,
  calcLoanJimuAuto, calcLoan, calcBuyerTotal,
} from "../utils/calc";

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
        <SectionHead label="■ 収入" color="#15803d" />
        <Row label="売却価格" value={yen(price)} indent />
        {koteishi > 0 && <Row label="固定資産税・都市計画税精算金" value={yen(koteishi)} indent />}
        {kanri > 0    && <Row label="管理費・修繕積立金精算" value={yen(kanri)} indent />}
        <Row label="収入合計" value={yen(income)} bold borderTop />

        {/* 経費 */}
        <SectionHead label="■ 経費（支出）" color="#dc2626" />
        <Row label="仲介手数料（消費税込）" value={minus(chuko)} indent />
        <Row label="印紙代（売買契約書）" value={minus(calcInshiBaibai(price))} indent />
        {parseNum(seller.teitoSetsu)         > 0 && <Row label="抵当権抹消登記費用"         value={minus(parseNum(seller.teitoSetsu))}         indent />}
        {parseNum(seller.jushoHenko)         > 0 && <Row label="住所変更登記費用"           value={minus(parseNum(seller.jushoHenko))}         indent />}
        {parseNum(seller.kenrishoPunshitsu)  > 0 && <Row label="権利書紛失（本人確認情報）" value={minus(parseNum(seller.kenrishoPunshitsu))}  indent />}
        {parseNum(seller.otherS3)            > 0 && <Row label={seller.otherS3Label || "その他（登記）"} value={minus(parseNum(seller.otherS3))} indent />}
        {parseNum(seller.kaitai)             > 0 && <Row label="解体費用"                   value={minus(parseNum(seller.kaitai))}             indent />}
        {parseNum(seller.metshitsu)          > 0 && <Row label="建物滅失登記費用"           value={minus(parseNum(seller.metshitsu))}          indent />}
        {parseNum(seller.sokuryo)            > 0 && <Row label="測量費用"                   value={minus(parseNum(seller.sokuryo))}            indent />}
        {parseNum(seller.otherS2)            > 0 && <Row label={seller.otherS2Label || "その他（建物）"} value={minus(parseNum(seller.otherS2))} indent />}
        {parseNum(seller.ihinZanchi)         > 0 && <Row label="遺品整理・残置物撤去"       value={minus(parseNum(seller.ihinZanchi))}         indent />}
        {parseNum(seller.hikkoshi)           > 0 && <Row label="引越し費用"                 value={minus(parseNum(seller.hikkoshi))}           indent />}
        {parseNum(seller.otherS)             > 0 && <Row label={seller.otherSLabel || "その他"}          value={minus(parseNum(seller.otherS))}           indent />}
        <Row label="経費合計（税除く）" value={minus(expense)} bold borderTop color="#dc2626" />

        {/* 税引前 */}
        <SectionHead label="■ 税引前手残り" color="#0369a1" />
        <Row label="税引前手残り（収入 ー 経費）" value={yen(zenZei)} bold />

        {/* 譲渡所得税 */}
        <SectionHead label="■ 譲渡所得税（概算）" color="#4338ca" />
        <Row label={`取得費${seller.shotokuhi5pct ? "（売却価格×5%）" : ""}`} value={minus(Math.floor(tax.shotokuhi))} indent />
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
          label={`税率（${seller.taxKubun === "short" ? "短期 39.63%" : seller.keigenZeiritsu ? "居住用軽減 14.21%" : "長期 20.315%"}）`}
          value="" indent
        />
        <Row label="譲渡所得税額（概算）" value={minus(tax.zei)} bold borderTop color="#4338ca" />

        {/* 最終サマリー */}
        <SectionHead label="■ 精算サマリー" color="#1e3a5f" />
        <Row label="収入合計"         value={yen(income)}   indent />
        <Row label="経費合計（税除く）" value={minus(expense)} indent />
        <Row label="譲渡所得税（概算）" value={minus(tax.zei)} indent />
        <Row label="最終手残り概算" value={yen(final)} bold borderTop color={final >= 0 ? "#15803d" : "#dc2626"} />
      </tbody>
    </table>
  );
}

function BuyerPrint({ buyer }) {
  const price = parseNum(buyer.salePriceB);
  const loan  = parseNum(buyer.loanAmtB);
  const jky   = buyer.jukyoyo !== false;
  const total = calcBuyerTotal(buyer);

  const chuko    = buyer.autoChukoB    !== false ? calcChuko(price)                                              : parseNum(buyer.manualChukoB);
  const ido      = buyer.autoIdo       !== false ? calcIdoKirokuAuto(price, jky)                                 : parseNum(buyer.idoKiroku);
  const teito    = buyer.autoTeito     !== false ? calcTeitoSetsuBAuto(loan, jky)                                : parseNum(buyer.teitoSetsuB);
  const fudo     = buyer.autoFudo      !== false ? calcFudosanShutokuAuto(price, jky)                            : parseNum(buyer.fudosanShutoku);
  const loanJimu = buyer.autoLoanJimu  !== false ? calcLoanJimuAuto(loan, parseFloat(buyer.loanJimuRate) || 3.3) : parseNum(buyer.loanJimu);

  const loanSim = calcLoan(loan, parseFloat(buyer.loanKinri) || 0, parseFloat(buyer.loanKikan) || 0);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
      <tbody>
        {/* 売買金額 */}
        <SectionHead label="■ 売買金額" color="#15803d" />
        <Row label="売買金額" value={yen(price)} indent />
        {parseNum(buyer.koteishisan) > 0 && <Row label="固定資産税・都市計画税精算" value={yen(parseNum(buyer.koteishisan))} indent />}
        {parseNum(buyer.kanriB)      > 0 && <Row label="管理費・修繕積立金精算"     value={yen(parseNum(buyer.kanriB))}      indent />}

        {/* 諸費用 */}
        <SectionHead label="■ 諸費用内訳" color="#1e3a5f" />
        <Row label="仲介手数料（消費税込）"           value={yen(chuko)}                        indent />
        <Row label="印紙代（売買契約書）"             value={yen(calcInshiBaibai(price))}       indent />
        <Row label="印紙代（金銭消費貸借契約書）"     value={yen(calcInshiKinsho(loan))}        indent />
        <Row label={`所有権移転登記費用${buyer.autoIdo !== false ? "（概算）" : ""}`}            value={yen(ido)}   indent />
        <Row label={`抵当権設定登記費用${buyer.autoTeito !== false ? "（概算）" : ""}`}          value={yen(teito)} indent />
        <Row label={`不動産取得税${buyer.autoFudo !== false ? "（概算）" : ""}`}                 value={yen(fudo)}  indent />
        <Row label={`ローン事務手数料${buyer.autoLoanJimu !== false ? `（${buyer.loanJimuRate || 3.3}%）` : ""}`} value={yen(loanJimu)} indent />
        {parseNum(buyer.kasai)    > 0 && <Row label="火災保険・地震保険（概算）" value={yen(parseNum(buyer.kasai))}    indent />}
        {parseNum(buyer.reform)   > 0 && <Row label="リフォーム費用"             value={yen(parseNum(buyer.reform))}   indent />}
        {parseNum(buyer.hikkoshiB)> 0 && <Row label="引越し費用"                 value={yen(parseNum(buyer.hikkoshiB))} indent />}
        {parseNum(buyer.otherB)   > 0 && <Row label={buyer.otherBLabel || "その他"} value={yen(parseNum(buyer.otherB))} indent />}
        <Row label="諸費用合計（概算）" value={yen(total)} bold borderTop />

        {/* 総額 */}
        <SectionHead label="■ 総額" color="#065f46" />
        <Row label="売買金額"         value={yen(price)}         indent />
        <Row label="諸費用合計（概算）" value={yen(total)}         indent />
        <Row label="購入総額（概算）"  value={yen(price + total)} bold borderTop color="#065f46" />

        {/* ローンシミュレーション */}
        {loan > 0 && loanSim && (
          <>
            <SectionHead label="■ ローンシミュレーション（元利均等）" color="#374151" />
            <Row label="借入予定額"   value={yen(loan)}                   indent />
            <Row label="金利（年率）" value={`${buyer.loanKinri || "—"}%`} indent />
            <Row label="返済期間"     value={`${buyer.loanKikan || "—"}年`} indent />
            <Row label="月々返済額"   value={yen(loanSim.monthly)}         indent bold />
            <Row label="総返済額"     value={yen(loanSim.total)}           indent />
            <Row label="総利息"       value={yen(loanSim.interest)}        indent />
          </>
        )}
      </tbody>
    </table>
  );
}

export default function PrintView({ tab, seller, buyer }) {
  const isSeller = tab === "seller";
  const info = isSeller
    ? { title: "売主向け", name: seller.caseNameS, customer: seller.customerNameS, date: seller.dateS }
    : { title: "買主向け", name: buyer.caseNameB,  customer: buyer.customerNameB,  date: buyer.dateB };

  return (
    <div className="print-only" style={{ fontFamily: "'Hiragino Sans','Noto Sans JP',sans-serif", fontSize: 11, color: "#111", padding: "0 4mm" }}>
      {/* ヘッダー */}
      <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>
          不動産諸費用計算書（{info.title}）
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 6, fontSize: 11, color: "#374151" }}>
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
      <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 6, fontSize: 9, color: "#9ca3af", lineHeight: 1.7 }}>
        ※本書は概算であり、実際の費用とは異なる場合があります。
        ※譲渡所得税の計算は必ず税理士にご確認ください。
        ※登記費用は実際の固定資産税評価額により変わります。
        ※印紙代は軽減税率（令和9年3月31日まで）を適用しています。
      </div>
    </div>
  );
}
