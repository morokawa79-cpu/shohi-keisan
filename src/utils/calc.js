// ── ユーティリティ ──────────────────────────
export const fmt = (n) =>
  n == null || n === "" ? "—" : `¥${Math.round(n).toLocaleString()}`;

export const parseNum = (s) => {
  const n = parseFloat(String(s).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};

// 仲介手数料（上限・税込）
export function calcChuko(price) {
  if (!price || price <= 0) return 0;
  if (price <= 8000000) return 330000; // 低廉な不動産特例：800万以下は33万円（税込）上限
  let fee;
  if (price <= 2000000) fee = price * 0.05;
  else if (price <= 4000000) fee = price * 0.04 + 20000;
  else fee = price * 0.03 + 60000;
  return Math.floor(fee * 1.1);
}

// 印紙代（不動産売買契約書・軽減税率後）
export function calcInshiBaibai(price) {
  if (!price || price <= 100000) return 200;   // ≤10万
  if (price <= 500000) return 200;             // 10万超〜50万以下
  if (price <= 1000000) return 500;            // 50万超〜100万以下
  if (price <= 5000000) return 1000;           // 100万超〜500万以下
  if (price <= 10000000) return 5000;          // 500万超〜1,000万以下
  if (price <= 50000000) return 10000;         // 1,000万超〜5,000万以下
  if (price <= 100000000) return 30000;        // 5,000万超〜1億以下
  if (price <= 500000000) return 60000;        // 1億超〜5億以下
  return 160000;                               // 5億超〜10億以下
}

// 印紙代（金銭消費貸借契約書・軽減税率後）
export function calcInshiKinsho(loanAmt) {
  if (!loanAmt || loanAmt <= 0) return 0;
  if (loanAmt <= 1000000) return 1000;         // ≤100万（軽減対象外）
  if (loanAmt <= 5000000) return 1000;         // 100万超〜500万以下：軽減後1,000円
  if (loanAmt <= 10000000) return 5000;        // 500万超〜1,000万以下：軽減後5,000円
  if (loanAmt <= 50000000) return 20000;       // 1,000万超〜5,000万以下：軽減後20,000円
  if (loanAmt <= 100000000) return 60000;      // 5,000万超〜1億以下：軽減後60,000円
  if (loanAmt <= 500000000) return 160000;     // 1億超〜5億以下：軽減後160,000円
  return 320000;                               // 5億超〜10億以下：軽減後320,000円
}

// ── 売主計算 ────────────────────────────────

// 経費合計（譲渡税除く）
export function calcSellerExpense(f) {
  const price = parseNum(f.salePriceS);
  const chuko = f.autoChukoS !== false ? calcChuko(price) : parseNum(f.manualChukoS);
  const items = [
    // 譲渡費用OK
    chuko,
    calcInshiBaibai(price),
    parseNum(f.kaitai),
    parseNum(f.metshitsu),
    parseNum(f.sokuryo),
    parseNum(f.otherJoto),
    // 経費NG（手残りには影響・税額計算には含まれない）
    parseNum(f.teitoSetsu),
    parseNum(f.jushoHenko),
    parseNum(f.kenrishoPunshitsu),
    parseNum(f.souzokuToroku),
    parseNum(f.ihinZanchi),
    parseNum(f.hikkoshi),
    parseNum(f.otherS),
    // 旧フィールド（後方互換）
    parseNum(f.otherS2),
    parseNum(f.otherS3),
  ];
  return items.reduce((a, b) => a + b, 0);
}

// 譲渡所得税概算
export function calcJotoZei(f) {
  const price = parseNum(f.salePriceS);
  if (!price) return { zei: 0, breakdown: null };

  const shotokuhi = f.shotokuhi5pct ? price * 0.05 : parseNum(f.shotokuhi);

  const chukoForTax = f.autoChukoS !== false ? calcChuko(price) : parseNum(f.manualChukoS);
  const jotoHiyo = chukoForTax
    + calcInshiBaibai(price)
    + parseNum(f.kaitai)
    + parseNum(f.sokuryo)
    + parseNum(f.metshitsu)
    + parseNum(f.otherJoto)
    + (f.ihinZanchiJoto !== false ? parseNum(f.ihinZanchi) : 0)
    + parseNum(f.souzokuToroku);

  const jotoShotoku = price - shotokuhi - jotoHiyo;

  let kojo = 0;
  if (f.kojo3000) kojo += 30000000;
  if (f.kojo3000Sozoku && price <= 100000000) kojo += 30000000;
  if (f.teiMiriyo) kojo += 1000000;

  const kazeiShotoku = Math.max(0, jotoShotoku - kojo);

  let zei, zeiritsu;
  if (f.keigenZeiritsu) {
    const under = Math.min(kazeiShotoku, 60000000);
    const over  = Math.max(0, kazeiShotoku - 60000000);
    zei = Math.floor(under * 0.1421 + over * 0.20315);
    zeiritsu = 0.1421;
  } else if (f.taxKubun === "short") {
    zeiritsu = 0.3963;
    zei = Math.floor(kazeiShotoku * zeiritsu);
  } else {
    zeiritsu = 0.20315;
    zei = Math.floor(kazeiShotoku * zeiritsu);
  }

  return { zei, shotokuhi, jotoHiyo, jotoShotoku, kojo, kazeiShotoku, zeiritsu };
}

export function calcSellerTotal(f) {
  const expense = calcSellerExpense(f);
  const { zei } = calcJotoZei(f);
  return expense + zei;
}

// ── 買主概算自動計算 ─────────────────────────

// 所有権移転登記（居住用：土地1.5%＋建物0.3%、非居住用：2%）
export function calcIdoKirokuAuto(price, jukyoyo = true) {
  if (!price) return 0;
  const hyoka = price * 0.7;
  const tochi = hyoka * 0.5;
  const tatemono = hyoka * 0.5;
  let zei;
  if (jukyoyo) {
    zei = Math.floor(tochi * 0.015) + Math.floor(tatemono * 0.003);
  } else {
    zei = Math.floor(hyoka * 0.02);
  }
  return zei + 70000;
}

// 抵当権設定登記（借入額×0.1%居住用軽減、非居住用0.4%、司法書士4万）
export function calcTeitoSetsuBAuto(loan, jukyoyo = true) {
  if (!loan) return 0;
  const rate = jukyoyo ? 0.001 : 0.004;
  return Math.floor(loan * rate) + 40000;
}

// 不動産取得税（居住用：実質0円が多い、非居住用：×4%）
export function calcFudosanShutokuAuto(price, jukyoyo = true) {
  if (!price) return 0;
  if (jukyoyo) return 0;
  const hyoka = price * 0.7;
  return Math.floor(hyoka * 0.04);
}

// ローン事務手数料（率指定）
export function calcLoanJimuAuto(loan, rate = 3.3) {
  if (!loan) return 0;
  return Math.floor(loan * (rate / 100));
}

// ── ローンシミュレーション ───────────────────
export function calcLoan(principal, annualRate, years) {
  if (!principal || !annualRate || !years) return null;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) {
    const monthly = Math.floor(principal / n);
    return { monthly, total: monthly * n, interest: 0 };
  }
  const monthly = Math.floor(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  const total = monthly * n;
  return { monthly, total, interest: total - principal };
}

export function calcBuyerTotal(f) {
  const price = parseNum(f.salePriceB);
  const loan = parseNum(f.loanAmtB);
  const jky = f.jukyoyo !== false;
  const items = [
    f.autoChukoB !== false ? calcChuko(price) : parseNum(f.manualChukoB),
    calcInshiBaibai(price),
    calcInshiKinsho(loan),
    f.autoIdo      !== false ? calcIdoKirokuAuto(price, jky)                             : parseNum(f.idoKiroku),
    f.autoTeito    !== false ? calcTeitoSetsuBAuto(loan, jky)                            : parseNum(f.teitoSetsuB),
    f.autoFudo     !== false ? calcFudosanShutokuAuto(price, jky)                        : parseNum(f.fudosanShutoku),
    f.autoLoanJimu !== false ? calcLoanJimuAuto(loan, parseFloat(f.loanJimuRate) || 3.3) : parseNum(f.loanJimu),
    parseNum(f.kasai),
    parseNum(f.koteishisan),
    parseNum(f.kanriB),
    parseNum(f.reform),
    parseNum(f.hikkoshiB),
    parseNum(f.otherB),
  ];
  return items.reduce((a, b) => a + b, 0);
}
