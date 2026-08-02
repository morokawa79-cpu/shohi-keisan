import NumInput from "./NumInput";
import LoanPlanComparison from "./LoanPlanComparison";
import {
  calcBuyerPlanSummary,
  calcLoanPlanCostBreakdown,
} from "../utils/calc";
import { getLoanPlanDisplayName } from "../utils/buyerData";

const RATE_PRESETS = ["2.2", "3.3"];

function normalizeDecimalInput(value) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const decimalPoint = sanitized.indexOf(".");
  if (decimalPoint < 0) return sanitized;
  return `${sanitized.slice(0, decimalPoint + 1)}${sanitized.slice(decimalPoint + 1).replaceAll(".", "")}`;
}

function TextField({ id, label, value, onChange, inputMode, placeholder }) {
  return (
    <label className="loan-plan-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function LoanPlanCard({ buyer, plan, index, onUpdate, onAdopt, onDisable }) {
  const summary = calcBuyerPlanSummary(buyer, plan);
  const loanCosts = calcLoanPlanCostBreakdown(buyer, plan);
  const customFeeRate = !RATE_PRESETS.includes(plan.loanFeeRate);
  const customFeeRateText = String(plan.loanFeeRate ?? "").trim();
  const validCustomFeeRate = customFeeRateText !== ""
    && Number.isFinite(Number(customFeeRateText))
    && Number(customFeeRateText) >= 0;
  const displayName = getLoanPlanDisplayName(buyer, plan) || `プラン${index + 1}`;
  const feeRateErrorId = `${plan.id}-loan-fee-rate-error`;

  const setFeeRatePreset = (rate) => onUpdate({ loanFeeRate: rate });
  const setCustomFeeRate = () => {
    if (!customFeeRate) onUpdate({ loanFeeRate: "" });
  };

  return (
    <article
      className={`loan-plan-card${buyer.activeLoanPlanId === plan.id ? " is-active" : ""}`}
      aria-label={`${displayName}の入力`}
    >
      <div className="loan-plan-card-header">
        <div>
          <div className="loan-plan-card-title">
            <span>{displayName}</span>
            {buyer.activeLoanPlanId === plan.id && <span className="loan-plan-active-badge">採用中</span>}
          </div>
          <div className="loan-plan-card-subtitle">代替ローンプラン {index + 1}</div>
        </div>
        <label className="loan-plan-adopt-control">
          <input
            type="radio"
            name="active-loan-plan"
            checked={buyer.activeLoanPlanId === plan.id}
            onChange={() => onAdopt(plan.id)}
            aria-label={`${displayName}を採用プランにする`}
          />
          採用プランにする
        </label>
      </div>

      <div className="loan-plan-field-grid">
        <TextField
          id={`${plan.id}-name`}
          label="プラン名"
          value={plan.name}
          onChange={(value) => onUpdate({ name: value })}
          placeholder={`プラン${index + 1}`}
        />
        <TextField
          id={`${plan.id}-lender`}
          label="金融機関・商品名"
          value={plan.lenderName}
          onChange={(value) => onUpdate({ lenderName: value })}
          placeholder="例：〇〇銀行 変動金利"
        />
        <label className="loan-plan-field" htmlFor={`${plan.id}-amount`}>
          <span>借入予定額</span>
          <div className="loan-plan-input-with-unit">
            <NumInput
              id={`${plan.id}-amount`}
              value={plan.amount}
              onChange={(value) => onUpdate({ amount: value })}
              style={{ width: "100%" }}
            />
            <span>円</span>
          </div>
        </label>
        <TextField
          id={`${plan.id}-rate`}
          label="金利（年率%）"
          value={plan.annualRate}
          onChange={(value) => onUpdate({ annualRate: normalizeDecimalInput(value) })}
          inputMode="decimal"
          placeholder="例：1.2（0%も可）"
        />
        <TextField
          id={`${plan.id}-years`}
          label="返済期間（年）"
          value={plan.years}
          onChange={(value) => onUpdate({ years: normalizeDecimalInput(value) })}
          inputMode="decimal"
          placeholder="例：35"
        />
      </div>

      <fieldset className="loan-fee-fieldset">
        <legend>ローン事務手数料</legend>
        <div className="loan-fee-mode-row">
          <label>
            <input
              type="radio"
              name={`${plan.id}-fee-mode`}
              checked={plan.loanFeeMode === "auto"}
              onChange={() => onUpdate({ loanFeeMode: "auto" })}
            />
            自動計算
          </label>
          <label>
            <input
              type="radio"
              name={`${plan.id}-fee-mode`}
              checked={plan.loanFeeMode === "manual"}
              onChange={() => onUpdate({ loanFeeMode: "manual" })}
            />
            手入力
          </label>
        </div>

        {plan.loanFeeMode === "auto" ? (
          <div className="loan-fee-auto-panel">
            <div className="loan-fee-rate-row" role="radiogroup" aria-label={`${displayName}の手数料率`}>
              {RATE_PRESETS.map((rate) => (
                <label key={rate} className={plan.loanFeeRate === rate ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name={`${plan.id}-fee-rate`}
                    checked={plan.loanFeeRate === rate}
                    onChange={() => setFeeRatePreset(rate)}
                  />
                  {rate}%
                </label>
              ))}
              <label className={customFeeRate ? "is-selected" : ""}>
                <input
                  type="radio"
                  name={`${plan.id}-fee-rate`}
                  checked={customFeeRate}
                  onChange={setCustomFeeRate}
                />
                任意入力
              </label>
              {customFeeRate && (
                <div className="loan-fee-custom-rate">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={plan.loanFeeRate}
                    onChange={(event) => onUpdate({
                      loanFeeRate: normalizeDecimalInput(event.target.value),
                    })}
                    aria-label={`${displayName}の任意手数料率`}
                    aria-invalid={!validCustomFeeRate}
                    aria-describedby={!validCustomFeeRate ? feeRateErrorId : undefined}
                    placeholder="例：1.65"
                  />
                  <span>%</span>
                </div>
              )}
            </div>
            <div className="loan-fee-calculated">
              自動計算額 <strong>¥{loanCosts.loanFee.toLocaleString()}</strong>
              {customFeeRate && !validCustomFeeRate && <span id={feeRateErrorId} className="loan-fee-rate-warning">手数料率を正しく入力してください</span>}
            </div>
          </div>
        ) : (
          <label className="loan-fee-manual-input">
            <span>手数料額</span>
            <div className="loan-plan-input-with-unit">
              <NumInput
                value={plan.manualLoanFee}
                onChange={(value) => onUpdate({ manualLoanFee: value })}
                style={{ width: "100%" }}
              />
              <span>円</span>
            </div>
          </label>
        )}
      </fieldset>

      {summary.loan ? (
        <div className="loan-plan-quick-results" aria-label={`${displayName}の返済試算`}>
          <div><span>月々返済額</span><strong>¥{summary.loan.monthly.toLocaleString()}</strong></div>
          <div><span>総返済額</span><strong>¥{summary.loan.total.toLocaleString()}</strong></div>
          <div><span>総利息</span><strong>¥{summary.loan.interest.toLocaleString()}</strong></div>
        </div>
      ) : (
        <div className="loan-plan-empty-result">借入額・金利・期間を入力すると返済額を計算します</div>
      )}

      {index > 0 && (
        <div className="loan-plan-card-actions">
          <button
            type="button"
            className="loan-plan-disable-button"
            onClick={() => onDisable(plan.id)}
            aria-label={`${displayName}：このプランを未使用に戻す`}
          >
            このプランを未使用に戻す
          </button>
        </div>
      )}
    </article>
  );
}

export default function LoanPlanEditor({ buyer, setB }) {
  const enabledPlans = buyer.loanPlans.filter((plan) => plan.enabled);
  const nextDisabledPlan = buyer.loanPlans.find((plan, index) => index > 0 && !plan.enabled);
  const activePlan = buyer.loanPlans.find(
    (plan) => plan.id === buyer.activeLoanPlanId && plan.enabled,
  ) || buyer.loanPlans[0];
  const activeSummary = calcBuyerPlanSummary(buyer, activePlan);
  const activePlanName = getLoanPlanDisplayName(buyer, activePlan);

  const updatePlan = (planId, patch) => {
    setB("loanPlans", buyer.loanPlans.map((plan) => (
      plan.id === planId ? { ...plan, ...patch } : plan
    )));
  };

  const enableNextPlan = () => {
    if (nextDisabledPlan) updatePlan(nextDisabledPlan.id, { enabled: true });
  };

  const disablePlan = (planId) => {
    updatePlan(planId, { enabled: false });
    if (buyer.activeLoanPlanId === planId) setB("activeLoanPlanId", "plan1");
  };

  return (
    <section className="loan-plan-editor" aria-labelledby="loan-plan-editor-title">
      <div className="loan-plan-editor-heading">
        <div>
          <h3 id="loan-plan-editor-title">ローンプラン・返済試算</h3>
          <p>借入予定がある場合に入力してください。必要に応じて3件まで比較できます。</p>
        </div>
        {nextDisabledPlan && (
          <button type="button" className="loan-plan-add-button" onClick={enableNextPlan}>
            ＋ 比較プランを追加
          </button>
        )}
      </div>

      <div className="loan-plan-list">
        {enabledPlans.map((plan) => {
          const index = buyer.loanPlans.findIndex((item) => item.id === plan.id);
          return (
            <LoanPlanCard
              key={plan.id}
              buyer={buyer}
              plan={plan}
              index={index}
              onUpdate={(patch) => updatePlan(plan.id, patch)}
              onAdopt={(planId) => setB("activeLoanPlanId", planId)}
              onDisable={disablePlan}
            />
          );
        })}
      </div>

      <LoanPlanComparison buyer={buyer} />

      {activeSummary.loan && (
        <div className="active-loan-income-guide">
          <div className="active-loan-income-title">
            必要年収の目安（採用中：{activePlanName}）
          </div>
          <div className="active-loan-income-grid">
            {[["25%", 0.25], ["30%", 0.30], ["35%", 0.35]].map(([label, ratio]) => {
              const annualPayment = activeSummary.loan.monthly * 12;
              const neededIncome = Math.ceil(annualPayment / ratio / 10000) * 10000;
              return (
                <div key={label}>
                  <span>返済比率 {label}</span>
                  <strong>¥{neededIncome.toLocaleString()}</strong>
                </div>
              );
            })}
          </div>
          <p>※元利均等返済・ボーナス払いなしの概算です。金融機関により審査基準は異なります。</p>
        </div>
      )}
    </section>
  );
}
