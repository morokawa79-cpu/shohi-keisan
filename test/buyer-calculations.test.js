import test from "node:test";
import assert from "node:assert/strict";

import {
  calcBorrowingExcess,
  calcBuyerCommonCostBreakdown,
  calcBuyerTotal,
  calcBuyerTotalForPlan,
  calcLoan,
  calcLoanPlanCostBreakdown,
  calcRequiredOwnFunds,
} from "../src/utils/calc.js";
import {
  createInitialBuyer,
  createLoanPlan,
  getLoanPlanDisplayName,
  normalizeBuyerData,
} from "../src/utils/buyerData.js";

function createCalculationFixture() {
  return normalizeBuyerData({
    ...createInitialBuyer("2026-08-02"),
    salePriceB: "100000",
    autoChukoB: false,
    manualChukoB: "0",
    autoIdo: false,
    idoKiroku: "0",
    autoTeito: false,
    teitoSetsuB: "0",
    autoFudo: false,
    fudosanShutoku: "0",
    otherCosts: [],
    loanPlans: [
      createLoanPlan(0, {
        amount: "100000",
        loanFeeMode: "manual",
        manualLoanFee: "0",
      }),
      createLoanPlan(1),
      createLoanPlan(2),
    ],
  });
}

test("購入総額より借入額が少ない場合は差額が必要自己資金になる", () => {
  const buyer = createCalculationFixture();
  assert.equal(calcRequiredOwnFunds(buyer, buyer.loanPlans[0]), 1200);
});

test("購入総額と借入額が同額の場合は必要自己資金が0円になる", () => {
  const buyer = createCalculationFixture();
  const plan = { ...buyer.loanPlans[0], amount: "101200" };
  assert.equal(calcRequiredOwnFunds(buyer, plan), 0);
});

test("借入額が購入総額を超える場合は必要自己資金が0円になる", () => {
  const buyer = createCalculationFixture();
  const plan = { ...buyer.loanPlans[0], amount: "110000" };
  assert.equal(calcRequiredOwnFunds(buyer, plan), 0);
});

test("借入超過額を正しく計算する", () => {
  const buyer = createCalculationFixture();
  const plan = { ...buyer.loanPlans[0], amount: "110000" };
  assert.equal(calcBorrowingExcess(buyer, plan), 8800);
});

test("3プランのローン依存費用が混ざらない", () => {
  const buyer = createCalculationFixture();
  const plans = [
    { ...buyer.loanPlans[0], amount: "100000", loanFeeMode: "auto", loanFeeRate: "2.2" },
    { ...buyer.loanPlans[1], enabled: true, amount: "200000", loanFeeMode: "auto", loanFeeRate: "3.3" },
    { ...buyer.loanPlans[2], enabled: true, amount: "300000", loanFeeMode: "manual", manualLoanFee: "7777" },
  ];

  assert.deepEqual(
    plans.map((plan) => calcBuyerTotalForPlan(buyer, plan)),
    [3400, 7800, 8977],
  );
});

test("不正な事務手数料率を部分的な数値として解釈しない", () => {
  const buyer = createCalculationFixture();
  for (const loanFeeRate of ["1..65", ".", " "]) {
    const plan = {
      ...buyer.loanPlans[0],
      amount: "100000",
      loanFeeMode: "auto",
      loanFeeRate,
    };
    assert.equal(calcLoanPlanCostBreakdown(buyer, plan).loanFee, 0);
  }
});

test("採用プラン変更で諸費用合計が切り替わる", () => {
  const base = createCalculationFixture();
  const plan2 = {
    ...base.loanPlans[1],
    enabled: true,
    amount: "200000",
    loanFeeMode: "auto",
    loanFeeRate: "3.3",
  };
  const buyer = normalizeBuyerData({
    ...base,
    loanPlans: [base.loanPlans[0], plan2, base.loanPlans[2]],
    activeLoanPlanId: "plan2",
  });

  assert.equal(calcBuyerTotal(buyer), calcBuyerTotalForPlan(buyer, plan2));
  assert.notEqual(calcBuyerTotal(buyer), calcBuyerTotalForPlan(buyer, buyer.loanPlans[0]));
});

