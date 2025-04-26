import {useEffect, useMemo, useState} from "react";
import {Filter} from "../EQGraph/filter.ts";
import EqGraph from "../EQGraph/EqGraph.tsx";
import './EqSelection.css';
import {EqUtils} from "../../utils/eq-utils.ts";
import FrequencyRegion, {FreqRegionProps, RegionState} from "./FrequencyRegion.tsx";

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

    const freqToX = (freq: number): number => {
        return EqUtils.freqToX(freq, width, minFreq, maxFreq);
    };

    const frequencyRegions = useMemo(() => {
        const frequencies = EqUtils.generateBands(minFreq, maxFreq, bands);

        return frequencies.slice(0, -1).flatMap((freq, index) => {
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
                ...posFilter,
                gain: -posFilter.gain
            };

            const regionProps: FreqRegionProps = {
                left: x1,
                width: blockWidth,
                filter: posFilter,
                state: RegionState.DEFAULT,
                updateState: () => {
                }
            };

            return [regionProps, {...regionProps, filter: negFilter}];

        });
    }, [width, minFreq, maxFreq, bands, appliedFilter]);

    const [regions, setRegions] = useState<FreqRegionProps[]>(frequencyRegions);

    useEffect(() => {
        setRegions(frequencyRegions);
    }, [frequencyRegions]);

    useEffect(() => {
        if (showAnswer) {
            const correctRegion = regions.find((region) => {
                return EqUtils.filterEquals(region.filter, appliedFilter);
            });

            if (correctRegion) {
                updateState(correctRegion, RegionState.CORRECT);
            }

            const selectedRegion = regions.find((region) => {
                return region.state === RegionState.SELECTED;
            });

            if (selectedRegion && correctRegion != selectedRegion) {
                updateState(selectedRegion, RegionState.WRONG);
            }
        }
    }, [showAnswer]);

    // FIXME: answers should be set only when selection is changed, also incorrect useEffects
    useEffect(() => {
        const answers = regions
            .filter(region => region.state === RegionState.SELECTED)
            .map(region => region.filter);
        setAnswers(answers);
    }, [regions, setAnswers]);

    const updateState = (targetRegion: FreqRegionProps, newState: RegionState) => {
        setRegions(prevRegions => {
                return prevRegions.map((region) => {
                    // FIXME: search can be made faster by having a unique key for each region
                    if (EqUtils.filterEquals(region.filter, targetRegion.filter)) {
                        return {...region, state: newState};
                    }

                    // clear other selections if single mode is enabled
                    if (singleMode &&
                        newState === RegionState.SELECTED &&
                        region.state === RegionState.SELECTED
                    ) {
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