import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Volume2,
  VolumeX
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface AudioPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onOpenLyrics: () => void;
  onOpenEqualizer: () => void;
  onQueueTrack: (track: Track) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNextTrack,
  onPrevTrack,
  onOpenLyrics,
  onOpenEqualizer,
  onQueueTrack
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    audioEngine.onTimeUpdate(t => setCurrentTime(t));
    audioEngine.onEnded(() => {
      if (isRepeat) {
        if (currentTrack) audioEngine.playTrack(currentTrack, 0);
      } else {
        onNextTrack();
      }
    });
  }, [currentTrack, isRepeat, onNextTrack]);

  // Real-time Canvas Spectrum Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderSpectrum = () => {
      const freqData = audioEngine.getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        const barWidth = (canvas.width / 24) - 1.5;
        for (let i = 0; i < 24; i++) {
          const val = freqData[i * 3] || 0;
          const barHeight = Math.max(2, (val / 255) * canvas.height * 0.9);
          const x = i * (barWidth + 1.5);
          const y = canvas.height - barHeight;

          // Gradient color from cyan to blue
          const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
          grad.addColorStop(0, '#22d3ee');
          grad.addColorStop(1, '#0284c7');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 1.5);
          ctx.fill();
        }
      } else {
        // Idle flat waveform dots
        ctx.fillStyle = '#334155';
        for (let i = 0; i < 24; i++) {
          const x = i * ((canvas.width / 24));
          ctx.fillRect(x, canvas.height / 2 - 1, 2, 2);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    audioEngine.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const handleScrub = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="h-20 bg-neutral-950/95 border-t border-neutral-800 px-6 flex items-center justify-between z-40 fixed bottom-0 inset-x-0 backdrop-blur-lg">
        <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
          <span>Audiophile DAC Standby</span>
          <span>·</span>
          <span>Select any track to preview FLAC audio</span>
        </div>
      </div>
    );
  }

  const duration = currentTrack.duration || 180;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div className="h-20 bg-neutral-950/95 border-t border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-40 fixed bottom-0 inset-x-0 backdrop-blur-lg shadow-2xl select-none">
      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3">
        <ArtworkVisual
          gradient={currentTrack.coverGradient}
          size="sm"
          isPlaying={isPlaying}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-100 truncate">
              {currentTrack.title}
            </span>
            <span className="text-[9px] font-mono font-bold px-1 rounded bg-neutral-900 text-cyan-400 border border-neutral-800 shrink-0">
              FLAC 1411k
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
            {currentTrack.artist} · {currentTrack.album}
          </p>
        </div>
      </div>

      {/* Center Controls & Timeline */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1 rounded text-xs transition-colors ${
              isShuffle ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-1 text-neutral-400 hover:text-neutral-100 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 flex items-center justify-center transition-all shadow-md hover:scale-105"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-1 text-neutral-400 hover:text-neutral-100 transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-1 rounded text-xs transition-colors ${
              isRepeat ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Repeat"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="w-full flex items-center gap-2 text-[10px] font-mono text-neutral-400">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group py-1 cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration}
              step="1"
              value={currentTime}
              onChange={e => handleScrub(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Controls: Visualizer canvas, Lyrics, Equalizer & Volume */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4 sm:w-1/3">
        {/* Real-time Web Audio Spectrum Analyser */}
        <div className="hidden xl:block w-20 h-6">
          <canvas ref={canvasRef} width={80} height={24} className="w-full h-full" />
        </div>

        {/* LRC Synced Lyrics Button */}
        <button
          onClick={onOpenLyrics}
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-cyan-400 transition-colors"
          title="Live Synced Lyrics"
        >
          <ListMusic className="w-3.5 h-3.5" />
        </button>

        {/* 10-Band EQ Button */}
        <button
          onClick={onOpenEqualizer}
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-cyan-400 transition-colors"
          title="Parametric Equalizer"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Volume Slider */}
        <div className="hidden lg:flex items-center gap-1.5 w-24">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-neutral-200"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
