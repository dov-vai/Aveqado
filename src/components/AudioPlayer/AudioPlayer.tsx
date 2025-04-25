import {useEffect, useRef, useState} from 'react';
import {Filter} from "../EQGraph/filter.ts";
import './AudioPlayer.css';
import {Pause, PenOff, Play, WandSparkles} from "lucide-react";
import {TextUtils} from "../../utils/text-utils.ts";

interface AudioPlayerProps {
    audioFile?: File;
    filter?: Filter;
}

// TODO: multiple filters
function AudioPlayer({audioFile, filter}: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);

    useEffect(() => {
        if (audioFile && audioElementRef.current) {
            const objectUrl = URL.createObjectURL(audioFile);
            audioElementRef.current.src = objectUrl;

            const audioContext = new AudioContext();
            const sourceNode = audioContext.createMediaElementSource(audioElementRef.current);
            const filterNode = audioContext.createBiquadFilter();

            if (filter) {
                filterNode.type = filter.type;
                filterNode.frequency.value = filter.frequency;
                filterNode.gain.value = filter.gain;
                filterNode.Q.value = filter.Q;
            }

            sourceNode.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            sourceNodeRef.current = sourceNode;
            filterNodeRef.current = filterNode;

            return () => {
                URL.revokeObjectURL(objectUrl);
                if (audioContextRef.current?.state !== 'closed') {
                    audioContextRef.current?.close();
                }
                setIsPlaying(false);
            };
        }
    }, [audioFile]);

    useEffect(() => {
        if (!filterNodeRef.current || !filter) {
            return;
        }

        filterNodeRef.current.type = filter.type;
        filterNodeRef.current.frequency.value = filter.frequency;
        filterNodeRef.current.gain.value = filter.gain;
        filterNodeRef.current.Q.value = filter.Q;
    }, [filter]);

    const togglePlayPause = () => {
        if (!audioFile) {
            return;
        }

        if (!audioElementRef.current) {
            return;
        }

        if (isPlaying) {
            audioElementRef.current.pause();
        } else {
            audioElementRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    const toggleFilter = () => {
        if (!filter || !audioFile) {
            return;
        }

        if (!filterNodeRef.current ||
            !sourceNodeRef.current ||
            !filterNodeRef.current ||
            !audioContextRef.current ||
            !filter) {
            return;
        }

        if (isFiltering) {
            sourceNodeRef.current.disconnect(filterNodeRef.current);
            filterNodeRef.current.disconnect(audioContextRef.current.destination);
            sourceNodeRef.current.connect(audioContextRef.current.destination);
        } else {
            sourceNodeRef.current.disconnect(audioContextRef.current.destination);
            sourceNodeRef.current.connect(filterNodeRef.current);
            filterNodeRef.current.connect(audioContextRef.current.destination);
        }

        setIsFiltering(!isFiltering);
    }

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
    }

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
            <audio ref={audioElementRef}
                   onTimeUpdate={handleTimeUpdate}
                   onLoadedMetadata={handleLoadedMetadata}
                   onEnded={() => setIsPlaying(false)}/>

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
                    {isPlaying ? <Pause/> : <Play/>}
                </div>
                <div className="round-button" onClick={toggleFilter}>
                    {isFiltering ? <PenOff/> : <WandSparkles/>}
                </div>
            </div>
        </div>
    );
}

export default AudioPlayer;