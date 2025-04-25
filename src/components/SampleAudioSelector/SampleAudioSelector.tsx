import {Loader, Play} from "lucide-react";
import {useState} from "react";
import "./SampleAudioSelector.css";
import {TextUtils} from "../../utils/text-utils.ts";

const audioModules = import.meta.glob('/src/assets/music/*.mp3');

const fileNames = Object.keys(audioModules).map(path => {
    const fileName = path.split('/').pop() || '';
    return fileName;
});


interface SampleAudioSelectorProps {
    onFileSelected: (file: File) => void;
}

function SampleAudioSelector({onFileSelected}: SampleAudioSelectorProps) {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    const handleSelectAudio = async (audioFileName: string) => {
        const fullPath = Object.keys(audioModules).find(path => path.includes(audioFileName));

        setIsLoading(prev => ({...prev, [audioFileName]: true}));

        try {
            const module = await audioModules[fullPath!]();

            // @ts-ignore
            const response = await fetch(module.default);
            if (!response.ok) {
                throw new Error(`Failed to load audio: ${response.statusText}`);
            }

            const blob = await response.blob();
            const file = new File([blob], audioFileName, {type: blob.type});

            onFileSelected(file);
        } catch (error) {
            console.error('Error loading audio file:', error);
        } finally {
            setIsLoading(prev => ({...prev, [audioFileName]: false}));
        }
    };

    return (
        <div className="sample-selector">
            {fileNames.map((fileName) => (
                <div key={fileName} className="sample-file">
                    <div className="round-button" onClick={() => handleSelectAudio(fileName)}>
                        {isLoading[fileName] ? <Loader/> : <Play/>}
                    </div>
                    <div>{TextUtils.removeFileExtension(fileName)}</div>
                </div>
            ))}
        </div>
    )
}

export default SampleAudioSelector;