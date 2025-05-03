import {useRef} from 'react';
import './EqGraph.css';
import {Filter} from "./filter.ts";
import {EqGraphRenderer} from "./eq-graph-renderer.ts";
import {EqUtils} from "../../utils/eq-utils.ts";

interface EQGraphProps {
    filters: Filter[];
    width?: number;
    height?: number;
    minFreq?: number;
    maxFreq?: number;
    bands?: number;
    minDb?: number;
    maxDb?: number;
}

function EqGraph({
                     filters,
                     width = 1280,
                     height = 800,
                     minFreq = 20,
                     maxFreq = 20480,
                     bands = 3,
                     minDb = -12,
                     maxDb = 12
                 }: EQGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    if (canvasRef.current) {
        const renderer = new EqGraphRenderer(canvasRef.current, {
            width, height, minFreq, maxFreq, bands, minDb, maxDb, filters
        });

        renderer.draw();
    }

    const freqs = EqUtils.generateBands(minFreq, maxFreq, bands);
    const freqLabels = freqs.map(freq => ({
        freq,
        x: EqUtils.freqToX(freq, width, minFreq, maxFreq)
    }));

    const dbLabels = [];
    for (let db = minDb; db <= maxDb; db += 3) {
        dbLabels.push({
            db,
            y: EqUtils.dbToY(db, height, minDb, maxDb)
        });
    }

    return (
        <div className="eq-graph-container">
            <div className="db-labels">
                {dbLabels.map(({db, y}) => (
                    <div key={db} className="db-label" style={{top: `${y}px`}}>
                        {db}
                    </div>
                ))}
            </div>

            <canvas ref={canvasRef}/>

            <div className="freq-labels">
                {freqLabels.map(({freq, x}) => (
                    <div key={freq} className="freq-label" style={{left: `${x}px`}}>
                        {freq >= 1000 ? `${Math.round(freq / 1000 * 100) / 100}k` : `${freq}`}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EqGraph;