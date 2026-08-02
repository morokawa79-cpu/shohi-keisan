const JOTO_COST_OPTIONS = {
  idPrefix: "otherJoto",
  defaultLabel: "その他（譲渡費用算入可）",
};

const NON_TAX_COST_OPTIONS = {
  idPrefix: "otherS",
  defaultLabel: "その他",
};

const toInputValue = (value, fallback = "") =>
  value == null ? fallback : String(value);

const hasMeaningfulLegacyCost = (cost, defaultLabel) => {
  const amount = toInputValue(cost.amount).trim();
  const label = toInputValue(cost.label).trim();
  return amount !== "" || (label !== "" && label !== defaultLabel);
};

const normalizeCostOptions = (options = {}) => ({
  idPrefix: toInputValue(options.idPrefix, "sellerOther") || "sellerOther",
  defaultLabel: toInputValue(options.defaultLabel, "その他"),
});

export function createSellerOtherCost(index = 0, overrides = {}, options = {}) {
  const { idPrefix, defaultLabel } = normalizeCostOptions(options);
  const fallbackId = `${idPrefix}${index + 1}`;
  const requestedId = toInputValue(overrides.id, fallbackId).trim();

  return {
    id: requestedId || fallbackId,
    label: toInputValue(overrides.label, defaultLabel),
    amount: toInputValue(overrides.amount),
  };
}

function normalizeCostItems(items, options) {
  const usedIds = new Set();

  return items
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const normalized = createSellerOtherCost(index, item, options);
      let id = normalized.id;

      if (usedIds.has(id)) id = `${options.idPrefix}${index + 1}`;
      while (usedIds.has(id)) id = `${id}-${index + 1}`;
      usedIds.add(id);

      return { ...normalized, id };
    });
}

function normalizeLegacyCosts(candidates, options) {
  const meaningful = candidates.filter((cost) => (
    hasMeaningfulLegacyCost(cost, options.defaultLabel)
  ));
  const items = meaningful.length > 0
    ? meaningful
    : [candidates[0] || {}];
  return normalizeCostItems(items, options);
}

function normalizeSellerCostGroup(source, arrayKey, legacyCandidates, options) {
  if (Array.isArray(source[arrayKey])) {
    return normalizeCostItems(source[arrayKey], options);
  }
  return normalizeLegacyCosts(legacyCandidates, options);
}

export function createInitialSeller(today = new Date().toISOString().slice(0, 10)) {
  return {
    caseNameS: "",
    customerNameS: "",
    dateS: today,
    salePriceS: "",
    koteishisanS: "",
    kanrisei: "",
    autoChukoS: true,
    manualChukoS: "",
    // ── 譲渡費用OK（税額計算に算入）
    kaitai: "",
    metshitsu: "50000",
    sokuryo: "",
    otherJotoCosts: [createSellerOtherCost(0, {}, JOTO_COST_OPTIONS)],
    otherJoto: "",
    otherJotoLabel: JOTO_COST_OPTIONS.defaultLabel,
    // ── 経費NG（手残りに影響・税額には含まれない）
    teitoSetsu: "",
    jushoHenko: "",
    kenrishoPunshitsu: "",
    souzokuToroku: "",
    ihinZanchi: "",
    ihinZanchiJoto: false,
    hikkoshi: "",
    otherNonTaxCosts: [createSellerOtherCost(0, {}, NON_TAX_COST_OPTIONS)],
    otherS: "",
    otherSLabel: NON_TAX_COST_OPTIONS.defaultLabel,
    // 旧フィールド（後方互換）
    otherS2: "",
    otherS2Label: NON_TAX_COST_OPTIONS.defaultLabel,
    otherS3: "",
    otherS3Label: NON_TAX_COST_OPTIONS.defaultLabel,
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
}

export const initSeller = createInitialSeller();

export function normalizeSellerData(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const defaults = createInitialSeller();
  const otherJotoCosts = normalizeSellerCostGroup(
    source,
    "otherJotoCosts",
    [{ label: source.otherJotoLabel, amount: source.otherJoto }],
    JOTO_COST_OPTIONS,
  );
  const otherNonTaxCosts = normalizeSellerCostGroup(
    source,
    "otherNonTaxCosts",
    [
      { label: source.otherSLabel, amount: source.otherS },
      { label: source.otherS2Label, amount: source.otherS2 },
      { label: source.otherS3Label, amount: source.otherS3 },
    ],
    NON_TAX_COST_OPTIONS,
  );
  const firstJotoCost = otherJotoCosts[0];
  const legacyNonTaxCosts = [0, 1, 2].map((index) => (
    otherNonTaxCosts[index] || null
  ));

  return {
    ...defaults,
    ...source,
    dateS: toInputValue(source.dateS, defaults.dateS),
    otherJotoCosts,
    otherNonTaxCosts,

    // 新形式を旧版でも読めるよう、代表値を旧フィールドへ同期する。
    otherJoto: firstJotoCost?.amount ?? "",
    otherJotoLabel: firstJotoCost?.label ?? JOTO_COST_OPTIONS.defaultLabel,
    otherS: legacyNonTaxCosts[0]?.amount ?? "",
    otherSLabel: legacyNonTaxCosts[0]?.label ?? NON_TAX_COST_OPTIONS.defaultLabel,
    otherS2: legacyNonTaxCosts[1]?.amount ?? "",
    otherS2Label: legacyNonTaxCosts[1]?.label ?? NON_TAX_COST_OPTIONS.defaultLabel,
    otherS3: legacyNonTaxCosts[2]?.amount ?? "",
    otherS3Label: legacyNonTaxCosts[2]?.label ?? NON_TAX_COST_OPTIONS.defaultLabel,
  };
}

export function getSellerJotoOtherCosts(seller) {
  return normalizeSellerData(seller).otherJotoCosts;
}

export function getSellerNonTaxOtherCosts(seller) {
  return normalizeSellerData(seller).otherNonTaxCosts;
}

export function nextSellerOtherCostId(costs = [], idPrefix = "sellerOther") {
  const ids = new Set(costs.map((item) => item?.id));
  let number = 1;
  while (ids.has(`${idPrefix}${number}`)) number += 1;
  return `${idPrefix}${number}`;
}

export function sumSellerOtherCosts(costs = []) {
  return costs.reduce((total, cost) => {
    const amount = Number.parseFloat(toInputValue(cost?.amount).replace(/,/g, ""));
    return total + (Number.isNaN(amount) ? 0 : amount);
  }, 0);
}

export function sumSellerJotoOtherCosts(seller) {
  return sumSellerOtherCosts(getSellerJotoOtherCosts(seller));
}

export function sumSellerNonTaxOtherCosts(seller) {
  return sumSellerOtherCosts(getSellerNonTaxOtherCosts(seller));
}
