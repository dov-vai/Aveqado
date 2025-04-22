import './App.css'
import EqSelection from "./components/EqSelection/EqSelection.tsx";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer.tsx";
import {useState} from "react";
import {Filter} from "./components/EQGraph/filter.ts";
import AudioFileSelector from "./components/AudioPlayer/AudioFileSelector.tsx";
import {FilterGenerator} from "./utils/filter-generator.ts";

function App() {
    const width = 1280;
    const height = 800;
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
        if (filters[0].frequency === filter.frequency) {
            alert("yes");
        } else {
            alert("no");
        }

        const newFilter = filterGenerator.generate();
        setFilter(newFilter);
        setFilters([]);
    };

    return (
        <>
            <EqSelection width={width}
                         height={height}
                         minFreq={minFreq}
                         maxFreq={maxFreq}
                         appliedFilter={filter}
                         filters={filters}
                         setFilters={setFilters}/>
            <AudioPlayer audioFile={audioFile} filter={filter}/>
            <AudioFileSelector onFileSelected={handleFileSelected}/>
            <button onClick={() => handleSubmit()} disabled={filters.length < 1}>Submit</button>
        </>
    )
}

export default App;
