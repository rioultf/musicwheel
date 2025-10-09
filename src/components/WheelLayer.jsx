import React from "react";
import CrownWedges from "./CrownWedges";

export default function WheelLayer({ layer, flash, phaseShifted }) {
  const { innerRadius, outerRadius, theta, motifConfig } = layer;
  return (
    <CrownWedges
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      theta={theta}
      motifConfig={motifConfig}
      flash={flash}
      phaseShifted={phaseShifted} // ✅ transmis ici
    />
  );
}
