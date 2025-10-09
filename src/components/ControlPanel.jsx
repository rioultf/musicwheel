// src/components/ControlPanel.jsx
import React from "react";
import "./ControlPanel.css";

export default function ControlPanel({
  bpm,
  onBpmChange,
  onPlayPause,
  isRunning,
  onSynchronize,
  onAddCouronne,
  onRemoveCouronne,
  onInvertAllDirections,
  onToggleEase,
  useEase,
  onSeek,
  onRewind10s,

  // Layer controls
  layersConfig,
  speedOptions,
  onChangeLayerSpeed,
  onChangeLayerWedges,
  onChangeLayerWidth,
  onToggleLayerDirection,
  onTogglePhase,

  // Global controls
  onGlobalSpeedAdjust,
  onGlobalWedgesAdjust,
  onGlobalWidthAdjust,
  onGloballyAccumulateSpeedDown,
  onGloballyAccumulateSpeedUp,
  onGloballyAccumulateWedgesDown,
  onGloballyAccumulateWedgesUp,
  onGloballyAccumulateWidthDown,
  onGloballyAccumulateWidthUp,

  recurrenceTime,
  cycleProgress,
  flash,
}) {
  return (
    <div className="control-panel">

      {/* --- Boutons principaux --- */}
      <div className="top-controls">
        <button onClick={onPlayPause}>{isRunning ? "Pause" : "Play"}</button>
        <button onClick={onSynchronize} title="Synchroniser toutes les bagues">Sync</button>
        <button onClick={onRewind10s} title="Reculer de 10 secondes">–10</button>
        <button onClick={onToggleEase}>{useEase ? "Ease ON" : "Ease OFF"}</button>
        <label style={{ marginLeft: "0.5em" }}>
          BPM
          <input
            type="number"
            min="1"
            value={bpm}
            onChange={(e) => onBpmChange(parseFloat(e.target.value) || 0)}
            style={{ width: "4em", marginLeft: "0.4em" }}
          />
        </label>
      </div>

      {/* --- Jauge temporelle --- */}
      <div className="elapsed-display" title="Temps écoulé depuis le dernier Sync">
        <div
          className="gauge-bar-container"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const fraction = Math.min(Math.max(x / rect.width, 0), 1);
            onSeek(fraction);
          }}
        >
          <div
            className={`gauge-bar-fill${flash ? " flash" : ""}`}
            style={{ width: `${(cycleProgress * 100).toFixed(2)}%` }}
          />
        </div>
        <span>
          {(cycleProgress * recurrenceTime).toFixed(0)}/
          {recurrenceTime >= 1 ? recurrenceTime : `1 / ${1 / recurrenceTime}`}
        </span>
      </div>

      <hr className="section-separator" />

      {/* --- Tableau compact sur 5 colonnes --- */}
      <div className="layer-table">
        {/* Ligne d’en-tête */}
        <div className="header-row">
          <div className="cell label">
            <button onClick={onAddCouronne} title="Ajouter une bague">＋</button>
            <button onClick={onRemoveCouronne} title="Supprimer la dernière">－</button>
          </div>
          <div className="cell label">Period</div>
          <div className="cell label">Division</div>
          <div className="cell label">Width</div>
          <div className="cell label">Dir</div>
          <div className="cell label">Φ</div>
        </div>

        {/* Ligne globale */}
        <div className="row global-row">
          <div className="cell label">&nbsp;</div>

          {/* Period */}
          <div className="cell two-lines">
            <div className="line-top">
              <button onClick={() => onGlobalSpeedAdjust(-1)}>－</button>
              <button onClick={() => onGlobalSpeedAdjust(0)}>◉</button>
              <button onClick={() => onGlobalSpeedAdjust(+1)}>＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateSpeedUp}>▽▽</button>
              <button onClick={onGloballyAccumulateSpeedDown}>△△</button>
            </div>
          </div>

          {/* Division */}
          <div className="cell two-lines">
            <div className="line-top">
              <button onClick={() => onGlobalWedgesAdjust(-1)}>－</button>
              <button onClick={() => onGlobalWedgesAdjust(0)}>◉</button>
              <button onClick={() => onGlobalWedgesAdjust(+1)}>＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateWedgesDown}>▽▽</button>
              <button onClick={onGloballyAccumulateWedgesUp}>△△</button>
            </div>
          </div>

          {/* Width */}
          <div className="cell two-lines">
            <div className="line-top">
              <button onClick={() => onGlobalWidthAdjust(-1)}>－</button>
              <button onClick={() => onGlobalWidthAdjust(0)}>◉</button>
              <button onClick={() => onGlobalWidthAdjust(+1)}>＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateWidthDown}>▽▽</button>
              <button onClick={onGloballyAccumulateWidthUp}>△△</button>
            </div>
          </div>

          {/* Dir */}
          <div className="cell">
            <button onClick={onInvertAllDirections}>↺</button>
          </div>

          {/* Phase */}
          <div className="cell"></div>
        </div>

        {/* Lignes par bague */}
        {layersConfig.map((cfg, i) => {
          const speedEntry = speedOptions[cfg.speedIndex];
          const exponent = speedEntry ? speedEntry.exponent : cfg.speedIndex;

          return (
            <div className="row" key={i}>
              <div className="cell label">{i + 1}</div>

              {/* Period */}
              <div className="cell">
                <span className="layer-val">{exponent}</span>
                <button onClick={() => onChangeLayerSpeed(i, -1)}>－</button>
                <button onClick={() => onChangeLayerSpeed(i, 0)}>◉</button>
                <button onClick={() => onChangeLayerSpeed(i, +1)}>＋</button>
              </div>

              {/* Division */}
              <div className="cell">
                <span className="layer-val">{cfg.motifConfig.nWedges}</span>
                <button onClick={() => onChangeLayerWedges(i, -1)}>－</button>
                <button onClick={() => onChangeLayerWedges(i, 0)}>◉</button>
                <button onClick={() => onChangeLayerWedges(i, +1)}>＋</button>
              </div>

              {/* Width */}
              <div className="cell">
                <span className="layer-val">
                  {(cfg.motifConfig.widthFactor ?? 0.5).toFixed(1)}
                </span>
                <button
                  onClick={() =>
                    onChangeLayerWidth(
                      i,
                      Math.max(0.05, (cfg.motifConfig.widthFactor ?? 0.5) - 0.05)
                    )
                  }
                >
                  －
                </button>
                <button onClick={() => onChangeLayerWidth(i, 0.5)}>◉</button>
                <button
                  onClick={() =>
                    onChangeLayerWidth(
                      i,
                      Math.min(1, (cfg.motifConfig.widthFactor ?? 0.5) + 0.05)
                    )
                  }
                >
                  ＋
                </button>
              </div>

              {/* Direction */}
              <div className="cell">
                <input
                  type="checkbox"
                  checked={cfg.direction === -1}
                  onChange={() => onToggleLayerDirection(i)}
                />
              </div>

              {/* Phase */}
              <div className="cell">
                <input
                  type="checkbox"
                  checked={cfg.phaseShifted}
                  onChange={() => onTogglePhase(i)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
