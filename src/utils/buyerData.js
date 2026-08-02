const PLAN_IDS = ["plan1", "plan2", "plan3"];

const toInputValue = (value, fallback = "") =>
  value == null ? fallback : String(value);

const normalizeLoanFeeMode = (value) =>
  value === "manual" || value === false ? "manual" : "auto";

export function createLoanPlan(index, overrides = {}) {
  const planNumber = index + 1;
  const defaults = {
    id: PLAN_IDS[index] || `plan${planNumber}`,
    enabled: index === 0,
    name: `プラン${planNumber}`,
    lenderName: "",
    amount: "",
    annualRate: index === 0 ? "3" : "",
    years: "35",
    loanFeeMode: "auto",
    loanFeeRate: index === 0 ? "3.3" : "2.2",
    manualLoanFee: "",
  };

  return {
    ...defaults,
    ...overrides,
    id: defaults.id,
    enabled: index === 0 ? true : overrides.enabled === true,
    name: toInputValue(overrides.name, defaults.name),
    lenderName: toInputValue(overrides.lenderName, defaults.lenderName),
    amount: toInputValue(overrides.amount, defaults.amount),
    annualRate: toInputValue(overrides.annualRate, defaults.annualRate),
    years: toInputValue(overrides.years, defaults.years),
    loanFeeMode: normalizeLoanFeeMode(overrides.loanFeeMode ?? defaults.loanFeeMode),
    loanFeeRate: toInputValue(overrides.loanFeeRate, defaults.loanFeeRate),
    manualLoanFee: toInputValue(overrides.manualLoanFee, defaults.manualLoanFee),
  };
}

export function createOtherCost(index = 0, overrides = {}) {
  return {
    id: toInputValue(overrides.id, `other${index + 1}`),
    label: toInputValue(overrides.label, "その他"),
    amount: toInputValue(overrides.amount, ""),
  };
}

export function createInitialBuyer(today = new Date().toISOString().slice(0, 10)) {
  return {
    caseNameB: "",
    customerNameB: "",
    dateB: today,
    salePriceB: "",
    jukyoyo: true,
    shinchiku: false,
    autoChukoB: true,
    manualChukoB: "",
    autoIdo: true,
    autoTeito: true,
    autoFudo: true,
    idoKiroku: "",
    teitoSetsuB: "",
    fudosanShutoku: "",
    kasai: "",
    koteishisan: "",
    kanriB: "",
    reform: "",
    hikkoshiB: "",
    otherCosts: [createOtherCost()],
    loanPlans: [
      createLoanPlan(0),
      createLoanPlan(1),
      createLoanPlan(2),
    ],
    activeLoanPlanId: "plan1",

    // 旧形式との相互運用用。新しい画面・計算では loanPlans / otherCosts を正とする。
    loanAmtB: "",
    loanKinri: "3",
    loanKikan: "35",
    autoLoanJimu: true,
    loanJimuRate: "3.3",
    loanJimu: "",
    otherB: "",
    otherBLabel: "その他",
  };
}

export const initBuyer = createInitialBuyer();

function legacyPlanFrom(data) {
  return {
    amount: data.loanAmtB,
    annualRate: data.loanKinri,
    years: data.loanKikan,
    loanFeeMode: data.autoLoanJimu === false ? "manual" : "auto",
    loanFeeRate: data.loanJimuRate,
    manualLoanFee: data.loanJimu,
  };
}

function normalizeOtherCosts(data) {
  const sourceCosts = Array.isArray(data.otherCosts)
    ? data.otherCosts.filter((item) => item && typeof item === "object")
    : null;

  if (!sourceCosts) {
    return [createOtherCost(0, {
      label: data.otherBLabel,
      amount: data.otherB,
    })];
  }

  const usedIds = new Set();
  return sourceCosts.map((item, index) => {
    let id = toInputValue(item.id, `other${index + 1}`);
    if (usedIds.has(id)) id = `other${index + 1}`;
    while (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    return createOtherCost(index, { ...item, id });
  });
}

export function normalizeBuyerData(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const defaults = createInitialBuyer();
  const hasLoanPlans = Array.isArray(source.loanPlans);
  const sourcePlans = hasLoanPlans
    ? source.loanPlans.filter((plan) => plan && typeof plan === "object")
    : [];
  const legacyPlan = legacyPlanFrom(source);
  const usedPlanIndexes = new Set();

  const loanPlans = PLAN_IDS.map((id, index) => {
    let storedIndex = sourcePlans.findIndex(
      (plan, planIndex) => plan.id === id && !usedPlanIndexes.has(planIndex),
    );
    if (storedIndex < 0) {
      storedIndex = sourcePlans.findIndex(
        (plan, planIndex) => !usedPlanIndexes.has(planIndex)
          && !PLAN_IDS.includes(plan.id),
      );
    }
    if (storedIndex >= 0) usedPlanIndexes.add(storedIndex);
    const stored = storedIndex >= 0 ? sourcePlans[storedIndex] : {};
    const migrated = index === 0 && !hasLoanPlans ? legacyPlan : {};
    return createLoanPlan(index, { ...migrated, ...stored });
  });

  const requestedActiveId = toInputValue(source.activeLoanPlanId, "plan1");
  const activeLoanPlanId = loanPlans.some(
    (plan) => plan.id === requestedActiveId && plan.enabled,
  )
    ? requestedActiveId
    : "plan1";
  const otherCosts = normalizeOtherCosts(source);
  const plan1 = loanPlans[0];
  const firstOtherCost = otherCosts[0] || createOtherCost();

  return {
    ...defaults,
    ...source,
    dateB: toInputValue(source.dateB, defaults.dateB),
    loanPlans,
    activeLoanPlanId,
    otherCosts,

    // 新形式で保存した案件を旧版でも読めるよう、代表値を同期する。
    loanAmtB: plan1.amount,
    loanKinri: plan1.annualRate,
    loanKikan: plan1.years,
    autoLoanJimu: plan1.loanFeeMode === "auto",
    loanJimuRate: plan1.loanFeeRate,
    loanJimu: plan1.manualLoanFee,
    otherB: firstOtherCost.amount,
    otherBLabel: firstOtherCost.label,
  };
}

export function getActiveLoanPlan(buyer) {
  const normalized = normalizeBuyerData(buyer);
  return normalized.loanPlans.find(
    (plan) => plan.id === normalized.activeLoanPlanId && plan.enabled,
  ) || normalized.loanPlans[0];
}

export function getEnabledLoanPlans(buyer) {
  return normalizeBuyerData(buyer).loanPlans.filter((plan) => plan.enabled);
}

export function getLoanPlanDisplayName(buyer, plan) {
  const storedName = toInputValue(plan?.name).trim();
  if (storedName) return storedName;

  const plans = Array.isArray(buyer?.loanPlans) ? buyer.loanPlans : [];
  const planIndex = plans.findIndex(
    (candidate) => candidate === plan || (plan?.id && candidate?.id === plan.id),
  );
  return `プラン${planIndex >= 0 ? planIndex + 1 : 1}`;
}

export function nextOtherCostId(otherCosts = []) {
  const ids = new Set(otherCosts.map((item) => item.id));
  let number = 1;
  while (ids.has(`other${number}`)) number += 1;
  return `other${number}`;
}
