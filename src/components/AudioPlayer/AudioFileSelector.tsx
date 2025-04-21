import React from 'react';

interface AudioFileSelectorProps {
    onFileSelected: (file: File) => void;
}

function AudioFileSelector({onFileSelected}: AudioFileSelectorProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelected(files[0]);
        }
    };

    return (
        <div className="file-selection">
            <input type="file" accept="audio/*" onChange={handleFileChange}/>
        </div>
    );
}

export default AudioFileSelector;