test("金利0%でも月々返済額を計算する", () => {
  assert.deepEqual(calcLoan(1200000, 0, 1), {
    monthly: 100000,
    total: 1200000,
    interest: 0,
  });
});

test("無効なローン条件では計算しない", () => {
  assert.equal(calcLoan(0, 1.2, 35), null);
  assert.equal(calcLoan(1000000, -0.1, 35), null);
  assert.equal(calcLoan(1000000, 1.2, 0), null);
  assert.equal(calcLoan(1000000, "", 35), null);
});

test("旧保存データをプラン1へ移行する", () => {
  const buyer = normalizeBuyerData({
    loanAmtB: "19000000",
    loanKinri: "0",
    loanKikan: "30",
    autoLoanJimu: false,
    loanJimuRate: "1.65",
    loanJimu: "330000",
  });

  assert.deepEqual(
    {
      amount: buyer.loanPlans[0].amount,
      annualRate: buyer.loanPlans[0].annualRate,
      years: buyer.loanPlans[0].years,
      loanFeeMode: buyer.loanPlans[0].loanFeeMode,
      loanFeeRate: buyer.loanPlans[0].loanFeeRate,
      manualLoanFee: buyer.loanPlans[0].manualLoanFee,
    },
    {
      amount: "19000000",
      annualRate: "0",
      years: "30",
      loanFeeMode: "manual",
      loanFeeRate: "1.65",
      manualLoanFee: "330000",
    },
  );
});

test("初期状態ではプラン1のみ有効", () => {
  const buyer = createInitialBuyer("2026-08-02");
  assert.deepEqual(buyer.loanPlans.map((plan) => plan.enabled), [true, false, false]);
  assert.equal(buyer.activeLoanPlanId, "plan1");
});

test("空欄のプラン名は実際のプラン番号で表示する", () => {
  const buyer = normalizeBuyerData({
    loanPlans: [
      createLoanPlan(0),
      createLoanPlan(1, { enabled: true, name: "" }),
      createLoanPlan(2, { enabled: true, name: "   " }),
    ],
  });

  assert.equal(getLoanPlanDisplayName(buyer, buyer.loanPlans[1]), "プラン2");
  assert.equal(getLoanPlanDisplayName(buyer, buyer.loanPlans[2]), "プラン3");
});

test("一部プランだけの保存データを別プランへ複製しない", () => {
  const buyer = normalizeBuyerData({
    loanPlans: [{
      ...createLoanPlan(1),
      enabled: true,
      amount: "22200000",
    }],
    activeLoanPlanId: "plan2",
  });

  assert.equal(buyer.loanPlans[0].amount, "");
  assert.equal(buyer.loanPlans[1].amount, "22200000");
  assert.equal(buyer.activeLoanPlanId, "plan2");
});

test("無効な採用IDをプラン1へ戻し、無効プランの入力値は保持する", () => {
  const buyer = normalizeBuyerData({
    loanPlans: [
      createLoanPlan(0),
      createLoanPlan(1, { enabled: false, amount: "12345678" }),
      createLoanPlan(2),
    ],
    activeLoanPlanId: "plan2",
  });

  assert.equal(buyer.activeLoanPlanId, "plan1");
  assert.equal(buyer.loanPlans[1].amount, "12345678");
  assert.equal(buyer.loanPlans[1].enabled, false);
});

test("旧その他費用を先頭行へ移行し、複数行を一度だけ合計する", () => {
  const migrated = normalizeBuyerData({ otherBLabel: "予備費", otherB: "1500" });
  assert.deepEqual(migrated.otherCosts[0], {
    id: "other1",
    label: "予備費",
    amount: "1500",
  });

  const buyer = normalizeBuyerData({
    ...createCalculationFixture(),
    otherCosts: [
      { id: "other1", label: "予備費", amount: "1500" },
      { id: "other2", label: "家具", amount: "2500" },
    ],
  });
  assert.equal(calcBuyerCommonCostBreakdown(buyer).other, 4000);
});

test("新形式の空のその他費用一覧を旧フィールドから復活させない", () => {
  const buyer = normalizeBuyerData({
    otherCosts: [],
    otherBLabel: "古い項目",
    otherB: "9999",
  });
  assert.deepEqual(buyer.otherCosts, []);
});
