// components/WheelControls.jsx
import React from "react";

export default function WheelControls({
  layersConfig,
  onChange,
  onChangeSpeedIndex,
  onToggleDirection,
  speedOptions,
}) {
  const handleBarIncrement = (index, delta) => {
    const cfg = layersConfig[index];
    const newVal = Math.max(1, cfg.motifConfig.nWedges + delta);
    const newMotif = { ...cfg.motifConfig, nWedges: newVal };
    onChange(index, newMotif);
  };

  const handleSpeedIncrement = (index, delta) => {
    onChangeSpeedIndex(index, delta);
  };

  

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1em", marginTop: "1em" }}>
      {layersConfig.map((cfg, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <div style={{ width: "7em" }}>Couche {i + 1}</div>

          {/* contrôle des barreaux */}
          <button onClick={() => handleBarIncrement(i, -1)}>-</button>
          <span style={{ width: "2em", textAlign: "center" }}>{cfg.motifConfig.nWedges}</span>
          <button onClick={() => handleBarIncrement(i, +1)}>+</button>

          <span style={{ width: "1em" }}></span>

          {/* contrôle de la vitesse */}
          <button onClick={() => handleSpeedIncrement(i, -1)}>-v</button>
          <span style={{ width: "4em", textAlign: "center" }}>
            {speedOptions[cfg.speedIndex].exponent}
          </span>
          <button onClick={() => handleSpeedIncrement(i, +1)}>+v</button>

          <span style={{ width: "1em" }}></span>

          {/* switch / checkbox sens de rotation */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.25em" }}>
            <input
              type="checkbox"
              checked={cfg.direction === -1}
              onChange={() => onToggleDirection(i)}
            />
            ↺
          </label>
        </div>
      ))}
    </div>
  );
}
