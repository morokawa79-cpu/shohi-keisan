import { calcBuyerPlanSummary } from "../utils/calc";
import { getLoanPlanDisplayName } from "../utils/buyerData";

const COMPARISON_ROWS = [
  { key: "planName", label: "プラン名" },
  { key: "lenderName", label: "金融機関" },
  { key: "loanAmount", label: "借入予定額" },
  { key: "annualRate", label: "金利" },
  { key: "years", label: "期間" },
  { key: "monthly", label: "月々" },
  { key: "repaymentTotal", label: "総返済" },
  { key: "interestTotal", label: "総利息" },
  { key: "costsTotal", label: "諸費用合計" },
  { key: "purchaseTotal", label: "購入総額" },
  { key: "requiredOwnFunds", label: "必要自己資金" },
];

const hasValue = (value) =>
  value != null && String(value).trim() !== "";

const textOrDash = (value) =>
  hasValue(value) ? String(value).trim() : "—";

const withUnit = (value, unit) =>
  hasValue(value) ? `${String(value).trim()}${unit}` : "—";

const yen = (value) =>
  Number.isFinite(value)
    ? `¥${Math.round(value).toLocaleString("ja-JP")}`
    : "—";

function createComparisonPlan(buyer, plan, sourceIndex) {
  const summary = calcBuyerPlanSummary(buyer, plan);

  return {
    key: `${plan.id || "plan"}-${sourceIndex}`,
    planNumber: sourceIndex + 1,
    isActive: plan.id === buyer.activeLoanPlanId,
    values: {
      planName: getLoanPlanDisplayName(buyer, plan),
      lenderName: textOrDash(plan.lenderName),
      loanAmount: yen(summary.loanAmount),
      annualRate: withUnit(plan.annualRate, "%"),
      years: withUnit(plan.years, "年"),
      monthly: yen(summary.loan?.monthly),
      repaymentTotal: yen(summary.loan?.total),
      interestTotal: yen(summary.loan?.interest),
      costsTotal: yen(summary.costsTotal),
      purchaseTotal: yen(summary.purchaseTotal),
      requiredOwnFunds: yen(summary.requiredOwnFunds),
    },
  };
}

export default function LoanPlanComparison({ buyer }) {
  const comparisonPlans = (Array.isArray(buyer?.loanPlans)
    ? buyer.loanPlans
    : [])
    .map((plan, sourceIndex) => ({ plan, sourceIndex }))
    .filter(({ plan }) => plan?.enabled === true && hasValue(plan.amount))
    .map(({ plan, sourceIndex }) =>
      createComparisonPlan(buyer, plan, sourceIndex));

  if (comparisonPlans.length === 0) {
    return (
      <p className="loan-comparison__empty" role="status">
        比較するには、ローンプランを有効にして借入予定額を入力してください。
      </p>
    );
  }

  return (
    <section
      className="loan-comparison"
      aria-labelledby="loan-comparison-title"
    >
      <h3 className="loan-comparison__title" id="loan-comparison-title">
        ローンプラン比較
      </h3>

      <div className="loan-comparison__desktop">
        <div
          className="loan-comparison__table-scroll"
          role="region"
          aria-label="ローンプラン比較表"
          tabIndex={0}
        >
          <table className="loan-comparison__table">
            <thead>
              <tr>
                <th className="loan-comparison__item-heading" scope="col">
                  比較項目
                </th>
                {comparisonPlans.map((comparisonPlan) => (
                  <th
                    className={`loan-comparison__plan-heading${comparisonPlan.isActive
                      ? " loan-comparison__plan-heading--active"
                      : ""}`}
                    key={comparisonPlan.key}
                    scope="col"
                  >
                    <span className="loan-comparison__plan-number">
                      プラン{comparisonPlan.planNumber}
                    </span>
                    {comparisonPlan.isActive && (
                      <span className="loan-comparison__active-badge">
                        採用中
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr className="loan-comparison__row" key={row.key}>
                  <th className="loan-comparison__row-label" scope="row">
                    {row.label}
                  </th>
                  {comparisonPlans.map((comparisonPlan) => (
                    <td
                      className={`loan-comparison__value${comparisonPlan.isActive
                        ? " loan-comparison__value--active"
                        : ""}`}
                      key={comparisonPlan.key}
                    >
                      {comparisonPlan.values[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="loan-comparison__mobile">
        {comparisonPlans.map((comparisonPlan) => (
          <article
            className={`loan-comparison__card${comparisonPlan.isActive
              ? " loan-comparison__card--active"
              : ""}`}
            key={comparisonPlan.key}
            aria-label={`プラン${comparisonPlan.planNumber}の比較結果`}
            aria-current={comparisonPlan.isActive ? "true" : undefined}
          >
            <header className="loan-comparison__card-header">
              <span className="loan-comparison__plan-number">
                プラン{comparisonPlan.planNumber}
              </span>
              {comparisonPlan.isActive && (
                <span className="loan-comparison__active-badge">採用中</span>
              )}
            </header>
            <dl className="loan-comparison__card-list">
              {COMPARISON_ROWS.map((row) => (
                <div className="loan-comparison__card-row" key={row.key}>
                  <dt className="loan-comparison__card-label">{row.label}</dt>
                  <dd className="loan-comparison__card-value">
                    {comparisonPlan.values[row.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
