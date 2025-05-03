import './App.css'
import EqSelection from "./components/EqSelection/EqSelection.tsx";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer.tsx";
import {useEffect, useMemo, useRef, useState} from "react";
import {Filter} from "./components/EQGraph/filter.ts";
import AudioFileSelector from "./components/AudioPlayer/AudioFileSelector.tsx";
import {FilterGenerator} from "./utils/filter-generator.ts";
import {ArrowBigRight, X} from "lucide-react";
import DifficultySelection from "./components/DifficultySelection/DifficultySelection.tsx";
import SampleAudioSelector from "./components/SampleAudioSelector/SampleAudioSelector.tsx";

function App() {
    const [width, setWidth] = useState(1280);
    const [height, setHeight] = useState(800);
    // we need i ranges but there's i+1 bands
    const [bands, setBands] = useState(3 + 1);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const minFreq = 20;
    const maxFreq = 20480;
    const minDb = 3;
    const maxDb = 8;

    const filterGenerator = useMemo(() => {
        return new FilterGenerator(minFreq, maxFreq, bands, minDb, maxDb);
    }, [bands]);

    const [audioFile, setAudioFile] = useState<File>();
    const [filter, setFilter] = useState<Filter>(filterGenerator.generate());
    const [showAnswer, setShowAnswer] = useState(false);
    const [answers, setAnswers] = useState<Filter[]>([]);

    const handleFileSelected = (file: File) => {
        setAudioFile(file);
    };

    const handleSubmit = () => {
        if (!answers.length) {
            return;
        }

        if (showAnswer) {
            const newFilter = filterGenerator.generate();
            setShowAnswer(false);
            setFilter(newFilter);
            return;
        }

        setShowAnswer(true);
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

    const handleSetBands = (newBands: number) => {
        if (newBands <= 2) {
            return;
        }

        setBands(newBands);

        const generator = new FilterGenerator(minFreq, maxFreq, newBands, minDb, maxDb);
        setFilter(generator.generate());
    };

    return (
        <>
            <div className="container">
                <div className="canvas-area">
                    <div className="canvas-inner" ref={canvasRef}>
                        <div className="logo-overlay">
                            <img src="/logo.svg" alt="Logo" />
                        </div>
                        <EqSelection width={width}
                                     height={height}
                                     minFreq={minFreq}
                                     maxFreq={maxFreq}
                                     bands={bands}
                                     appliedFilter={filter}
                                     singleMode={true}
                                     showAnswer={showAnswer}
                                     setAnswers={setAnswers}
                                     key={`selector-${filter.frequency}`}
                        />
                    </div>
                </div>
                <div className="sidebar">
                    <div className="card">
                        <div className="round-button"
                             onClick={() => handleSubmit()}>
                            {answers.length ? <ArrowBigRight/> : <X/>}
                        </div>
                    </div>
                    <div className="card">
                        <AudioPlayer audioFile={audioFile} filter={filter}/>
                    </div>
                    <div className="card">
                        <AudioFileSelector onFileSelected={handleFileSelected}/>
                        <SampleAudioSelector onFileSelected={handleFileSelected}/>
                    </div>
                    <div className="card">
                        <DifficultySelection bands={bands} handleSetBands={handleSetBands}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App;
