import { useEffect, useRef, useState } from 'react';
import { Filter } from '../EQGraph/filter.ts';
import EqGraph from '../EQGraph/EqGraph.tsx';
import AudioPlayer from '../AudioPlayer/AudioPlayer.tsx';
import AudioFileSelector from '../AudioPlayer/AudioFileSelector.tsx';
import SampleAudioSelector from '../SampleAudioSelector/SampleAudioSelector.tsx';
import { ArrowBigLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResonanceControls from '../ResonanceControls/ResonanceControls.tsx';
import { defaultFilters } from '../ResonanceControls/constants.ts';

function Resonance() {
  const minFreq = 20;
  const maxFreq = 20480;
  const bands = 10;

  const navigate = useNavigate();
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(800);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [audioFile, setAudioFile] = useState<File>();
  const [filters, setFilters] = useState<Filter[]>(defaultFilters);

  const handleFileSelected = (file: File) => {
    setAudioFile(file);
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
            <div className="logo-overlay">
              <img src="/logo.svg" alt="Logo" />
            </div>
            <EqGraph
              filters={filters}
              width={width}
              height={height}
              minFreq={minFreq}
              maxFreq={maxFreq}
              bands={bands}
              minDb={-12}
              maxDb={12}
            />
          </div>
        </div>
        <div className="sidebar">
          <div className="card">
            <div className="round-button" onClick={() => navigate('/')}>
              <ArrowBigLeft />
            </div>
          </div>
          <div className="card">
            <AudioPlayer audioFile={audioFile} filters={filters} />
          </div>
          <div className="card">
            <AudioFileSelector onFileSelected={handleFileSelected} />
            <SampleAudioSelector onFileSelected={handleFileSelected} />
          </div>
          <div className="card">
            <ResonanceControls filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Resonance;
