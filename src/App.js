// App.js

import React, { useEffect, useState } from "react";
import WheelSystem from "./components/WheelSystem";
import ControlPanel from "./components/ControlPanel";
import "./components/ControlPanel.css";
import { useAnimationFrame } from "./hooks/useAnimationFrame";

// --- PÉRIODES DE RÉVOLUTION FIXES (en secondes) ---
//const periodOptions = [64, 48, 32, 24, 16, 12, 8, 6, 4, 3, 2, 1];
//const periodOptions = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64]

const periodOptions = Array(50).fill().map((element, index) => index + 1)

// --- speedOptions dérivé des périodes ---
const speedOptions = periodOptions.map((period, i) => ({
  exponent: period,      // simple identifiant lisible (1, 2, 3, …)
  value: 1 / period,    // vitesse en tours par seconde
  period: period,       // on garde la période explicite pour les calculs
}));

const R_MAX = 120;
function grayForLayer(index, totalLayers) {
  const dark = 0x33;
  const light = 0xCC;
  const t = totalLayers > 1 ? index / (totalLayers - 1) : 0;
  const grayVal = Math.round(dark + (light - dark) * t);
  const hex = grayVal.toString(16).padStart(2, "0");
  return `#${hex}${hex}${hex}`;
}

// ---- Temps de recouvrement global pour vitesses = (1/√2)^exponent
function computeRecurrenceTime(speedIndices, layersConfig, speedOptions) {
  if (!speedIndices.length) return 0;

  // --- Récupère les périodes et wedges
  const periods = speedIndices.map((si) => speedOptions[si].period);
  const nWedgesList = layersConfig.map(
    (cfg) => cfg?.motifConfig?.nWedges || 1
  );

  // --- Fonction PGCD / PPCM sur entiers
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  // --- Convertit toutes les périodes visuelles en rationnels exacts
  // T_i' = T_i / n_i
  // Pour manipuler des entiers, on prend le PPCM des dénominateurs (n_i)
  let commonDenom = nWedgesList[0];
  for (let i = 1; i < nWedgesList.length; i++) {
    commonDenom = lcm(commonDenom, nWedgesList[i]);
  }

  // Numérateurs communs : T_i * (commonDenom / n_i)
  const numerators = periods.map(
    (p, i) => p * (commonDenom / nWedgesList[i])
  );

  // --- PPCM des numérateurs
  let commonNum = numerators[0];
  for (let i = 1; i < numerators.length; i++) {
    commonNum = lcm(commonNum, numerators[i]);
  }

  // --- Résultat final : temps de récurrence global
  const recurrence = commonNum / commonDenom;

  return recurrence;
}

