import {Filter} from "../EQGraph/filter.ts";
import "./EqSelection.css";
import { RegionState } from "./region-state.ts";

const stateToColorMap: Record<RegionState, string> = {
    [RegionState.DEFAULT]: "rgba(0, 0, 0, 0)",
    [RegionState.HOVERED]: "rgba(167, 243, 208, 0.1)",
    [RegionState.SELECTED]: "rgba(167, 243, 208, 0.1)",
    [RegionState.CORRECT]: "rgba(36, 69, 50, 0.3)",
    [RegionState.WRONG]: "rgba(246, 94, 76, 0.2)"
};

export interface FreqRegionProps {
    left: number;
    width: number;
    filter: Filter;
    state: RegionState;
    updateState: (newState: RegionState) => void;
}

function FrequencyRegion({left, width, filter, state, updateState}: FreqRegionProps) {
    const handleRegionClick = () => {
        switch (state) {
            case RegionState.DEFAULT:
            case RegionState.HOVERED: {
                updateState(RegionState.SELECTED);
                break;
            }
            case RegionState.SELECTED: {
                updateState(RegionState.DEFAULT);
                break;
            }
        }
    };

    const handleMouseOver = () => {
        switch (state) {
            case RegionState.DEFAULT: {
                updateState(RegionState.HOVERED);
                break;
            }
        }
    };

    const handleMouseOut = () => {
        switch (state) {
            case RegionState.HOVERED: {
                updateState(RegionState.DEFAULT);
                break;
            }
        }
    };

    const getBackgroundColor = () => {
        return stateToColorMap[state];
    }

    const getCursorState = () => {
        switch (state) {
            case RegionState.WRONG:
            case RegionState.CORRECT: {
                return "default";
            }
            default: {
                return "pointer";
            }
        }
    }

    return (
        <div
            className="frequency-region"
            style={{
                left: `${left}px`,
                width: `${width}px`,
                top: `${filter.gain < 0 ? "50%" : "0"}`,
                backgroundColor: getBackgroundColor(),
                cursor: getCursorState()
            }}
            onClick={handleRegionClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
        </div>
    );
}

export default FrequencyRegion;