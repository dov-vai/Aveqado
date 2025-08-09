import React, { useRef, useState } from 'react';
import { FileAudio } from 'lucide-react';
import './AudioFileSelector.css';

interface AudioFileSelectorProps {
  onFileSelected: (file: File) => void;
}

function AudioFileSelector({ onFileSelected }: AudioFileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('Select Audio File...');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onFileSelected(files[0]);
    }
  };

  return (
    <div className="file-selection">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <div
        className="round-button"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileAudio />
      </div>
      <div>{fileName}</div>
    </div>
  );
}

export default AudioFileSelector;
