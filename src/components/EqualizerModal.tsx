import React, { useState } from 'react';
import { RotateCcw, Sliders, Volume2, X } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EQ_PRESETS: { name: string; gains: number[] }[] = [
  { name: 'Flat Reference', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Booster', gains: [7, 6, 4, 2, 0, 0, 0, 1, 2, 3] },
  { name: 'Vocal Clarity', gains: [-2, -1, 0, 2, 5, 6, 4, 2, 0, -1] },
  { name: 'Audiophile Acoustic', gains: [3, 2, 0, 1, 2, 3, 4, 4, 3, 2] },
  { name: 'Electronic Club', gains: [6, 5, 2, 0, -1, 2, 3, 5, 6, 6] },
  { name: 'Treble Sparkle', gains: [-2, -2, 0, 0, 1, 3, 5, 7, 8, 8] },
  { name: 'Rock Master', gains: [5, 4, 2, 0, -1, 1, 3, 5, 5, 4] }
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const [gains, setGains] = useState<number[]>([...audioEngine.eqGains]);
  const [activePreset, setActivePreset] = useState<string>('Flat Reference');

  if (!isOpen) return null;

  const handleGainChange = (idx: number, val: number) => {
    const next = [...gains];
    next[idx] = val;
    setGains(next);
    audioEngine.setEqBand(idx, val);
    setActivePreset('Custom');
  };

  const handleApplyPreset = (preset: { name: string; gains: number[] }) => {
    setGains([...preset.gains]);
    setActivePreset(preset.name);
    audioEngine.setEqPreset(preset.gains);
  };

  const handleReset = () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    setGains(flat);
    setActivePreset('Flat Reference');
    audioEngine.setEqPreset(flat);
  };

  const formatFreq = (f: number) => {
    return f >= 1000 ? `${f / 1000}k` : `${f}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-neutral-100">10-Band Parametric Equalizer</h2>
              <p className="text-xs text-neutral-400">Real-time Web Audio DSP filter curve & presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
          {EQ_PRESETS.map(p => {
            const isActive = activePreset === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* 10 Vertical Sliders Grid */}
        <div className="p-6 bg-neutral-950/60">
          <div className="grid grid-cols-10 gap-2 h-52 items-end pt-4 pb-2">
            {[32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000].map((freq: number, idx: number) => {
              const gain = gains[idx] ?? 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between group">
                  {/* Gain label */}
                  <span className="text-[10px] font-mono font-medium text-cyan-400">
                    {gain > 0 ? `+${gain}` : `${gain}`}
                  </span>

                  {/* Vertical Range Slider */}
                  <div className="relative flex-1 flex items-center justify-center w-full py-2">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={e => handleGainChange(idx, parseFloat(e.target.value))}
                      className="w-28 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer -rotate-90 origin-center"
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 font-mono">
            <span>Range: -12 dB to +12 dB</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-cyan-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Flat</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-all shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
