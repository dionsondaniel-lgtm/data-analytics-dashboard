// src/components/GameNight.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { X, Gamepad2, Sparkles, Swords } from 'lucide-react';

export interface GameNightProps {
  onClose: () => void;
}

export const GameNight: React.FC<GameNightProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="w-full max-w-[98vw] h-[98vh] sm:h-[96vh] bg-slate-900 border border-slate-700 shadow-[0_0_100px_rgba(16,185,129,0.2)] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col relative"
      >
        {/* --- HEADER --- */}
        <div className="h-14 md:h-16 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950 z-20 shrink-0 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 flex items-center justify-center rounded-xl border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Gamepad2 className="text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
                Game Night <Swords className="w-4 h-4 text-emerald-400 hidden sm:block" />
              </h1>
              <p className="text-[8px] md:text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Skribbl.io Arena Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={onClose} 
              className="p-2 md:p-2.5 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors shrink-0 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- SKRIBBL.IO IFRAME EMBED --- */}
        <div className="flex-1 bg-black relative w-full h-full">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Establishing Connection...</p>
          </div>
          <iframe
            src="https://skribbl.io/"
            title="Skribbl.io Interactive Arena"
            className="absolute inset-0 w-full h-full border-0 z-10 bg-transparent"
            allow="autoplay; fullscreen; microphone"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </motion.div>
    </div>
  );
};