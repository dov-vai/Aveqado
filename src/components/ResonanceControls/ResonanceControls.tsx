import { useState } from 'react';
import { FileUtils } from '../../utils/file-utils';
import { FilterExport } from '../../utils/filter-export';
import { Filter } from '../EQGraph/filter';
import './ResonanceControls.css';
import { FileDown, RotateCcw } from 'lucide-react';
import { defaultFilters } from './constants';

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
  const [qInputs, setQInputs] = useState<string[]>(
    filters.map((f) => f.Q.toString())
  );
  const [gainInputs, setGainInputs] = useState<string[]>(
    filters.map((f) => f.gain.toString())
  );

  const handleBaseChange = (hz: number) => {
    const freqs = [hz, hz * 3, hz * 5].map((f) => Math.round(f));
    const updated = filters.map((f, i) => {
      return {
        ...f,
        frequency: freqs[i],
      };
    });
    onChange(updated);
  };

  const handleQChange = (i: number, qValue: string) => {
    setQInputs(qInputs.map((qInput, idx) => (idx === i ? qValue : qInput)));

    const q = Number(qValue);
    if (!isFinite(q) || q <= 0) return;

    const updated = filters.map((filter, idx) =>
      idx === i ? { ...filter, Q: q } : filter
    );
    onChange(updated);
  };

  const handleGainChange = (i: number, dbValue: string) => {
    setGainInputs(
      gainInputs.map((gainInput, idx) => (idx === i ? dbValue : gainInput))
    );

    const db = Number(dbValue);
    if (!isFinite(db)) return;

    const updated = filters.map((f, idx) =>
      idx === i ? { ...f, gain: db } : f
    );
    onChange(updated);
  };

  const onExport = () => {
    FileUtils.downloadTextFile(
      FilterExport.exportFiltersAPO(filters),
      'filters.txt'
    );
  };

  const onReset = () => {
    onChange(defaultFilters);
    setQInputs(defaultFilters.map((f) => f.Q.toString()));
    setGainInputs(defaultFilters.map((f) => f.gain.toString()));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="resonance-controls">
        <div style={{ fontWeight: 600 }}>In-Ear Resonances</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="round-button" onClick={onExport}>
            <FileDown />
          </div>
          <div className="round-button" onClick={onReset}>
            <RotateCcw />
          </div>
        </div>
      </div>

      <label style={{ display: 'grid', gap: 8 }}>
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

      {filters.map((filter, i) => (
        <div key={i} style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontWeight: 600 }}>
            {i === 0 ? '1×' : i === 1 ? '3×' : '5×'}:{' '}
            {toKHzLabel(filter.frequency)}
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            <label style={{ display: 'grid', gap: 4 }}>
              <span>Q</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={qInputs[i]}
                className="number-input"
                onChange={(e) => handleQChange(i, e.target.value)}
              />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>Gain (dB)</span>
              <input
                type="number"
                step={0.1}
                value={gainInputs[i]}
                className="number-input"
                onChange={(e) => handleGainChange(i, e.target.value)}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
