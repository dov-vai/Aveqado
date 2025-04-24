import {useEffect, useRef} from 'react';
import './EqGraph.css';
import {Filter} from "./filter.ts";
import {EqGraphRenderer} from "./eq-graph-renderer.ts";

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new EqGraphRenderer(canvas, {
            width, height, minFreq, maxFreq, bands, minDb, maxDb, filters
        });

        renderer.draw();

    }, [filters, width, height, minFreq, maxFreq, bands, minDb, maxDb]);

    return (
        <div className="eq-graph-container">
            <canvas ref={canvasRef}/>
        </div>
    );
}

export default EqGraph;