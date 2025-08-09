import { useEffect, useRef, useState } from 'react';
import { Filter } from '../EQGraph/filter.ts';
import './AudioPlayer.css';
import { Pause, PenOff, Play, WandSparkles } from 'lucide-react';
import { TextUtils } from '../../utils/text-utils.ts';

interface AudioPlayerProps {
  audioFile?: File;
  filters?: Filter[];
}

function AudioPlayer({ audioFile, filters }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);

  const disconnectNodes = () => {
    try {
      sourceNodeRef.current?.disconnect();
    } catch (error) {
      console.error(error);
    }
    try {
      filterNodesRef.current.forEach((n) => n.disconnect());
    } catch (error) {
      console.error(error);
    }
  };

  const connectNodes = () => {
    const ctx = audioContextRef.current;
    const src = sourceNodeRef.current;
    const nodes = filterNodesRef.current;

    if (!ctx || !src) return;

    try {
      src.disconnect();
    } catch (error) {
      console.error(error);
    }
    try {
      src.connect(nodes[0]);
      for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].connect(nodes[i + 1]);
      }
      nodes[nodes.length - 1].connect(ctx.destination);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (audioFile && audioElementRef.current) {
      const objectUrl = URL.createObjectURL(audioFile);
      audioElementRef.current.src = objectUrl;

      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaElementSource(
        audioElementRef.current
      );

      sourceNode.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;

      return () => {
        URL.revokeObjectURL(objectUrl);
        disconnectNodes();
        filterNodesRef.current = [];
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
        setIsPlaying(false);
        setIsFiltering(false);
      };
    }
  }, [audioFile]);

  useEffect(() => {
    const ctx = audioContextRef.current;
    const src = sourceNodeRef.current;

    if (!ctx || !src) {
      return;
    }

    disconnectNodes();
    src.connect(ctx.destination);

    filterNodesRef.current = (filters ?? []).map((f) => {
      const node = ctx.createBiquadFilter();
      node.type = f.type;
      node.frequency.value = f.frequency;
      node.gain.value = f.gain;
      node.Q.value = f.Q;
      return node;
    });

    if (!isFiltering) return;

    if (!filterNodesRef.current.length) {
      disconnectNodes();
      setIsFiltering(false);
      return;
    }
    connectNodes();
  }, [filters, isFiltering, audioFile]);

  const togglePlayPause = () => {
    if (!audioFile || !audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      audioElementRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const toggleFilter = () => {
    if (!audioFile) return;

    const ctx = audioContextRef.current;
    const src = sourceNodeRef.current;
    const nodes = filterNodesRef.current;

    if (!ctx || !src) return;

    if (isFiltering) {
      disconnectNodes();
      try {
        src.connect(ctx.destination);
      } catch (error) {
        console.error(error);
      }
      setIsFiltering(false);
      return;
    }

    if (!nodes.length) return;

    connectNodes();
    setIsFiltering(!isFiltering);
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current && !isSeeking) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      setDuration(audioElementRef.current.duration);
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleSeekComplete = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = currentTime;
    }
    setIsSeeking(false);
  };

  // format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioElementRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div>{TextUtils.removeFileExtension(audioFile?.name)}</div>

      <div className="seek-bar-container">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeekChange}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onMouseUp={handleSeekComplete}
          onTouchEnd={handleSeekComplete}
          disabled={!audioFile}
          className="seek-bar"
          step="0.1"
        />
      </div>

      <div className="time-container">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      <div className="audio-controls">
        <div className="round-button" onClick={togglePlayPause}>
          {isPlaying ? <Pause /> : <Play />}
        </div>
        <div className="round-button" onClick={toggleFilter}>
          {isFiltering ? <PenOff /> : <WandSparkles />}
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
