import { useState, useEffect } from "react";

const formatDisplayValue = (value) => {
  if (value === "" || value === undefined || value === null) return "";
  const n = parseFloat(String(value).replace(/,/g, ""));
  return !isNaN(n) ? n.toLocaleString() : String(value);
};

export default function NumInput({ value, onChange, style, ...inputProps }) {
  const [display, setDisplay] = useState(() => formatDisplayValue(value));

  useEffect(() => {
    setDisplay(formatDisplayValue(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDisplay(raw ? parseInt(raw, 10).toLocaleString() : "");
    onChange(raw);
  };

  return (
    <input
      {...inputProps}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder="0"
      style={style}
    />
  );
}
