import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto, TransformedAttendance, TransformedPractice, ViewType } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Star, Award, Zap, Heart, Database, Table, BarChart3, Code2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface MentorsProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Mentors: React.FC<MentorsProps> = ({ metrics, learners, attendanceData, practiceData, onNavigate, currentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const modules = [
    { name: 'SQL', icon: Database, color: '#3b82f6' },
    { name: 'Excel', icon: Table, color: '#10b981' },
    { name: 'PBI', icon: BarChart3, color: '#f59e0b' },
    { name: 'Python', icon: Code2, color: '#6366f1' }
  ];

  const mentorList = [
    { 
      name: 'Marianyl Itumay - Orlain', 
      role: 'Lead Data Analytics Mentor', 
      bio: 'Expert in Business Intelligence and Statistical Modeling with over 10+ years of industry experience.',
      image: '1cSdF7bbZjgp8FY9YU4bt0jtW3Jlb2POu' // Extracted ID from your link
    }
  ];

  const [selectedMentor] = useState<string>(mentorList[0].name);
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;

  // --- ACTUAL DATA: Module Performance Aggregation ---
  const modulePerformanceData = useMemo(() => {
    return modules.map(mod => {
      const att = attendanceData.filter(d => d.MODULE.toUpperCase().includes(mod.name.toUpperCase()));
      const prac = practiceData.filter(d => d.MODULE.toUpperCase().includes(mod.name.toUpperCase()));
      
      const avgAtt = att.length > 0 ? att.reduce((s, c) => s + c.Attendance_Rate, 0) / att.length : 0;
      const avgPrac = prac.length > 0 ? prac.reduce((s, c) => s + c.Rate_of_Submission, 0) / prac.length : 0;

      return {
        name: mod.name,
        attendance: Math.round(avgAtt),
        submission: Math.round(avgPrac)
      };
    });
  }, [attendanceData, practiceData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat transition-all duration-500" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 min-h-[80vh] flex flex-col">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Mentors Leadership</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Guiding the next generation of Data Analysts</p>
          </div>
          <div className="flex items-center gap-2 bg-rose-500/10 text-rose-600 px-5 py-2.5 rounded-2xl border border-rose-500/20">
            <Star className="fill-rose-600" size={18} />
            <span className="font-bold uppercase tracking-widest text-xs">Faculty Excellence</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Left Column: Premium Profile Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-pink-600" />
              
              <div className="flex flex-col items-center relative z-10">
                <div className="w-56 h-56 rounded-[3rem] border-8 border-rose-50 dark:border-rose-900/30 overflow-hidden shadow-2xl mb-6 transform group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={`https://drive.google.com/thumbnail?id=${mentorList[0].image}&sz=w1000`} 
                    alt={mentorList[0].name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center leading-tight">
                  {mentorList[0].name}
                </h3>
                <p className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-widest text-xs mt-2">
                  {mentorList[0].role}
                </p>
                
                <div className="flex gap-2 mt-6">
                  {modules.map((m, i) => (
                    <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-rose-500 transition-colors">
                      <m.icon size={18} />
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                  "{mentorList[0].bio}"
                </p>
              </div>
            </div>

            {/* Overall Impact Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <Users className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black text-gray-400 uppercase">Mentored</p>
                <p className="text-2xl font-black dark:text-white">{learners.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <Layers className="text-emerald-500 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black text-gray-400 uppercase">Batches</p>
                <p className="text-2xl font-black dark:text-white">{uniqueCohorts}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Performance Data */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Module Expertise Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((mod) => (
                <div key={mod.name} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center group hover:bg-rose-500 transition-all duration-300">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 mb-3 group-hover:bg-white/20 transition-colors">
                    <mod.icon className="text-gray-900 dark:text-white group-hover:text-white" size={24} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-white">{mod.name}</span>
                </div>
              ))}
            </div>

            {/* Engagement Trends Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Curriculum Engagement Trends</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> Attendance</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Submissions</div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modulePerformanceData}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                    <Area type="monotone" dataKey="submission" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSub)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mentor Performance by Module Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Student Success Benchmarks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-emerald-500"><Zap /></div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Avg Attendance</p>
                      <p className="text-2xl font-black dark:text-white">{metrics.Overall_Attendance_Rate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-indigo-500"><Award /></div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Success Rate</p>
                      <p className="text-2xl font-black dark:text-white">{metrics.Overall_Submission_Rate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};