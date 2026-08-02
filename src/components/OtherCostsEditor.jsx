import NumInput from "./NumInput";

function nextCostId(costs, idPrefix) {
  const ids = new Set(costs.map((item) => item.id));
  let number = 1;
  while (ids.has(`${idPrefix}${number}`)) number += 1;
  return `${idPrefix}${number}`;
}

export default function OtherCostsEditor({
  otherCosts,
  onChange,
  idPrefix = "other",
  defaultLabel = "その他",
  addButtonLabel = "その他費用を追加",
  emptyLabel = "その他費用はありません。",
}) {
  const costs = Array.isArray(otherCosts) ? otherCosts : [];

  const updateCost = (id, field, value) => {
    onChange(costs.map((cost) => (
      cost.id === id ? { ...cost, [field]: value } : cost
    )));
  };

  const removeCost = (id) => {
    onChange(costs.filter((cost) => cost.id !== id));
  };

  const addCost = () => {
    const id = nextCostId(costs, idPrefix);
    onChange([...costs, { id, label: defaultLabel, amount: "" }]);
  };

  return (
    <div className="other-costs-editor">
      {costs.length === 0 ? (
        <p className="other-cost-empty">{emptyLabel}</p>
      ) : (
        <div className="other-cost-list">
          {costs.map((cost) => (
            <div className="other-cost-row" key={cost.id}>
              <label className="other-cost-label-field">
                <span className="other-cost-field-label">名称</span>
                <input
                  className="other-cost-label-input"
                  type="text"
                  value={cost.label ?? ""}
                  onChange={(event) => updateCost(cost.id, "label", event.target.value)}
                  placeholder="項目名"
                />
              </label>

              <label className="other-cost-amount-field">
                <span className="other-cost-field-label">金額</span>
                <span className="other-cost-amount-input">
                  <NumInput
                    value={cost.amount ?? ""}
                    onChange={(value) => updateCost(cost.id, "amount", value)}
                  />
                  <span className="other-cost-unit">円</span>
                </span>
              </label>

              <button
                className="other-cost-remove"
                type="button"
                onClick={() => removeCost(cost.id)}
                aria-label={`${cost.label || defaultLabel}を削除`}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="other-cost-add"
        type="button"
        onClick={addCost}
        aria-label={addButtonLabel}
      >
        ＋ {addButtonLabel}
      </button>
    </div>
  );
}