export default function App() {
  const scale = 2; // ou 2.0 pour doubler la taille

  const [layersConfig, setLayersConfig] = useState([
    {
      speedIndex: 0,
      direction: 1,
      phaseShifted: false, // ✅ nouvelle propriété
      motifConfig: {
        nWedges: 1,
        widthFactor: 0.5,
        color: "#333333",
        opacity: 0.9,
        showRims: false,
      },
    },
  ]);

  const [resetTrigger, setResetTrigger] = useState(0);
  const [bpm, setBpm] = useState(60);
  const [isRunning, setIsRunning] = useState(true);
  const [revolutions, setRevolutions] = useState(0);
  const [flash, setFlash] = useState(false);
  const [useEase, setUseEase] = useState(true);
  const [seekTimestamp, setSeekTimestamp] = useState(0);

  /*
    // --- horodatage du dernier Sync + "now" qui tique pour la jauge
    const [lastSyncTime, setLastSyncTime] = useState(Date.now());
    const [nowMs, setNowMs] = useState(Date.now());
    useEffect(() => {
      const id = setInterval(() => setNowMs(Date.now()), 100); // tick 10 Hz
      return () => clearInterval(id);
    }, []); // toujours actif : le temps écoulé est réel, même en pause
  
  const [elapsedSec, setElapsedSec] = useState(0);
  */


  const rebuildRadiiAndColors = (configs) => {
    const k = configs.length;
    return configs.map((cfg, i) => {
      const innerRadius = (i / k) * R_MAX;
      const outerRadius = ((i + 1) / k) * R_MAX;
      const color = grayForLayer(i, k);
      const newMotif = { ...cfg.motifConfig, color };
      return { ...cfg, innerRadius, outerRadius, motifConfig: newMotif };
    });
  };

  // Fonctions sur couches, wedges, vitesses, directions
  const handleAddLayer = () => {
    setLayersConfig((prev) => {
      const newCfg = {
        speedIndex: 0,
        direction: 1,
        motifConfig: {
          nWedges: 1,
          widthFactor: 0.5,
          color: "#888888",
          opacity: 0.8,
          showRims: true,
        },
      };
      const arr = [...prev, newCfg];
      return rebuildRadiiAndColors(arr);
    });
  };

  const handleRemoveLayer = () => {
    setLayersConfig((prev) => {
      if (prev.length <= 1) return prev;
      const arr = prev.slice(0, prev.length - 1);
      return rebuildRadiiAndColors(arr);
    });
  };

  const handleChangeLayer = (index, newMotifConfig) => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg, i) =>
        i === index ? { ...cfg, motifConfig: newMotifConfig } : cfg
      );
      return rebuildRadiiAndColors(arr);
    });
  };

  const handleChangeSpeedIndex = (index, delta) => {
    setLayersConfig((prev) =>
      prev.map((cfg, i) => {
        if (i !== index) return cfg;
        const newIndex = Math.max(
          0,
          Math.min(cfg.speedIndex + delta, speedOptions.length - 1)
        );
        return { ...cfg, speedIndex: newIndex };
      })
    );
  };

  const onTogglePhase = (idx) => {
    setLayersConfig((prev) =>
      prev.map((cfg, i) =>
        i === idx ? { ...cfg, phaseShifted: !cfg.phaseShifted } : cfg
      )
    );
  };

  const onChangeLayerWidth = (index, newValue) => {
    setLayersConfig((prev) =>
      prev.map((cfg, i) =>
        i === index
          ? { ...cfg, motifConfig: { ...cfg.motifConfig, widthFactor: newValue } }
          : cfg
      )
    );
  };


  const onRewind10s = () => {
    if (recurrenceTime < 10) return; // trop court, on ignore

    const current = elapsedSec;
    let newElapsed = 0;

    if (current >= 10) {
      newElapsed = current - 10;
    } else {
      newElapsed = recurrenceTime - 10;
    }

    // Met à jour la jauge et repositionne les bagues
    const fraction = newElapsed / recurrenceTime;
    onSeek(fraction);
  };

  const handleToggleDirection = (index) => {
    setLayersConfig((prev) =>
      prev.map((cfg, i) =>
        i === index ? { ...cfg, direction: (cfg.direction || 1) * -1 } : cfg
      )
    );
  };

  const incrementAllWedges = (delta) => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({
        ...cfg,
        motifConfig: {
          ...cfg.motifConfig,
          nWedges: Math.max(1, cfg.motifConfig.nWedges + delta),
        },
      }));
      return rebuildRadiiAndColors(arr);
    });
  };

  const incrementAllSpeeds = (delta) => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => {
        const newIndex = Math.max(
          0,
          Math.min(cfg.speedIndex + delta, speedOptions.length - 1)
        );
        return { ...cfg, speedIndex: newIndex };
      });
      return rebuildRadiiAndColors(arr);
    });
  };

  // Callbacks globaux pour ControlPanel
  const onPlayPause = () => setIsRunning((r) => !r);

  const onStop = () => {
    setLayersConfig((prev) => prev.map((cfg) => ({ ...cfg, speedIndex: 0 })));
  };

  const onSynchronize = () => {
    //prevProgressRef.current = 0; // ✅ Réinitialise la progression précédente
    setResetTrigger((t) => t + 1);
    setSeekTimestamp(Date.now());
    setElapsedSec(0);       // ✅ remet la jauge à zéro
    //setElapsedSec(Math.max(recurrenceTime - 5, 0));       // ✅ remet la jauge à zéro
    setRevolutions(-1);// ✅ corrige le faux +1 au prochain tick
    setFlash(true); setTimeout(() => setFlash(false), 300);

  };

  const onAddCouronne = () => handleAddLayer();
  const onRemoveCouronne = () => handleRemoveLayer();

  const onGlobalWedgesAdjust = (delta) => {
    if (delta === 0) {
      setLayersConfig((prev) =>
        prev.map((cfg) => ({
          ...cfg,
          motifConfig: { ...cfg.motifConfig, nWedges: 1 },
        }))
      );
    } else {
      incrementAllWedges(delta);

      onSynchronize(); // ✅ remise à zéro
    }
  };

  const onGlobalSpeedAdjust = (delta) => {
    if (delta === 0) {
      setLayersConfig((prev) => prev.map((cfg) => ({ ...cfg, speedIndex: 0 })));
    } else {
      incrementAllSpeeds(delta);
    }
    onSynchronize(); // ✅ remise à zéro
  };

  const onGloballyAccumulateWedgesDown = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({ ...cfg, motifConfig: { ...cfg.motifConfig } }));
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        arr[i + 1].motifConfig.nWedges += arr[i].motifConfig.nWedges;
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  const onGloballyAccumulateWedgesUp = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({ ...cfg, motifConfig: { ...cfg.motifConfig } }));
      const n = arr.length;
      for (let i = n - 1; i > 0; i--) {
        arr[i - 1].motifConfig.nWedges += arr[i].motifConfig.nWedges;
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  const onGloballyAccumulateSpeedDown = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({ ...cfg }));
      const n = arr.length;
      const allZero = arr.every((cfg) => cfg.speedIndex === 0);
      if (allZero) {
        return rebuildRadiiAndColors(
          arr.map((cfg, i) => ({ ...cfg, speedIndex: Math.min(n - 1 - i, speedOptions.length - 1) }))
        );
      }
      for (let i = 0; i < n - 1; i++) {
        arr[i + 1].speedIndex = Math.min(
          speedOptions.length - 1,
          arr[i + 1].speedIndex + arr[i].speedIndex
        );
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  const onGloballyAccumulateSpeedUp = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({ ...cfg }));
      const n = arr.length;
      const allZero = arr.every((cfg) => cfg.speedIndex === 0);
      if (allZero) {
        return rebuildRadiiAndColors(
          arr.map((cfg, i) => ({ ...cfg, speedIndex: Math.min(i, speedOptions.length - 1) }))
        );
      }
      for (let i = n - 1; i > 0; i--) {
        arr[i - 1].speedIndex = Math.min(
          speedOptions.length - 1,
          arr[i - 1].speedIndex + arr[i].speedIndex
        );
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  // --- Ajustement global du widthFactor ---
  const onGlobalWidthAdjust = (delta) => {
    setLayersConfig((prev) =>
      prev.map((cfg) => {
        let wf = cfg.motifConfig.widthFactor ?? 0.5;
        if (delta === 0) wf = 0.5; // reset
        else wf = Math.max(0.05, Math.min(1, wf + delta * 0.05));
        return {
          ...cfg,
          motifConfig: { ...cfg.motifConfig, widthFactor: wf },
        };
      })
    );
  };

  // --- Accumulation descendante (▽▽) : transfère la largeur vers l’extérieur
  const onGloballyAccumulateWidthDown = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({
        ...cfg,
        motifConfig: { ...cfg.motifConfig },
      }));
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        const current = arr[i].motifConfig.widthFactor ?? 0.5;
        const next = arr[i + 1].motifConfig.widthFactor ?? 0.5;
        const newVal = Math.min(1, Math.max(0.05, next + current * 0.5)); // accumulation pondérée
        arr[i + 1].motifConfig.widthFactor = newVal;
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  // --- Accumulation ascendante (△△) : transfère la largeur vers l’intérieur
  const onGloballyAccumulateWidthUp = () => {
    setLayersConfig((prev) => {
      const arr = prev.map((cfg) => ({
        ...cfg,
        motifConfig: { ...cfg.motifConfig },
      }));
      const n = arr.length;
      for (let i = n - 1; i > 0; i--) {
        const current = arr[i].motifConfig.widthFactor ?? 0.5;
        const prevVal = arr[i - 1].motifConfig.widthFactor ?? 0.5;
        const newVal = Math.min(1, Math.max(0.05, prevVal + current * 0.5)); // même logique
        arr[i - 1].motifConfig.widthFactor = newVal;
      }
      return rebuildRadiiAndColors(arr);
    });
  };

  const onInvertAllDirections = () => {
    setLayersConfig((prev) =>
      prev.map((cfg) => ({ ...cfg, direction: (cfg.direction || 1) * -1 }))
    );
  };

  const onChangeLayerWedges = (idx, delta) => {
    if (delta === 0) {
      handleChangeLayer(idx, { ...layersConfig[idx].motifConfig, nWedges: 1 });
    } else {
      const old = layersConfig[idx].motifConfig.nWedges;
      handleChangeLayer(idx, {
        ...layersConfig[idx].motifConfig,
        nWedges: Math.max(1, old + delta),
      });
    }
    onSynchronize(); // ✅ remise à zéro
  };

  const onChangeLayerSpeed = (idx, delta) => {
    if (delta === 0) {
      setLayersConfig((prev) =>
        prev.map((cfg, i) => (i === idx ? { ...cfg, speedIndex: 0 } : cfg))
      );
    } else {
      handleChangeSpeedIndex(idx, delta);
    }
    onSynchronize(); // ✅ remise à zéro
  };

  // --- Calculs pour jauge et période
  const speedIndices = layersConfig.map((cfg) => cfg.speedIndex);
  const recurrenceTime = computeRecurrenceTime(speedIndices, layersConfig, speedOptions, bpm); // en secondes (unités de temps du système)

  const [elapsedSec, setElapsedSec] = useState(0);

  const onSeek = (fraction) => {
    console.log("onSeek")
    // Nouveau temps simulé
    const newElapsed = fraction * recurrenceTime;
    setElapsedSec(newElapsed);

    // Facteur global BPM → tours par seconde
    const baseFactor = bpm / 60;

    // 1. Mettre à jour les couches
    const updatedLayers = layersConfig.map((layer) => {
      const speedEntry = speedOptions[layer.speedIndex];
      const speedBase = speedEntry?.value ?? speedEntry;
      const speedEffective = speedBase * baseFactor;

      let theta = (speedEffective * newElapsed * 2 * Math.PI * (layer.direction || 1) + Math.PI / 2) % (2 * Math.PI);

      return { ...layer, theta };
    });

    // 2. Reconstruire les rayons/couleurs pour cohérence visuelle
    const rebuilt = rebuildRadiiAndColors(updatedLayers);

    // 3. Mettre à jour la config complète (provoquera le rerender de WheelSystem)
    setLayersConfig(rebuilt);
    setSeekTimestamp(Date.now());
  };

  //const elapsedSec = (nowMs - lastSyncTime) / 1000;
  //const cycleProgress = recurrenceTime > 0 ? (elapsedSec % recurrenceTime) / recurrenceTime : 0;
  const cycleProgress =
    recurrenceTime > 0 ? (elapsedSec % recurrenceTime) / recurrenceTime : 0;
  // Facteur de ralentissement : 1 quand cycle commence, puis chute vers la fin
  // Exemple : ralentit très fortement après 90 % du cycle

  function computeSlowFactor(cycleProgress, recurrenceTime) {
    // clamp entre 0 et 1
    const p = Math.max(0, Math.min(1, cycleProgress));

    const interval = 1 / recurrenceTime
    // Phase 1 : 0–0.9 → vitesse = 1
    if (interval < p && p < 1 - interval) return 1;

    // Phase 2 : 0.9–1.0 → chute rapide vers ~0
    if (p >= 1 - interval) {
      const t = (p - 1 + interval) / interval; // de 0 à 1
      // courbe d'accélération inverse : chute douce puis forte
      return 0.05 + Math.pow(1 - t, 2) * 1.0; // → 1→0
    }

    // Phase 3 : début de cycle (0–0.1) → redémarrage 0→1
    const t = p / interval; // de 0 à 1 pour les 10% initiaux
    return 0.05 + Math.pow(t, 1 / 2); // montée douce de 0→1
  }

  //const slowFactor = computeSlowFactor(cycleProgress);
  const slowFactor = useEase ? computeSlowFactor(cycleProgress, recurrenceTime) : 1;

  // --- Détection de fin de révolution pour incrémenter le compteur
  const prevProgressRef = React.useRef(cycleProgress);

  // Animation frame (déjà utilisée pour la rotation des couronnes)
  useAnimationFrame((dt) => {
    if (isRunning) {
      setElapsedSec((prev) => prev + dt * slowFactor * bpm / 60);
    }
  });

  useEffect(() => {
    const prev = prevProgressRef.current;
    // Si la jauge repart de 1 → 0, c’est qu’une révolution vient de se terminer
    if (cycleProgress < prev) {
      setRevolutions((r) => r + 1);
      setFlash(true);
      // le flash dure ~180 ms
      setTimeout(() => setFlash(false), 300);
    }
    prevProgressRef.current = cycleProgress;
  }, [cycleProgress]);

  const withRadii = rebuildRadiiAndColors(layersConfig);

  return (
    <div style={{ display: "flex", gap: "1em" }}>
      <ControlPanel
        bpm={bpm}
        onBpmChange={setBpm}
        onPlayPause={onPlayPause}
        isRunning={isRunning}
        onSynchronize={onSynchronize}
        onStop={onStop}
        onAddCouronne={onAddCouronne}
        onRemoveCouronne={onRemoveCouronne}
        onGlobalWedgesAdjust={onGlobalWedgesAdjust}
        onGlobalSpeedAdjust={onGlobalSpeedAdjust}
        onGloballyAccumulateWedgesDown={onGloballyAccumulateWedgesDown}
        onGloballyAccumulateWedgesUp={onGloballyAccumulateWedgesUp}
        onGloballyAccumulateSpeedDown={onGloballyAccumulateSpeedDown}
        onGloballyAccumulateSpeedUp={onGloballyAccumulateSpeedUp}
        onInvertAllDirections={onInvertAllDirections}
        layersConfig={layersConfig}
        onChangeLayerWedges={onChangeLayerWedges}
        onChangeLayerSpeed={onChangeLayerSpeed}
        onToggleLayerDirection={handleToggleDirection}
        speedOptions={speedOptions}
        recurrenceTime={recurrenceTime}
        elapsed={elapsedSec}
        revolutions={revolutions}
        flash={flash}
        cycleProgress={cycleProgress}
        onTogglePhase={onTogglePhase}
        useEase={useEase}
        onToggleEase={() => setUseEase((e) => !e)}
        onSeek={onSeek}
        onRewind10s={onRewind10s} // ✅ nouveau
        onChangeLayerWidth={onChangeLayerWidth}
        onGlobalWidthAdjust={onGlobalWidthAdjust}
        onGloballyAccumulateWidthUp={onGloballyAccumulateWidthUp}
        onGloballyAccumulateWidthDown={onGloballyAccumulateWidthDown}
      />
      <div>
        <WheelSystem
          width={500}
          height={500}
          layersConfig={withRadii}
          speedOptions={speedOptions}
          resetTrigger={resetTrigger}
          bpm={bpm}
          isRunning={isRunning}
          flash={flash}
          slowFactor={slowFactor}
          seekTimestamp={seekTimestamp} // ✅ nouveau
          scale={scale}
        />
      </div>
    </div>
  );
}
