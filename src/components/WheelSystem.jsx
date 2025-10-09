// components/WheelSystem.jsx

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import WheelLayer from "./WheelLayer";

export default function WheelSystem({
  width,
  height,
  layersConfig,
  speedOptions,
  resetTrigger,
  bpm,
  isRunning,
  flash,
  slowFactor,
  seekTimestamp, // ✅ nouveau
}) {
  const cx = width / 2;
  const cy = height / 2;

  const [layers, setLayers] = useState(
    layersConfig.map((cfg) => ({ ...cfg, theta: 0 }))
  );

  // --- Effet classique : synchronisation continue sans casser les angles
  useEffect(() => {
    setLayers((prev) =>
      layersConfig.map((cfg, i) => {
        const old = prev[i];
        return { ...cfg, theta: old ? old.theta : 0 };
      })
    );
  }, [layersConfig]);

  // ✅ Seek effect : applique les nouveaux angles une fois
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (seekTimestamp === 0) return;
    // Nous n'ajoutons PAS layersConfig dans les dépendances,
    // car cet effet doit appliquer une seule fois l'état issu du seek,
    // sans être réexécuté par d'autres mises à jour structurelles.
    setLayers(layersConfig);
  }, [seekTimestamp]);

  useEffect(() => {
    setLayers((prev) =>
      prev.map((lay) => ({
        ...lay,
        theta: Math.PI / 2,
      }))
    );
  }, [resetTrigger]);

  const baseFactor = bpm / 60;

  const update = useCallback(
    (dt) => {
      if (!isRunning) {
        return;
      }
      setLayers((prev) => prev.map((lay) => {
          // si speedOptions est un objet { exponent, value }
          const speedEntry = speedOptions[lay.speedIndex];
          const speedBase = speedEntry?.value ?? speedEntry;
          const speedEffective = speedBase * baseFactor;
          const dTheta = speedEffective * 2 * Math.PI * dt * slowFactor * (lay.direction || 1);
          return {
            ...lay,
            theta: (lay.theta + dTheta + 2 * Math.PI) % (2 * Math.PI),
          };
        }))
    },
    [speedOptions, baseFactor, isRunning, slowFactor]
  );

  useAnimationFrame(update);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${cx},${cy})`}>
        {layers.map((lay, i) => (
          <WheelLayer key={i} layer={lay} flash={flash} phaseShifted={lay.phaseShifted} />
        ))}
      </g>
    </svg>
  );
}
