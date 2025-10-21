// src/components/ControlPanel.jsx
import React, {useRef} from "react";
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

  const tapTimesRef = useRef([]);

  const handleTap = () => {
    const now = performance.now();
    const times = tapTimesRef.current;

    // Si plus de 2s sans clic → reset
    if (times.length && now - times[times.length - 1] > 2000) {
      tapTimesRef.current = [now];
      return;
    }

    // Ajoute ce clic
    times.push(now);

    // Garde les 5 derniers
    if (times.length > 5) times.shift();

    if (times.length >= 2) {
      // Calcule les intervalles successifs
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }

      // Moyenne des intervalles
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Convertit en BPM
      const newBpm = Math.round(60000 / avg);
      onBpmChange(newBpm);
    }
  };





  return (
    <div className="control-panel">

      {/* --- Main controls --- */}
      <div className="top-controls">
        <button onClick={onPlayPause} title="Play or pause the animation">
          {isRunning ? "Pause" : "Play"}
        </button>
        <button onClick={onSynchronize} title="Reset all rings and restart the cycle">
          Sync
        </button>
        <button onClick={onRewind10s} title="Rewind 10 seconds in the current cycle">
          –10
        </button>
        <button onClick={onToggleEase} title="Toggle ease mode (slowdown before resync)">
          {useEase ? "Ease ON" : "Ease OFF"}
        </button>
        <label title="Base tempo in beats per minute">
          BPM
          <input
            type="number"
            min="1"
            value={bpm}
            onChange={(e) => onBpmChange(parseFloat(e.target.value) || 0)}
            style={{ width: "4em"}}
          />
        </label>
        <button
          onClick={handleTap}
          title="Tap repeatedly to set the tempo (Tap Tempo)"
          className="tap-button"
        >
          TAP
        </button>
      </div>

      {/* --- Time gauge --- */}
      <div className="elapsed-display" title="Elapsed time since the last synchronization">
        <div
          className="gauge-bar-container"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const fraction = Math.min(Math.max(x / rect.width, 0), 1);
            onSeek(fraction);
          }}
          title="Click to jump in time along the cycle"
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

      {/* --- Compact table with 5 columns --- */}
      <div className="layer-table">
        {/* Header row */}
        <div className="header-row">
          <div className="cell label">
            <button onClick={onAddCouronne} title="Add a new ring">＋</button>
            <button onClick={onRemoveCouronne} title="Remove the last ring">－</button>
          </div>
          <div className="cell label" title="Rotation period for each ring">Period</div>
          <div className="cell label" title="Number of arcs (divisions) per ring">Division</div>
          <div className="cell label" title="Relative arc width factor">Width</div>
          <div className="cell label" title="Rotation direction">Dir</div>
          <div className="cell label" title="Phase shift (Φ)">Φ</div>
        </div>

        {/* Global control row */}
        <div className="row global-row">
          <div className="cell label" title="Global controls">&nbsp;</div>

          {/* Period */}
          <div className="cell two-lines" title="Global period adjustment">
            <div className="line-top">
              <button onClick={() => onGlobalSpeedAdjust(-1)} title="Decrease period globally">－</button>
              <button onClick={() => onGlobalSpeedAdjust(0)} title="Reset period to base value">◉</button>
              <button onClick={() => onGlobalSpeedAdjust(+1)} title="Increase period globally">＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateSpeedUp} title="Propagate faster speeds outward (▽▽)">▽▽</button>
              <button onClick={onGloballyAccumulateSpeedDown} title="Propagate faster speeds inward (△△)">△△</button>
            </div>
          </div>

          {/* Division */}
          <div className="cell two-lines" title="Global division adjustment">
            <div className="line-top">
              <button onClick={() => onGlobalWedgesAdjust(-1)} title="Decrease divisions globally">－</button>
              <button onClick={() => onGlobalWedgesAdjust(0)} title="Reset all divisions to 1">◉</button>
              <button onClick={() => onGlobalWedgesAdjust(+1)} title="Increase divisions globally">＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateWedgesDown} title="Accumulate divisions downward (▽▽)">▽▽</button>
              <button onClick={onGloballyAccumulateWedgesUp} title="Accumulate divisions upward (△△)">△△</button>
            </div>
          </div>

          {/* Width */}
          <div className="cell two-lines" title="Global width adjustment">
            <div className="line-top">
              <button onClick={() => onGlobalWidthAdjust(-1)} title="Decrease width factor for all rings">－</button>
              <button onClick={() => onGlobalWidthAdjust(0)} title="Reset all widths to 0.5">◉</button>
              <button onClick={() => onGlobalWidthAdjust(+1)} title="Increase width factor for all rings">＋</button>
            </div>
            <div className="line-bottom">
              <button onClick={onGloballyAccumulateWidthDown} title="Accumulate width downward (▽▽)">▽▽</button>
              <button onClick={onGloballyAccumulateWidthUp} title="Accumulate width upward (△△)">△△</button>
            </div>
          </div>

          {/* Direction */}
          <div className="cell">
            <button onClick={onInvertAllDirections} title="Invert rotation direction for all rings">↺</button>
          </div>

          {/* Phase */}
          <div className="cell" title="Global phase control (Φ all)">
            <span>Φ all</span>
          </div>
        </div>

        {/* Per-ring controls */}
        {layersConfig.map((cfg, i) => {
          const speedEntry = speedOptions[cfg.speedIndex];
          const exponent = speedEntry ? speedEntry.exponent : cfg.speedIndex;

          return (
            <div className="row" key={i}>
              <div className="cell label" title={`Ring #${i + 1}`}>{i + 1}</div>

              {/* Period */}
              <div className="cell" title="Adjust period for this ring">
                <span className="layer-val">{exponent}</span>
                <button onClick={() => onChangeLayerSpeed(i, -1)} title="Decrease period">－</button>
                <button onClick={() => onChangeLayerSpeed(i, 0)} title="Reset period">◉</button>
                <button onClick={() => onChangeLayerSpeed(i, +1)} title="Increase period">＋</button>
              </div>

              {/* Division */}
              <div className="cell" title="Adjust number of arcs (divisions)">
                <span className="layer-val">{cfg.motifConfig.nWedges}</span>
                <button onClick={() => onChangeLayerWedges(i, -1)} title="Decrease divisions">－</button>
                <button onClick={() => onChangeLayerWedges(i, 0)} title="Reset divisions">◉</button>
                <button onClick={() => onChangeLayerWedges(i, +1)} title="Increase divisions">＋</button>
              </div>

              {/* Width */}
              <div className="cell" title="Adjust arc width for this ring">
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
                  title="Decrease width"
                >
                  －
                </button>
                <button onClick={() => onChangeLayerWidth(i, 0.5)} title="Reset width to 0.5">◉</button>
                <button
                  onClick={() =>
                    onChangeLayerWidth(
                      i,
                      Math.min(1, (cfg.motifConfig.widthFactor ?? 0.5) + 0.05)
                    )
                  }
                  title="Increase width"
                >
                  ＋
                </button>
              </div>

              {/* Direction */}
              <div className="cell" title="Toggle rotation direction (CW/CCW)">
                <input
                  type="checkbox"
                  checked={cfg.direction === -1}
                  onChange={() => onToggleLayerDirection(i)}
                />
              </div>

              {/* Phase */}
              <div className="cell" title="Toggle phase shift for this ring (Φ)">
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
