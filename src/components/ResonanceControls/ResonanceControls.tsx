import { Filter } from "../EQGraph/filter";
import "./ResonanceControls.css";

interface Props {
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
}

function toKHzLabel(hz: number) {
  const k = hz / 1000;
  return `${Math.round(k * 10) / 10}k`;
}

export default function ResonanceControls({ filters, onChange }: Props) {
  const min = 2000;
  const max = 4000;
  const step = 10;

  const handleBaseChange = (hz: number) => {
    const freqs = [hz, hz * 3, hz * 5].map(f => Math.round(f));
    const updated = filters.map((f, i) => {
        return {
            ...f,
            frequency: freqs[i]
        }
    });
    onChange(updated);
  }

  const handleQChange = (i: number, qVal: number) => {
    const q = isFinite(qVal) && qVal > 0 ? qVal : 5;
    const updated = filters.map((filter, idx) =>
      idx === i ? { ...filter, Q: q } : filter
    );
    onChange(updated);
  };

  const handleGainChange = (i: number, dbVal: number) => {
    const updated = filters.map((f, idx) =>
      idx === i ? { ...f, gain: dbVal } : f
    );
    onChange(updated);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 600 }}>In-Ear Resonances</div>

      <label style={{ display: "grid", gap: 8 }}>
        <div>Base frequency: {toKHzLabel(filters[0].frequency)}Hz</div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={filters[0].frequency}
          className="seek-bar"
          onChange={(e) => handleBaseChange(Number(e.target.value))}
        />
      </label>

      {
        filters.map((filter, i) => (
    <div key={i} style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600 }}>
            {i === 0 ? "1×" : i === 1 ? "3×" : "5×"}: {toKHzLabel(filter.frequency)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Q</span>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={filter.Q}
                className="number-input"
                onChange={(e) => handleQChange(i, Number(e.target.value))}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Gain (dB)</span>
              <input
                type="number"
                step={0.1}
                value={filter.gain}
                className="number-input"
                onChange={(e) => handleGainChange(i, Number(e.target.value))}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}