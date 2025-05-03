import React, {useEffect, useMemo, useRef, useState} from "react";
import {Filter} from "../EQGraph/filter.ts";
import EqGraph from "../EQGraph/EqGraph.tsx";
import './EqSelection.css';
import {EqUtils} from "../../utils/eq-utils.ts";
import FrequencyRegion, {FreqRegionProps} from "./FrequencyRegion.tsx";
import {RegionState} from "./region-state.ts";

interface EqSelectionProps {
    width: number;
    height: number;
    minFreq: number;
    maxFreq: number;
    bands: number;
    appliedFilter: Filter;
    singleMode: boolean;
    showAnswer: boolean;
    setAnswers: React.Dispatch<React.SetStateAction<Filter[]>>;
}

// TODO: support for multiple applied filters
function EqSelection({
                         width,
                         height,
                         minFreq,
                         maxFreq,
                         bands,
                         appliedFilter,
                         singleMode,
                         showAnswer,
                         setAnswers
                     }: EqSelectionProps) {
    const [regions, setRegions] = useState<FreqRegionProps[]>([]);
    const prevRegionsRef = useRef<FreqRegionProps[]>([]);

    // initialize frequency regions
    const baseRegions = useMemo(() => {
        const freqToX = (freq: number): number => {
            return EqUtils.freqToX(freq, width, minFreq, maxFreq);
        }

        const frequencies = EqUtils.generateBands(minFreq, maxFreq, bands);

        return frequencies.slice(0, -1).flatMap((freq, index) => {
            const nextFreq = frequencies[index + 1];
            const x1 = freqToX(freq);
            const x2 = freqToX(nextFreq);
            const blockWidth = x2 - x1;
            const centerFreq = EqUtils.getCenterFreq(freq, nextFreq);

            const createRegion = (gain: number): FreqRegionProps => ({
                left: x1,
                width: blockWidth,
                filter: {...appliedFilter, frequency: centerFreq, gain},
                state: RegionState.DEFAULT,
                updateState: () => {
                }
            });

            return [createRegion(Math.abs(appliedFilter.gain)), createRegion(-Math.abs(appliedFilter.gain))];
        });
    }, [appliedFilter, bands, maxFreq, minFreq, width]);

    useEffect(() => {
        setRegions(prev =>
            baseRegions.map(newRegion => {
                // preserve state
                const prevRegion = prev.find(p =>
                    EqUtils.filterEquals(p.filter, newRegion.filter));
                return prevRegion ? {...newRegion, state: prevRegion.state} : newRegion;
            })
        );
    }, [baseRegions]);

    useEffect(() => {
        if (showAnswer) {
            setRegions(prevRegions => {
                prevRegionsRef.current = [...prevRegions];
                return prevRegions.map(region => {
                    if (EqUtils.filterEquals(region.filter, appliedFilter)) {
                        return {...region, state: RegionState.CORRECT};
                    }

                    if (region.state === RegionState.SELECTED &&
                        !EqUtils.filterEquals(region.filter, appliedFilter)) {
                        return {...region, state: RegionState.WRONG};
                    }
                    return region;
                });
            });
        }
        else {
            if (prevRegionsRef.current.length){
                setRegions([...prevRegionsRef.current]);
                prevRegionsRef.current = [];
            }
        }
    }, [appliedFilter, showAnswer]);

    useEffect(() => {
        // if showing answer there would be no selected regions, which would clear answers
        const answerRegions = prevRegionsRef.current.length ? prevRegionsRef.current : regions;
        const selectedFilters = answerRegions
            .filter(region => region.state === RegionState.SELECTED)
            .map(region => region.filter);
        setAnswers(selectedFilters);
    }, [regions, setAnswers]);

    const updateState = (targetRegion: FreqRegionProps, newState: RegionState) => {
        setRegions(prevRegions => {
                return prevRegions.map((region) => {
                    if (EqUtils.filterEquals(region.filter, targetRegion.filter)) {
                        return {...region, state: newState};
                    }
                    // clear other selections if single mode is enabled
                    if (singleMode &&
                        region.state === RegionState.SELECTED &&
                        newState === RegionState.SELECTED) {
                        return {...region, state: RegionState.DEFAULT};
                    }

                    return region;
                });
            }
        );
    };

    const filtersToRender = regions
        .filter(region => {
            switch (region.state) {
                case RegionState.HOVERED:
                case RegionState.SELECTED:
                case RegionState.CORRECT: {
                    return true;
                }
            }
            return false;
        })
        .map(region => region.filter);

    return (
        <div className="eq-selection-container" style={{width, height}}>
            <EqGraph filters={filtersToRender} bands={bands} width={width} height={height}/>

            <div className="frequency-selector-overlay">
                {regions.map((region, index) => {
                    // if showing answers make other regions unclickable
                    if (showAnswer &&
                        (region.state != RegionState.WRONG && region.state != RegionState.CORRECT)) {
                        return null;
                    }

                    return (
                        <div key={index}>
                            <FrequencyRegion
                                left={region.left}
                                width={region.width}
                                filter={region.filter}
                                state={region.state}
                                updateState={(state) => updateState(region, state)}/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default EqSelection;