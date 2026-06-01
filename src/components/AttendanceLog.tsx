// src/components/AttendanceLog.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Fingerprint, Clock, Activity, CheckCircle2, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

const TEAMS_5TH: Record<string, string[]> = {
  "Team Fusion": ["Ariel Samar", "Cherryday Derecho", "Jean Marrie Dapal", "Gerald Dacoron", "Wilberto Bitonga Jr."],
  "Team Sheetheads": ["Jomarey Aresco", "Varick Sy", "Euniel Bayato", "Peegee Pearl Bordaje"],
  "Team Intercellar": ["Roselle Rabanes", "Clifford Villamor", "Jessel Christma Nudalo", "Garry Villasencio"],
  "Team Curious City": ["Methoe Shela Calan", "Jesah Carla Coloyan", "Christian Singco", "Dennis Claros"]
};

export interface AttendanceLogProps {
  onClose: () => void;
}

export const AttendanceLog: React.FC<AttendanceLogProps> = ({ onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [learnerName, setLearnerName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Attendance State
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [healthScore, setHealthScore] = useState<number>(0);

  // Time Logic Constants (Using 24-hour PM format since it's an evening class setup)
  const START_TIME_IN = 17.5; // 5:30 PM
  const END_TIME_IN = 19.5;   // 7:30 PM
  const AUTO_TIME_OUT = 20.5; // 8:30 PM

  // Extract and sort all names from the teams dictionary
  const allLearners = useMemo(() => {
    return Object.values(TEAMS_5TH).flat().sort();
  }, []);

  // Initialize clock and load remembered name
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load Remember Me state
    const savedName = localStorage.getItem('attendance_saved_name');
    if (savedName && allLearners.includes(savedName)) {
      setLearnerName(savedName);
      setRememberMe(true);
    }
    
    return () => clearInterval(timer);
  }, [allLearners]);

  // Compute Current Decimal Time
  const currentDecimalTime = currentTime.getHours() + (currentTime.getMinutes() / 60);
  
  // Logical Conditions
  const canTimeIn = currentDecimalTime >= START_TIME_IN && currentDecimalTime <= END_TIME_IN;
  const canTimeOut = currentDecimalTime >= START_TIME_IN;
  const isAutoTimeOutTriggered = currentDecimalTime >= AUTO_TIME_OUT;

  // Check database for existing logs whenever the name changes
  useEffect(() => {
    const checkExistingLog = async () => {
      if (!learnerName) {
        setHasTimedIn(false);
        setHasTimedOut(false);
        setHealthScore(0);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('learner_name', learnerName)
        .eq('log_date', today)
        .single();

      if (data) {
        if (data.time_in) setHasTimedIn(true);
        if (data.time_out) setHasTimedOut(true);
        if (data.health_score) setHealthScore(data.health_score);
      } else {
        setHasTimedIn(false);
        setHasTimedOut(false);
        setHealthScore(0);
      }
    };

    checkExistingLog();
  }, [learnerName]);

  // Auto-logout logic check
  useEffect(() => {
    if (isAutoTimeOutTriggered && hasTimedIn && !hasTimedOut && learnerName) {
      handleTimeOut(true);
    }
  }, [currentDecimalTime, hasTimedIn, hasTimedOut, learnerName]);

  const handleNameSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setLearnerName(name);
    setMessage(null);
    
    if (rememberMe && name) {
      localStorage.setItem('attendance_saved_name', name);
    } else {
      localStorage.removeItem('attendance_saved_name');
    }
  };

  const handleRememberToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    if (checked && learnerName) {
      localStorage.setItem('attendance_saved_name', learnerName);
    } else {
      localStorage.removeItem('attendance_saved_name');
    }
  };

  const handleTimeIn = async () => {
    if (!canTimeIn) return setMessage({ text: "Time In is only allowed between 5:30 PM and 7:30 PM", type: 'error' });
    if (!learnerName) return setMessage({ text: "Please select your name first.", type: 'error' });
    
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('attendance_logs')
      .upsert({
        learner_name: learnerName,
        log_date: today,
        time_in: new Date().toISOString(),
        status: 'Present'
      }, { onConflict: 'learner_name,log_date' });

    setLoading(false);

    if (error) {
      setMessage({ text: "Error syncing Time In to database.", type: 'error' });
    } else {
      setHasTimedIn(true);
      setMessage({ text: "Successfully Timed In! Have a great session.", type: 'success' });
    }
  };

  const handleTimeOut = async (isAuto: boolean = false) => {
    if (!hasTimedIn) return setMessage({ text: "You must Time In first.", type: 'error' });
    if (!canTimeOut && !isAuto) return setMessage({ text: "You cannot Time Out yet.", type: 'error' });
    
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Formula for Health Score: Max 100%. Deduct 10% if timed out automatically (missed manual logout)
    let computedHealth = 100;
    if (isAuto) computedHealth = 90; // Penalty for not manually logging out

    const { error } = await supabase
      .from('attendance_logs')
      .update({
        time_out: new Date().toISOString(),
        health_score: computedHealth
      })
      .eq('learner_name', learnerName)
      .eq('log_date', today);

    setLoading(false);

    if (error) {
      setMessage({ text: "Error syncing Time Out to database.", type: 'error' });
    } else {
      setHasTimedOut(true);
      setHealthScore(computedHealth);
      setMessage({ text: isAuto ? "System Auto-Logged you out at 8:30 PM." : "Successfully Timed Out. See you next time!", type: 'info' });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-[0_0_100px_rgba(251,191,36,0.15)] md:rounded-[2.5rem] overflow-hidden flex flex-col relative"
      >
        {/* --- HEADER --- */}
        <div className="h-16 md:h-20 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950 z-20 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 flex items-center justify-center rounded-xl md:rounded-2xl border border-amber-500/30 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Fingerprint className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                Biometric Core
              </h1>
              <p className="text-[9px] md:text-[10px] text-amber-400 font-mono tracking-widest uppercase flex items-center gap-1">
                <Activity className="w-3 h-3" /> Secure Attendance Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={onClose} 
              className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors shrink-0 shadow-lg"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-y-auto">
          
          {/* LEFT: DIGITAL CLOCK & INPUT */}
          <div className="flex-1 space-y-8">
            <div className="bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-3xl text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-2 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Current Network Time
              </p>
              <h2 className="text-5xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
              <p className="text-amber-500/80 mt-2 font-mono text-xs uppercase tracking-widest">
                {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Learner Identification</label>
              
              <select
                value={learnerName}
                onChange={handleNameSelection}
                className="w-full bg-slate-950 border-2 border-slate-800 text-white font-bold rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-colors shadow-inner appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Select Your Name --</option>
                {allLearners.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 mt-2 cursor-pointer group w-max">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={handleRememberToggle}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-amber-500 focus:ring-amber-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">
                  Remember Me on this device
                </span>
              </label>
            </div>

            {message && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${
                message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {message.text}
              </motion.div>
            )}
          </div>

          {/* RIGHT: CONTROLS & HEALTH */}
          <div className="flex-1 space-y-6 flex flex-col justify-center">
            
            <div className="grid grid-cols-1 gap-4">
              {/* TIME IN BUTTON */}
              <button
                onClick={handleTimeIn}
                disabled={!canTimeIn || hasTimedIn || loading}
                className={`py-6 px-8 rounded-3xl font-black text-lg uppercase tracking-widest flex items-center justify-between transition-all duration-300 ${
                  hasTimedIn 
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-none' 
                    : canTimeIn 
                      ? 'bg-amber-600 hover:bg-amber-500 border-2 border-amber-400 text-white shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-[1.02]' 
                      : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <span>{hasTimedIn ? 'Timed In' : 'Time In'}</span>
                {loading && !hasTimedIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <Fingerprint className="w-6 h-6" />}
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest -mt-2">
                Available: 5:30 PM - 7:30 PM
              </p>

              {/* TIME OUT BUTTON */}
              <button
                onClick={() => handleTimeOut(false)}
                disabled={!canTimeOut || !hasTimedIn || hasTimedOut || loading}
                className={`py-6 px-8 rounded-3xl font-black text-lg uppercase tracking-widest flex items-center justify-between transition-all duration-300 ${
                  hasTimedOut 
                    ? 'bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-none' 
                    : (canTimeOut && hasTimedIn)
                      ? 'bg-rose-600 hover:bg-rose-500 border-2 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-[1.02]' 
                      : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <span>{hasTimedOut ? 'Timed Out' : 'Time Out'}</span>
                {loading && !hasTimedOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest -mt-2">
                Available: 5:30 PM+ (Auto 8:30 PM)
              </p>
            </div>

            {/* HEALTH SCORE DISPLAY */}
            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl mt-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Attendance Health
                </h3>
                <span className={`text-xl font-black ${healthScore >= 90 ? 'text-emerald-400' : healthScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {healthScore}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${healthScore}%` }} 
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    healthScore >= 90 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' 
                    : healthScore >= 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  }`}
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-3 font-mono leading-relaxed">
                * Health is calculated based on adherence to Time In/Out schedules. Missing Time In counts as absent (0%). Failure to manually Time Out before 8:30 PM incurs a minor penalty (90%).
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};