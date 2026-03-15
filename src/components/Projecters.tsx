import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, LayoutGrid, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getDriveImageUrl, getHDImageUrl } from '../App';

const TEAM_MEMBERS = ["Dan", "Bonbon", "Lourdes", "Ehn", "Shawn", "Richbelle", "Zenny"];
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&h=250&auto=format&fit=crop";

// Map each team member's name to their Google Drive image link.
// Paste the shareable links from your folder here:
// https://drive.google.com/drive/folders/1GujT7mo6Q0i4xDTchQoPrgNMmNIG2Euu
const TEAM_IMAGE_LINKS: Record<string, string> = {
  "Dan": "https://drive.google.com/file/d/1efl0NonlhCLJQgypS0XDo_vUJZBsI9b9/view?usp=drive_link",
  "Bonbon": "https://drive.google.com/file/d/1ipognHNpjUrkaov6iR07__8spP0G7gpz/view?usp=drive_link",
  "Lourdes": "https://drive.google.com/file/d/1PN8BXhc5QEMvCcllBpZFJmoQZz4zlY8p/view?usp=drive_link",
  "Ehn": "https://drive.google.com/file/d/1cSdF7bbZjgp8FY9YU4bt0jtW3Jlb2POu/view?usp=drive_link",
  "Shawn": "https://drive.google.com/file/d/10fXRMsROh7B1QuUsn5HJyR0L8fjPUNoZ/view?usp=drive_link",
  "Richbelle": "https://drive.google.com/file/d/1FxYkrq6-BDogKqAC81t1XF3qB-cb5ice/view?usp=drive_link",
  "Zenny": "https://drive.google.com/file/d/1q37vs6WH45K6bIJYKUr9bw-W8f5y7Zy0/view?usp=drive_link"
};

type Formation = 'carousel' | 'v-shape';

const Projecters: React.FC = () => {
  const [formation, setFormation] = useState<Formation>('carousel');
  const [rotation, setRotation] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // Showroom Auto-rotation
  useEffect(() => {
    let interval: any;
    if (autoPlay && formation === 'carousel') {
      interval = setInterval(() => {
        setRotation(prev => prev + 51.4);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, formation]);

  const getImageForMember = (name: string) => {
    const link = TEAM_IMAGE_LINKS[name];
    if (!link) return DEFAULT_AVATAR;
    const driveUrl = getDriveImageUrl(link);
    return getHDImageUrl(driveUrl || link) || DEFAULT_AVATAR;
  };

  // 3D Math Logic
  const getTransform = (index: number) => {
    const mid = 3; // Shawn
    const offset = index - mid;

    if (formation === 'v-shape') {
      return {
        x: offset * 160,
        y: Math.abs(offset) * 20,
        z: Math.abs(offset) * -250,
        rotateY: offset * -15, // Slight angle to face the center
        scale: 1 - Math.abs(offset) * 0.05
      };
    } else {
      // Carousel Ring Logic
      const radius = 450;
      const angle = (index / TEAM_MEMBERS.length) * (Math.PI * 2);
      return {
        x: Math.sin(angle) * radius,
        y: 0,
        z: Math.cos(angle) * radius,
        rotateY: (index / TEAM_MEMBERS.length) * 360,
        scale: 1
      };
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-slate-50 dark:bg-[#0B1120] pt-16 md:pt-20 perspective-2000 rounded-2xl">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="text-center z-20 mb-10 px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          <Sparkles size={12} /> The Elite Seven
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-200 dark:to-slate-500">
          The Projecters
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.4em] text-[9px] md:text-[11px] mt-4">CORE INTELLIGENCE & ANALYTICS</p>
      </header>

      {/* 3D Main Stage */}
      <div className="relative w-full h-[500px] flex items-center justify-center transform-style-3d">
        
        {/* Reflection Floor */}
        <div className="absolute top-[85%] w-[1200px] h-[400px] bg-slate-900/[0.04] dark:bg-white/[0.02] rounded-[100%] blur-3xl transform -rotateX-90" />

        <motion.div 
          className="relative w-full h-full flex items-center justify-center transform-style-3d"
          animate={{ rotateY: formation === 'carousel' ? -rotation : 0 }}
          transition={{ type: "spring", stiffness: 35, damping: 20 }}
        >
          {TEAM_MEMBERS.map((name, index) => {
            const pos = getTransform(index);

            return (
              <motion.div
                key={name}
                className="absolute flex flex-col items-center transform-style-3d"
                animate={{ 
                  x: pos.x, 
                  y: pos.y, 
                  z: pos.z, 
                  rotateY: formation === 'carousel' ? pos.rotateY : pos.rotateY,
                  scale: pos.scale 
                }}
                transition={{ type: "spring", stiffness: 45, damping: 18 }}
              >
                {/* Profile Card */}
                <motion.div 
                  whileHover={{ y: -15, scale: 1.05 }}
                  className="relative group p-2 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white dark:border-white/10 shadow-2xl transition-colors duration-500"
                >
                  <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img 
                      src={getImageForMember(name)} 
                      onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)} 
                      alt={name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Nickname Floating Label */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max px-6 py-2 bg-slate-900 dark:bg-white rounded-xl shadow-2xl border border-white/20 dark:border-slate-800 transition-colors">
                     <span className="text-[11px] font-black text-white dark:text-slate-900 uppercase tracking-[0.25em]">{name}</span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Modern Control Bar */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-10 z-50 flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
        <button onClick={() => { setFormation('carousel'); setRotation(r => r - 51.4); }} className="p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
          <ChevronLeft size={20} />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        <button 
          onClick={() => setFormation(f => f === 'carousel' ? 'v-shape' : 'carousel')}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            formation === 'v-shape' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {formation === 'carousel' ? <LayoutGrid size={16} /> : <Play size={16} />}
          {formation === 'carousel' ? 'V-Formation' : 'Showroom'}
        </button>

        <button 
          onClick={() => setAutoPlay(!autoPlay)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            autoPlay 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Play size={16} fill={autoPlay ? "white" : "none"} />
          {autoPlay ? 'Live Mode' : 'Auto Play'}
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        <button onClick={() => { setFormation('carousel'); setRotation(r => r + 51.4); }} className="p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
          <ChevronRight size={20} />
        </button>
      </motion.div>
      
      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default Projecters;
