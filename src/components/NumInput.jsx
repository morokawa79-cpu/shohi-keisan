import { useState, useEffect } from "react";

export default function NumInput({ value, onChange, style }) {
  const [display, setDisplay] = useState(() => {
    const n = parseFloat(String(value).replace(/,/g, ""));
    return !isNaN(n) && n !== 0 ? n.toLocaleString() : (value || "");
  });

  useEffect(() => {
    if (value === "" || value === undefined) {
      setDisplay("");
    } else {
      const n = parseFloat(String(value).replace(/,/g, ""));
      if (!isNaN(n) && n > 0) setDisplay(n.toLocaleString());
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDisplay(raw ? parseInt(raw, 10).toLocaleString() : "");
    onChange(raw);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder="0"
      style={style}
    />
  );
}
