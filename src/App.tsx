import './App.css'
import EqSelection from "./components/EqSelection/EqSelection.tsx";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer.tsx";
import {useState} from "react";
import {Filter} from "./components/EQGraph/filter.ts";
import AudioFileSelector from "./components/AudioPlayer/AudioFileSelector.tsx";

function App() {
    const [audioFile, setAudioFile] = useState<File>();
    const [filter, setFilter] = useState<Filter>({
        type: "peaking",
        frequency: 1000,
        gain: 10,
        Q: 1
    });

    const handleFileSelected = (file: File) => {
        setAudioFile(file);
    };

    return (
        <>
            <EqSelection/>
            <AudioPlayer audioFile={audioFile} filter={filter} />
            <AudioFileSelector onFileSelected={handleFileSelected}/>
        </>
    )
}

export default App
