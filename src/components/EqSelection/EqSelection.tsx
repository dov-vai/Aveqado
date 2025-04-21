import React, {useState} from "react";
import {Filter} from "../EQGraph/filter.ts";
import EqGraph from "../EQGraph/EqGraph.tsx";
import './EqSelection.css';

function EqSelection() {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [hoveredFilter, setHoveredFilter] = useState<Filter>();

    const width = 1280;
    const height = 800;
    const minFreq = 20;
    const maxFreq = 20480;

    const frequencies: number[] = [];
    for (let freq = minFreq; freq <= maxFreq; freq *= 2) {
        frequencies.push(freq);
    }

    const freqToX = (freq: number): number => {
        return width * (Math.log10(freq) - Math.log10(minFreq)) /
            (Math.log10(maxFreq) - Math.log10(minFreq));
    };

    const getRegionCenterFreq = (freqLow: number, freqHigh: number): number => {
        return Math.sqrt(freqLow * freqHigh);
    };

    const isFilterSelected = (filter: Filter): boolean => {
        return filters.some(f =>
            f.type === filter.type &&
            f.frequency === filter.frequency &&
            f.Q === filter.Q &&
            f.gain === filter.gain
        );
    };

    const removeFilter = (filter: Filter) => {
        setFilters(filters.filter(f =>
            !(f.type === filter.type &&
                f.frequency === filter.frequency &&
                f.Q === filter.Q &&
                f.gain === filter.gain)
        ));
    }

    const handleRegionClick = (e: React.MouseEvent<HTMLDivElement>, filter: Filter) => {
        if (isFilterSelected(filter)) {
            removeFilter(filter);
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)';
            return;
        }

        e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
        setFilters([...filters, filter]);
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>, filter: Filter) => {
        // FIXME: when clicked, hovering also applies the filter and it becomes a double peak
        // FIXME: positive and negative filter on the same frequency doesn't make sense
        if (isFilterSelected(filter)) {
            return;
        }

        e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
        setHoveredFilter(filter);
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>, filter: Filter) => {
        if (isFilterSelected(filter)) {
            return;
        }

        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        setHoveredFilter(undefined);
    };

    const filtersToRender = hoveredFilter
        ? [...filters, hoveredFilter]
        : filters;

    return (
        <div className="eq-selection-container" style={{width, height}}>
            <EqGraph filters={filtersToRender} width={width} height={height}/>

            <div className="frequency-selector-overlay">
                {frequencies.map((freq, index) => {
                    if (index === frequencies.length - 1) return null;

                    const nextFreq = frequencies[index + 1];
                    const x1 = freqToX(freq);
                    const x2 = freqToX(nextFreq);
                    const blockWidth = x2 - x1;
                    const centerFreq = getRegionCenterFreq(freq, nextFreq);

                    const posFilter: Filter = {
                        type: 'peaking',
                        frequency: centerFreq,
                        Q: 4,
                        gain: 2
                    };

                    const negFilter: Filter = {
                        type: 'peaking',
                        frequency: centerFreq,
                        Q: 4,
                        gain: -2
                    };

                    return (
                        <div key={freq}>
                            <div
                                className="frequency-region"
                                style={{left: `${x1}px`, width: `${blockWidth}px`,}}
                                onClick={(e) => handleRegionClick(e, posFilter)}
                                onMouseOver={(e) => {
                                    handleMouseOver(e, posFilter);
                                }}
                                onMouseOut={(e) => handleMouseOut(e, posFilter)}
                            >
                            </div>
                            <div
                                className="frequency-region"
                                style={{left: `${x1}px`, width: `${blockWidth}px`, top: '50%'}}
                                onClick={(e) => handleRegionClick(e, negFilter)}
                                onMouseOver={(e) => {
                                    handleMouseOver(e, negFilter);
                                }}
                                onMouseOut={(e) => handleMouseOut(e, negFilter)}
                            >
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default EqSelection;