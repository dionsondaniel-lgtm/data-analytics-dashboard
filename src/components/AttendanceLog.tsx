// src/components/AttendanceLog.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Fingerprint, Clock, Activity, CheckCircle2, AlertCircle, 
  Loader2, LogOut, Database, Download, Search, Calendar, BarChart3, Users 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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

  // Overview Modal State
  const [showOverview, setShowOverview] = useState(false);
  const [logsData, setLogsData] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Filters for Overview
  const [filterName, setFilterName] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Time Logic Constants
  const START_TIME_IN = 17.5; // 5:30 PM
  const END_TIME_IN = 19.5;   // 7:30 PM
  const AUTO_TIME_OUT = 20.5; // 8:30 PM

  // Extract and sort all names
  const allLearners = useMemo(() => {
    return Object.values(TEAMS_5TH).flat().sort();
  }, []);

  // Initialize clock and load remembered name
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const savedName = localStorage.getItem('attendance_saved_name');
    if (savedName && allLearners.includes(savedName)) {
      setLearnerName(savedName);
      setRememberMe(true);
    }
    return () => clearInterval(timer);
  }, [allLearners]);

  const currentDecimalTime = currentTime.getHours() + (currentTime.getMinutes() / 60);
  const canTimeIn = currentDecimalTime >= START_TIME_IN && currentDecimalTime <= END_TIME_IN;
  const canTimeOut = currentDecimalTime >= START_TIME_IN;
  const isAutoTimeOutTriggered = currentDecimalTime >= AUTO_TIME_OUT;

  // Check existing log for the current day
  useEffect(() => {
    const checkExistingLog = async () => {
      if (!learnerName) {
        setHasTimedIn(false);
        setHasTimedOut(false);
        setHealthScore(0);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
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
    if (rememberMe && name) localStorage.setItem('attendance_saved_name', name);
    else localStorage.removeItem('attendance_saved_name');
  };

  const handleRememberToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (checked && learnerName) localStorage.setItem('attendance_saved_name', learnerName);
    else localStorage.removeItem('attendance_saved_name');
  };

  const handleTimeIn = async () => {
    if (!canTimeIn) return setMessage({ text: "Time In is only allowed between 5:30 PM and 7:30 PM", type: 'error' });
    if (!learnerName) return setMessage({ text: "Please select your name first.", type: 'error' });
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('attendance_logs')
      .upsert({ learner_name: learnerName, log_date: today, time_in: new Date().toISOString(), status: 'Present' }, { onConflict: 'learner_name,log_date' });
    setLoading(false);
    if (error) setMessage({ text: "Error syncing Time In to database.", type: 'error' });
    else {
      setHasTimedIn(true);
      setMessage({ text: "Successfully Timed In! Have a great session.", type: 'success' });
    }
  };

  const handleTimeOut = async (isAuto: boolean = false) => {
    if (!hasTimedIn) return setMessage({ text: "You must Time In first.", type: 'error' });
    if (!canTimeOut && !isAuto) return setMessage({ text: "You cannot Time Out yet.", type: 'error' });
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    let computedHealth = 100;
    if (isAuto) computedHealth = 90;
    const { error } = await supabase
      .from('attendance_logs')
      .update({ time_out: new Date().toISOString(), health_score: computedHealth })
      .eq('learner_name', learnerName)
      .eq('log_date', today);
    setLoading(false);
    if (error) setMessage({ text: "Error syncing Time Out to database.", type: 'error' });
    else {
      setHasTimedOut(true);
      setHealthScore(computedHealth);
      setMessage({ text: isAuto ? "System Auto-Logged you out at 8:30 PM." : "Successfully Timed Out. See you next time!", type: 'info' });
    }
  };

  // --- OVERVIEW METRICS & FETCHING ---
  const fetchAllLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase.from('attendance_logs').select('*').order('log_date', { ascending: false });
    if (!error && data) setLogsData(data);
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (showOverview) fetchAllLogs();
  }, [showOverview]);

  const filteredLogs = useMemo(() => {
    return logsData.filter(log => {
      const matchName = filterName ? log.learner_name.toLowerCase().includes(filterName.toLowerCase()) : true;
      const matchStart = filterDateFrom ? new Date(log.log_date) >= new Date(filterDateFrom) : true;
      const matchEnd = filterDateTo ? new Date(log.log_date) <= new Date(filterDateTo) : true;
      return matchName && matchStart && matchEnd;
    });
  }, [logsData, filterName, filterDateFrom, filterDateTo]);

  const healthStats = useMemo(() => {
    let perfect = 0, warning = 0, absent = 0;
    filteredLogs.forEach(log => {
      if (log.health_score === 100) perfect++;
      else if (log.health_score > 0) warning++;
      else absent++;
    });
    return [
      { name: 'Perfect (100%)', value: perfect, color: '#10b981' }, // Emerald
      { name: 'Warning (<100%)', value: warning, color: '#f59e0b' }, // Amber
      { name: 'Absent/Missed', value: absent, color: '#f43f5e' } // Rose
    ];
  }, [filteredLogs]);

  const dailyTrend = useMemo(() => {
    const days: Record<string, number> = {};
    filteredLogs.forEach(log => {
      if (log.health_score > 0) days[log.log_date] = (days[log.log_date] || 0) + 1;
    });
    return Object.keys(days).sort().map(date => ({ date, Present: days[date] }));
  }, [filteredLogs]);

  const handleExportXLS = () => {
    const tableHeaders = ['Learner Name', 'Date', 'Time In', 'Time Out', 'Status', 'Health Score'];
    let html = `<table border="1"><tr>${tableHeaders.map(h => `<th style="background:#0f172a; color:#fff;">${h}</th>`).join('')}</tr>`;
    filteredLogs.forEach(log => {
      html += `<tr>
        <td>${log.learner_name}</td>
        <td>${log.log_date}</td>
        <td>${log.time_in ? new Date(log.time_in).toLocaleTimeString() : 'N/A'}</td>
        <td>${log.time_out ? new Date(log.time_out).toLocaleTimeString() : 'N/A'}</td>
        <td>${log.status}</td>
        <td>${log.health_score}%</td>
      </tr>`;
    });
    html += `</table>`;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Attendance_Overview.xls';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-2xl">
      <style>{`
        .scrollbar-sleek::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-sleek::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-sleek::-webkit-scrollbar-thumb { background: #475569; border-radius: 8px; }
        .scrollbar-sleek::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
      `}</style>

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

          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => setShowOverview(true)}
              className="px-3 md:px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> <span className="hidden sm:inline">Overview Logs</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 md:p-3 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors shrink-0 shadow-lg"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* --- MAIN BIOMETRIC BODY --- */}
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
                {allLearners.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>

              <label className="flex items-center gap-2 mt-2 cursor-pointer group w-max">
                <input 
                  type="checkbox" checked={rememberMe} onChange={handleRememberToggle}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-amber-500 focus:ring-amber-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">
                  Remember Me on this device
                </span>
              </label>
            </div>

            {message && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {message.text}
              </motion.div>
            )}
          </div>

          {/* RIGHT: CONTROLS & HEALTH */}
          <div className="flex-1 space-y-6 flex flex-col justify-center">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleTimeIn} disabled={!canTimeIn || hasTimedIn || loading}
                className={`py-6 px-8 rounded-3xl font-black text-lg uppercase tracking-widest flex items-center justify-between transition-all duration-300 ${hasTimedIn ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-none' : canTimeIn ? 'bg-amber-600 hover:bg-amber-500 border-2 border-amber-400 text-white shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-[1.02]' : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'}`}
              >
                <span>{hasTimedIn ? 'Timed In' : 'Time In'}</span>
                {loading && !hasTimedIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <Fingerprint className="w-6 h-6" />}
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest -mt-2">Available: 5:30 PM - 7:30 PM</p>

              <button
                onClick={() => handleTimeOut(false)} disabled={!canTimeOut || !hasTimedIn || hasTimedOut || loading}
                className={`py-6 px-8 rounded-3xl font-black text-lg uppercase tracking-widest flex items-center justify-between transition-all duration-300 ${hasTimedOut ? 'bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-none' : (canTimeOut && hasTimedIn) ? 'bg-rose-600 hover:bg-rose-500 border-2 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-[1.02]' : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'}`}
              >
                <span>{hasTimedOut ? 'Timed Out' : 'Time Out'}</span>
                {loading && !hasTimedOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest -mt-2">Available: 5:30 PM+ (Auto 8:30 PM)</p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl mt-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Attendance Health
                </h3>
                <span className={`text-xl font-black ${healthScore >= 90 ? 'text-emerald-400' : healthScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{healthScore}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${healthScore >= 90 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : healthScore >= 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* --- OVERVIEW MODAL (FULLSCREEN OVERLAY WITHIN CONTAINER) --- */}
        <AnimatePresence>
          {showOverview && (
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-slate-950 flex flex-col"
            >
              {/* Overview Header */}
              <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-black text-white uppercase tracking-widest">Global Attendance Logs</h2>
                </div>
                <button onClick={() => setShowOverview(false)} className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              {/* Overview Body */}
              <div className="flex-1 overflow-y-auto scrollbar-sleek p-6 space-y-6">
                
                {/* Filters & Export */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-end justify-between">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Search className="w-3 h-3" /> Search Name</label>
                      <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="e.g. Alto..." className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 w-full md:w-48" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Date From</label>
                      <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 w-full md:w-auto" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Date To</label>
                      <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 w-full md:w-auto" />
                    </div>
                  </div>
                  <button onClick={handleExportXLS} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all w-full md:w-auto justify-center">
                    <Download className="w-4 h-4" /> Export (XLS)
                  </button>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pie Chart: Health Distribution */}
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl h-64 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Health Breakdown</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={healthStats} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {healthStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Perfect</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"/> Warning</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"/> Absent</span>
                    </div>
                  </div>

                  {/* Bar Chart: Daily Attendance Trend */}
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl h-64 md:col-span-2 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-400" /> Daily Active Learners</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyTrend}>
                          <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                          <YAxis stroke="#475569" fontSize={10} allowDecimals={false} />
                          <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="Present" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-80 relative">
                  <div className="absolute top-0 left-0 w-full h-full overflow-auto scrollbar-sleek">
                    {loadingLogs ? (
                      <div className="flex items-center justify-center h-full text-indigo-400 font-bold uppercase text-xs tracking-widest gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Fetching Network Logs...
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                        <thead className="bg-slate-950 sticky top-0 z-10 shadow-md">
                          <tr>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800"><Users className="w-4 h-4 inline mr-1"/> Learner Name</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Date</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Time In</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Time Out</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Health</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 text-slate-200 font-medium">{log.learner_name}</td>
                              <td className="p-4 text-slate-400">{log.log_date}</td>
                              <td className="p-4 text-slate-300 font-mono text-xs">{log.time_in ? new Date(log.time_in).toLocaleTimeString() : <span className="text-slate-600">N/A</span>}</td>
                              <td className="p-4 text-slate-300 font-mono text-xs">{log.time_out ? new Date(log.time_out).toLocaleTimeString() : <span className="text-slate-600">N/A</span>}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${log.health_score === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : log.health_score > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {log.health_score}%
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">No logs found matching filters.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};