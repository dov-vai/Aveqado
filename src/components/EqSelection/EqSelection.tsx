import React, {useState} from "react";
import {Filter} from "../EQGraph/filter.ts";
import EqGraph from "../EQGraph/EqGraph.tsx";
import './EqSelection.css';
import {EqUtils} from "../../utils/eq-utils.ts";

interface EqSelectionProps {
    width: number;
    height: number;
    minFreq: number;
    maxFreq: number;
    bands: number;
    appliedFilter: Filter;
    filters: Filter[];
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
    singleMode: boolean;
}

function EqSelection({
                         width,
                         height,
                         minFreq,
                         maxFreq,
                         bands,
                         appliedFilter,
                         filters,
                         setFilters,
                         singleMode
                     }: EqSelectionProps) {
    const [hoveredFilter, setHoveredFilter] = useState<Filter>();

    const frequencies = EqUtils.generateBands(minFreq, maxFreq, bands);

    const freqToX = (freq: number): number => {
        return EqUtils.freqToX(freq, width, minFreq, maxFreq);
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

    const handleRegionClick = (filter: Filter) => {
        if (isFilterSelected(filter)) {
            removeFilter(filter);
            return;
        }

        setHoveredFilter(undefined);

        if (singleMode) {
            setFilters([filter]);
        } else {
            setFilters([...filters, filter]);
        }
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>, filter: Filter) => {
        // FIXME: positive and negative filter on the same frequency doesn't make sense
        if (isFilterSelected(filter)) {
            return;
        }

        e.currentTarget.style.backgroundColor = 'rgba(167, 243, 208, 0.1)';
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
            <EqGraph filters={filtersToRender} bands={bands} width={width} height={height}/>

            <div className="frequency-selector-overlay">
                {frequencies.map((freq, index) => {
                    if (index === frequencies.length - 1) return null;

                    const nextFreq = frequencies[index + 1];
                    const x1 = freqToX(freq);
                    const x2 = freqToX(nextFreq);
                    const blockWidth = x2 - x1;
                    const centerFreq = EqUtils.getCenterFreq(freq, nextFreq);

                    const posFilter: Filter = {
                        ...appliedFilter,
                        frequency: centerFreq,
                        gain: Math.abs(appliedFilter.gain)
                    };
                    const negFilter: Filter = {
                        ...appliedFilter,
                        frequency: centerFreq,
                        gain: -Math.abs(appliedFilter.gain)
                    };

                    return (
                        <div key={freq}>
                            <div
                                className="frequency-region"
                                style={{
                                    left: `${x1}px`, width: `${blockWidth}px`,
                                    backgroundColor: isFilterSelected(posFilter) ? 'rgba(167, 243, 208, 0.1)' : 'rgba(0,0,0,0)'
                                }}
                                onClick={() => handleRegionClick(posFilter)}
                                onMouseOver={(e) => {
                                    handleMouseOver(e, posFilter);
                                }}
                                onMouseOut={(e) => handleMouseOut(e, posFilter)}
                            >
                            </div>
                            <div
                                className="frequency-region"
                                style={{
                                    left: `${x1}px`, width: `${blockWidth}px`, top: '50%',
                                    backgroundColor: isFilterSelected(negFilter) ? 'rgba(167, 243, 208, 0.1)' : 'rgba(0,0,0,0)'
                                }}
                                onClick={() => handleRegionClick(negFilter)}
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