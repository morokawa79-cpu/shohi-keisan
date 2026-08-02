import NumInput from "./NumInput";
import { createOtherCost, nextOtherCostId } from "../utils/buyerData";

export default function OtherCostsEditor({ otherCosts, onChange }) {
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
    const id = nextOtherCostId(costs);
    onChange([...costs, createOtherCost(costs.length, { id })]);
  };

  return (
    <div className="other-costs-editor">
      {costs.length === 0 ? (
        <p className="other-cost-empty">その他費用はありません。</p>
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
                aria-label={`${cost.label || "その他費用"}を削除`}
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
        aria-label="その他費用を追加"
      >
        ＋ その他費用を追加
      </button>
    </div>
  );
}
