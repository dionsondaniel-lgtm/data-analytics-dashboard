// src/components/GameNight.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gamepad2, Sparkles, Swords, Link as LinkIcon, ClipboardPaste, MessageCircle, ShieldCheck, Info, LogIn } from 'lucide-react';

export interface GameNightProps {
  onClose: () => void;
}

export const GameNight: React.FC<GameNightProps> = ({ onClose }) => {
  const [roomLink, setRoomLink] = useState('');
  const [iframeUrl, setIframeUrl] = useState('https://skribbl.io/');

  // Auto-paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('skribbl.io')) {
        setRoomLink(text);
      } else {
        alert("Clipboard doesn't contain a valid Skribbl link.");
      }
    } catch (err) {
      alert("Browser blocked auto-paste. Please manually paste the link into the box.");
    }
  };

  // Navigate iframe to the pasted link
  const handleJoin = () => {
    if (!roomLink) {
      alert("Please paste a room link first!");
      return;
    }
    if (roomLink.includes('skribbl.io')) {
      setIframeUrl(roomLink);
    } else {
      alert("Must be a valid Skribbl.io link! (e.g., https://skribbl.io/?xxxxx)");
    }
  };

  // Share link natively or fallback to copy
  const handleShare = async () => {
    if (!roomLink) {
      alert("Please paste a room link first!");
      return;
    }
    
    // Uses modern Web Share API (Triggers native iOS/Android/Windows share sheet with Messenger)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Game Night!',
          text: 'Come play Skribbl.io with me in my private room!',
          url: roomLink,
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
    } else {
      // Fallback: Try to open Messenger deep link directly
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `fb-messenger://share/?link=${encodeURIComponent(roomLink)}`;
      } else {
        navigator.clipboard.writeText(roomLink);
        alert("Link copied! Paste it in Messenger or WhatsApp to invite your friends.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="w-full max-w-[98vw] h-[98vh] sm:h-[96vh] bg-slate-900 border border-slate-700 shadow-[0_0_100px_rgba(16,185,129,0.2)] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col relative"
      >
        {/* --- HEADER --- */}
        <div className="h-[96px] md:h-24 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950 z-20 shrink-0 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3 md:gap-4 relative z-10 w-1/4 md:w-1/4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-500/20 flex items-center justify-center rounded-xl border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Gamepad2 className="text-emerald-400 w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-sm md:text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
                Game Night <Swords className="w-4 h-4 text-emerald-400 hidden lg:block" />
              </h1>
              <p className="text-[8px] md:text-[10px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1 hidden sm:flex">
                <Sparkles className="w-3 h-3" /> Skribbl Arena
              </p>
            </div>
          </div>

          {/* Center: Command Bar (Join / Share) */}
          <div className="hidden md:flex flex-col items-center justify-center relative z-10 w-2/4 md:w-2/4">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-4">
              <span><span className="text-emerald-400">Join:</span> Paste Link ➔ Join</span>
              <span>•</span>
              <span><span className="text-blue-400">Invite:</span> Copy Game Link ➔ Paste ➔ Share</span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 focus-within:border-emerald-500/50 rounded-full p-1 shadow-inner w-full max-w-xl transition-colors">
              <div className="pl-3 py-1">
                <LinkIcon className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Paste room link here to Join or Share..."
                value={roomLink}
                onChange={(e) => setRoomLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 flex-1 w-full"
              />
              
              <button 
                onClick={handlePaste}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3 h-3" /> Paste
              </button>
              
              <div className="h-4 w-px bg-slate-700 mx-1"></div>

              <button 
                onClick={handleJoin} 
                disabled={!roomLink}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 ${roomLink ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`} 
                title="Join this room"
              >
                <LogIn className="w-3 h-3" /> Join
              </button>

              <button 
                onClick={handleShare} 
                disabled={!roomLink}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all mr-1 flex items-center gap-1 ${roomLink ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`} 
                title="Share link to friends"
              >
                <MessageCircle className="w-3 h-3" /> Share
              </button>
            </div>
          </div>

          {/* Right: Ad Blocker Status & Close */}
          <div className="flex items-center justify-end gap-3 md:gap-4 relative z-10 w-1/4 md:w-1/4">
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full" title="Popup ads and malicious redirects are blocked natively by the system sandbox.">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-widest whitespace-nowrap">Ads Blocked</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors shrink-0 shadow-lg"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* --- MOBILE LINK MANAGER (Visible only on small screens) --- */}
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-2 px-3 flex flex-col gap-2">
          <div className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Paste Link below to Join or Share
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-full p-1">
            <LinkIcon className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Paste link..."
              value={roomLink}
              onChange={(e) => setRoomLink(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] text-white placeholder-slate-500 flex-1 w-full"
            />
            <button onClick={handlePaste} className="p-1.5 rounded-full bg-slate-800 text-slate-300">
              <ClipboardPaste className="w-3 h-3" />
            </button>
            <button onClick={handleJoin} disabled={!roomLink} className={`p-1.5 rounded-full ${roomLink ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
              <LogIn className="w-3 h-3" />
            </button>
            <button onClick={handleShare} disabled={!roomLink} className={`p-1.5 rounded-full mr-1 ${roomLink ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
              <MessageCircle className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* --- SKRIBBL.IO IFRAME EMBED --- */}
        <div className="flex-1 bg-slate-950 relative w-full h-full">
          {/* Loading state behind iframe */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Establishing Connection...</p>
          </div>
          
          <iframe
            key={iframeUrl} // Forces re-render of iframe when URL changes
            src={iframeUrl}
            title="Skribbl.io Interactive Arena"
            className="absolute inset-0 w-full h-full border-0 z-10 bg-transparent"
            /* CRITICAL FIX: clipboard-write / read allows Skribbl's native button to work */
            allow="autoplay; clipboard-read; clipboard-write; fullscreen; microphone"
            /* Removing 'allow-popups' securely blocks all popup ads and redirects! */
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </motion.div>
    </div>
  );
};