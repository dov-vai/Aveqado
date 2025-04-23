import './App.css'
import EqSelection from "./components/EqSelection/EqSelection.tsx";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer.tsx";
import {useEffect, useRef, useState} from "react";
import {Filter} from "./components/EQGraph/filter.ts";
import AudioFileSelector from "./components/AudioPlayer/AudioFileSelector.tsx";
import {FilterGenerator} from "./utils/filter-generator.ts";
import {ArrowBigRight, X} from "lucide-react";

function App() {
    const [width, setWidth] = useState(1280);
    const [height, setHeight] = useState(800);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const minFreq = 20;
    const maxFreq = 20480;
    const freqMultiplier = 2;
    const minDb = 3;
    const maxDb = 8;

    const filterGenerator = new FilterGenerator(minFreq, maxFreq, freqMultiplier, minDb, maxDb);

    const [audioFile, setAudioFile] = useState<File>();
    const [filters, setFilters] = useState<Filter[]>([]);
    const [filter, setFilter] = useState<Filter>(filterGenerator.generate());

    const handleFileSelected = (file: File) => {
        setAudioFile(file);
    };

    const handleSubmit = () => {
        if (filters.length < 1) {
            return;
        }

        if (filters[0].frequency === filter.frequency) {
            alert("yes");
        } else {
            alert("no");
        }

        const newFilter = filterGenerator.generate();
        setFilter(newFilter);
        setFilters([]);
    };

    useEffect(() => {
        const updateCanvasDimensions = () => {
            const width = canvasRef.current!.clientWidth;
            const height = canvasRef.current!.clientHeight;
            setWidth(width);
            setHeight(height);
        };

        updateCanvasDimensions();

        const resizeObserver = new ResizeObserver(updateCanvasDimensions);
        if (canvasRef.current) {
            resizeObserver.observe(canvasRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <>
            <div className="container">
                <div className="canvas-area">
                    <div className="canvas-inner" ref={canvasRef}>
                        <EqSelection width={width}
                                     height={height}
                                     minFreq={minFreq}
                                     maxFreq={maxFreq}
                                     appliedFilter={filter}
                                     filters={filters}
                                     setFilters={setFilters}/>
                    </div>
                </div>
                <div className="sidebar">
                    <div className="card">
                        <div className="round-button"
                             onClick={() => handleSubmit()}>
                            {filters.length < 1 ? <X/> : <ArrowBigRight/>}
                        </div>
                    </div>
                    <div className="card">
                        <AudioPlayer audioFile={audioFile} filter={filter}/>
                    </div>
                    <div className="card">
                        <AudioFileSelector onFileSelected={handleFileSelected}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App;
