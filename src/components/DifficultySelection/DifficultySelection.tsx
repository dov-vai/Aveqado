import {Minus, Plus} from "lucide-react";
import "./DifficultySelection.css";

interface DiffSelectionProps {
    bands: number;
    handleSetBands: (newBands: number) => void;
}

function DifficultySelection({bands, handleSetBands}: DiffSelectionProps) {
    return (
        <div className="difficulty-selection">
            <div className="diff-input">
                <div className="round-button" onClick={() => handleSetBands(bands - 1)}><Minus/></div>
                <div>{bands - 1} ranges</div>
                <div className="round-button" onClick={() => handleSetBands(bands + 1)}><Plus/></div>
            </div>
        </div>
    )
}

export default DifficultySelection;