import test from "node:test";
import assert from "node:assert/strict";

import {
  calcJotoZei,
  calcSellerExpense,
} from "../src/utils/calc.js";
import {
  createInitialSeller,
  normalizeSellerData,
  sumSellerOtherCosts,
} from "../src/utils/sellerData.js";

test("旧形式の売主その他費用を分類別の配列へ移行する", () => {
  const seller = normalizeSellerData({
    otherJotoLabel: "契約解除費用",
    otherJoto: "100000",
    otherSLabel: "引渡し準備費",
    otherS: "200000",
    otherS2Label: "土地管理費",
    otherS2: "300000",
    otherS3Label: "登記関連予備費",
    otherS3: "400000",
  });

  assert.deepEqual(seller.otherJotoCosts, [{
    id: "otherJoto1",
    label: "契約解除費用",
    amount: "100000",
  }]);
  assert.deepEqual(seller.otherNonTaxCosts, [
    { id: "otherS1", label: "引渡し準備費", amount: "200000" },
    { id: "otherS2", label: "土地管理費", amount: "300000" },
    { id: "otherS3", label: "登記関連予備費", amount: "400000" },
  ]);
});

test("明示的な空配列を旧フィールドから復活させない", () => {
  const seller = normalizeSellerData({
    otherJotoCosts: [],
    otherNonTaxCosts: [],
    otherJotoLabel: "古い譲渡費用",
    otherJoto: "100000",
    otherSLabel: "古いその他経費",
    otherS: "200000",
    otherS2: "300000",
    otherS3: "400000",
  });

  assert.deepEqual(seller.otherJotoCosts, []);
  assert.deepEqual(seller.otherNonTaxCosts, []);
  assert.equal(seller.otherJoto, "");
  assert.equal(seller.otherS, "");
  assert.equal(seller.otherS2, "");
  assert.equal(seller.otherS3, "");

  const reloaded = normalizeSellerData(seller);
  assert.deepEqual(reloaded.otherJotoCosts, []);
  assert.deepEqual(reloaded.otherNonTaxCosts, []);
});

test("新形式を優先し、旧フィールドを重複加算しない", () => {
  const seller = normalizeSellerData({
    otherJotoCosts: [
      { id: "j1", label: "譲渡費用A", amount: "100,000" },
      { id: "j2", label: "譲渡費用B", amount: "200000" },
    ],
    otherNonTaxCosts: [
      { id: "n1", label: "その他経費A", amount: "300000" },
      { id: "n2", label: "その他経費B", amount: "400000" },
    ],
    otherJoto: "999999",
    otherS: "999999",
    otherS2: "999999",
    otherS3: "999999",
  });

  assert.equal(sumSellerOtherCosts(seller.otherJotoCosts), 300000);
  assert.equal(sumSellerOtherCosts(seller.otherNonTaxCosts), 700000);
  assert.equal(seller.otherJoto, "100,000");
  assert.equal(seller.otherS, "300000");
  assert.equal(seller.otherS2, "400000");
  assert.equal(seller.otherS3, "");

  const reloaded = normalizeSellerData(seller);
  assert.equal(sumSellerOtherCosts(reloaded.otherJotoCosts), 300000);
  assert.equal(sumSellerOtherCosts(reloaded.otherNonTaxCosts), 700000);

  const withoutOtherCosts = normalizeSellerData({
    otherJotoCosts: [],
    otherNonTaxCosts: [],
  });
  assert.equal(
    calcSellerExpense(seller) - calcSellerExpense(withoutOtherCosts),
    1000000,
  );
});

function createTaxFixture(overrides = {}) {
  return normalizeSellerData({
    ...createInitialSeller("2026-08-02"),
    salePriceS: "10000000",
    autoChukoS: false,
    manualChukoS: "0",
    kaitai: "",
    metshitsu: "",
    sokuryo: "",
    souzokuToroku: "",
    teitoSetsu: "",
    jushoHenko: "",
    kenrishoPunshitsu: "",
    ihinZanchi: "",
    hikkoshi: "",
    shotokuhi5pct: false,
    shotokuhi: "0",
    otherJotoCosts: [],
    otherNonTaxCosts: [],
    ...overrides,
  });
}

test("譲渡費用のその他だけを譲渡所得税計算へ算入する", () => {
  const baseline = createTaxFixture();
  const deductible = createTaxFixture({
    otherJotoCosts: [
      { id: "j1", label: "譲渡費用A", amount: "100000" },
      { id: "j2", label: "譲渡費用B", amount: "50000" },
    ],
  });
  const nonTax = createTaxFixture({
    otherNonTaxCosts: [
      { id: "n1", label: "その他経費A", amount: "200000" },
      { id: "n2", label: "その他経費B", amount: "25000" },
    ],
  });
  const both = createTaxFixture({
    otherJotoCosts: [
      { id: "j1", label: "譲渡費用A", amount: "100000" },
      { id: "j2", label: "譲渡費用B", amount: "50000" },
    ],
    otherNonTaxCosts: [
      { id: "n1", label: "その他経費A", amount: "200000" },
      { id: "n2", label: "その他経費B", amount: "25000" },
    ],
  });

  const baselineTax = calcJotoZei(baseline);
  const deductibleTax = calcJotoZei(deductible);
  const nonTaxTax = calcJotoZei(nonTax);
  const bothTax = calcJotoZei(both);

  assert.equal(deductibleTax.jotoHiyo - baselineTax.jotoHiyo, 150000);
  assert.equal(nonTaxTax.jotoHiyo, baselineTax.jotoHiyo);
  assert.equal(bothTax.jotoHiyo, deductibleTax.jotoHiyo);
  assert.ok(deductibleTax.zei < baselineTax.zei);
  assert.equal(nonTaxTax.zei, baselineTax.zei);

  assert.equal(calcSellerExpense(deductible) - calcSellerExpense(baseline), 150000);
  assert.equal(calcSellerExpense(nonTax) - calcSellerExpense(baseline), 225000);
  assert.equal(calcSellerExpense(both) - calcSellerExpense(baseline), 375000);
});
