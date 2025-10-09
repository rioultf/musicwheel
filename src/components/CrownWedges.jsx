import React from "react";

export default function CrownWedges({
  innerRadius,
  outerRadius,
  theta,
  motifConfig,
  flash = false,
  phaseShifted = false,
}) {
  const {
    nWedges = 1,
    widthFactor = 1,
    color = "black",
    opacity = 1,
    showRims = true,
  } = motifConfig;

  const flashColor = flash ? "green" : color;

  const toXY = (r, a) => ({
    x: r * Math.cos(a),
    y: r * Math.sin(a),
  });

  // Décalage de phase angulaire (π/nWedges pour un wedge unique aussi)
  const phaseOffset = phaseShifted ? Math.PI / nWedges : 0;

  // Cas spécial : demi-disque **intérieur**
  if (innerRadius === 0 && nWedges === 1) {
    // ouverture totale : π * widthFactor  (0 → fermé, 1 → demi-disque complet)
    const totalAngle = Math.PI * Math.max(0, Math.min(1, widthFactor * 2));
    const half = totalAngle / 2;

    // orientation centrée verticalement (π/2) + décalage de phase éventuel
    const baseShift = 0; //Math.PI / 2;
    const a1 = -half - baseShift + phaseOffset;
    const a2 = +half - baseShift + phaseOffset;

    const P1 = toXY(outerRadius, a1);
    const P2 = toXY(outerRadius, a2);

    const deltaAngle = a2 - a1;
    const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;
    const sweepFlag = 1;

    const d = [
      `M 0 0`,
      `L ${P1.x} ${P1.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${P2.x} ${P2.y}`,
      `Z`,
    ].join(" ");

    return (
      <g transform={`rotate(${(theta * 180 ) / Math.PI})`} style={{ pointerEvents: "none" }}>
        <path d={d} fill={flashColor} fillOpacity={opacity} stroke="none" />
        {showRims && (
          <circle
            cx={0}
            cy={0}
            r={outerRadius}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={opacity * 0.5}
          />
        )}
      </g>
    );
  }

  // --- Cas normal : plusieurs secteurs ou anneau ---
  const sectorAngle = (2 * Math.PI) / nWedges;
  const half = (sectorAngle * Math.max(0, Math.min(1, widthFactor))) / 2;

  const bars = [];

  for (let i = 0; i < nWedges; i++) {
    const center = i * sectorAngle;
    const a1 = center - half;
    const a2 = center + half;

    const A = toXY(innerRadius, a1);
    const B = toXY(outerRadius, a1);
    const C = toXY(outerRadius, a2);
    const D = toXY(innerRadius, a2);

    const deltaAngle = a2 - a1;
    const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;
    const sweepFlag = 1;
    const innerSweepFlag = 0;

    let d;
    if (innerRadius === 0) {
      const P1 = toXY(outerRadius, a1);
      const P2 = toXY(outerRadius, a2);
      d = [
        `M 0 0`,
        `L ${P1.x} ${P1.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${P2.x} ${P2.y}`,
        `Z`,
      ].join(" ");
    } else {
      d = [
        `M ${A.x} ${A.y}`,
        `L ${B.x} ${B.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${C.x} ${C.y}`,
        `L ${D.x} ${D.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} ${innerSweepFlag} ${A.x} ${A.y}`,
        `Z`,
      ].join(" ");
    }

    bars.push(
      <path key={i} d={d} fill={flashColor} fillOpacity={opacity} stroke="none" />
    );
  }

  // Ajoute la rotation globale et les cercles de contour
  const rotationDeg = ((theta + phaseOffset) * 180) / Math.PI;

  return (
    <g transform={`rotate(${rotationDeg})`} style={{ pointerEvents: "none" }}>
      {showRims && innerRadius > 0 && (
        <circle
          cx={0}
          cy={0}
          r={innerRadius}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={opacity * 0.5}
        />
      )}
      {showRims && (
        <circle
          cx={0}
          cy={0}
          r={outerRadius}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={opacity * 0.5}
        />
      )}
      {bars}
    </g>
  );
}
