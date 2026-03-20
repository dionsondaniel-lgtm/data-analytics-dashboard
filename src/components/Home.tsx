import React, { useMemo } from 'react';
import { OverallMetrics, Learner, TransformedAttendance, TransformedPractice, TransformedProject, ViewType } from '../types';
import { 
  Users, BookOpen, Layers, FileText, CheckCircle, 
  Award, TrendingUp, Trophy, Zap, ArrowUpRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { BottomNav } from './BottomNav';

interface HomeProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  projectData: TransformedProject[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Home: React.FC<HomeProps> = ({ metrics, learners, attendanceData, practiceData, projectData, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'EXCEL', 'PBI', 'PYTHON'];

  // --- ACTUAL DATA: Module Engagement (Average Attendance per Module) ---
  const moduleEngagementData = useMemo(() => {
    return modules.map(m => {
      const data = attendanceData.filter(d => d.MODULE.toUpperCase().includes(m));
      const avg = data.length > 0 
        ? data.reduce((sum, curr) => sum + curr.Attendance_Rate, 0) / data.length 
        : 0;
      return { name: m, val: Math.round(avg) };
    });
  }, [attendanceData]);

  // --- ACTUAL DATA: Cohort Distribution ---
  const cohortDistribution = useMemo(() => {
    const cohorts = Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean))).sort();
    return cohorts.map(cohort => ({
      name: `C-${cohort}`,
      students: learners.filter(l => l.COHORT_NO === cohort).length
    }));
  }, [learners]);

  // --- ACTUAL DATA: Top Performing Cohort ---
  const topCohort = useMemo(() => {
    const cohorts = Array.from(new Set(projectData.map(p => p.COHORT_NO)));
    if (cohorts.length === 0) return null;
    
    const performance = cohorts.map(c => {
      const projects = projectData.filter(p => p.COHORT_NO === c && p.GPA > 0);
      const avgGPA = projects.length > 0 ? projects.reduce((s, curr) => s + curr.GPA, 0) / projects.length : 0;
      return { id: c, score: avgGPA };
    });
    return performance.sort((a, b) => b.score - a.score)[0];
  }, [projectData]);

  // Total Practice Submissions Count
  const totalSubmissions = practiceData.reduce((sum, p) => sum + p.Total_Submitted, 0);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat transition-all duration-500" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 min-h-[80vh] flex flex-col">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Home Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Data Analytics Program Overview</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 bg-indigo-500 rounded-lg text-white"><Zap size={20} /></div>
            <div className="pr-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Live Pulse</p>
              <p className="text-sm font-bold dark:text-white">System Synchronized</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Top Row Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Module Engagement</h3>
                  <TrendingUp className="text-indigo-500" size={20} />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moduleEngagementData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cohort Population</h3>
                  <Users className="text-emerald-500" size={20} />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Bar dataKey="students" fill="#10b981" radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: 4 Small Cards & Best Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform cursor-pointer group">
                  <div className="p-3 bg-blue-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-blue-600 transition-colors">
                    <Users size={20} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Enrollees</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{learners.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform cursor-pointer group">
                  <div className="p-3 bg-emerald-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-emerald-600 transition-colors">
                    <Layers size={20} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Cohorts</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{uniqueCohorts}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform cursor-pointer group">
                  <div className="p-3 bg-purple-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-purple-600 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Modules</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">4</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform cursor-pointer group">
                  <div className="p-3 bg-amber-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-amber-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Submissions</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{totalSubmissions}</p>
                </div>
              </div>
              
              {/* THE BEST CARD: Performance Highlight */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-white/10">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                      <Trophy className="text-yellow-400" size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Cohort Leaderboard</h3>
                  </div>
                  
                  <div className="space-y-1 mb-6">
                    <p className="text-sm font-bold text-white/70 uppercase">Top Performing Batch</p>
                    <p className="text-4xl font-black">Cohort {topCohort?.id || 'N/A'}</p>
                  </div>

                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(topCohort?.score || 0) * 100}%` }} />
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Avg GPA</p>
                      <p className="text-lg font-black">{((topCohort?.score || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Learners</p>
                      <p className="text-lg font-black">{learners.filter(l => l.COHORT_NO === topCohort?.id).length}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate('Projects')}
                      className="ml-4 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors border border-white/10"
                    >
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Completion Rates</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Performance Benchmark</p>
              
              <div className="space-y-6">
                {[
                  { label: 'Attendance Rates', val: metrics.Overall_Attendance_Rate, color: 'text-emerald-500', icon: CheckCircle, bg: 'bg-emerald-500/10' },
                  { label: 'Class Practice', val: metrics.Overall_Submission_Rate, color: 'text-blue-500', icon: FileText, bg: 'bg-blue-500/10' },
                  { label: 'Avg GPA Score', val: metrics.Average_GPA * 100, color: 'text-purple-500', icon: Award, bg: 'bg-purple-500/10' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.label}</span>
                    </div>
                    <span className={`text-lg font-black ${item.color}`}>{item.val.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Active Curriculum</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {modules.map(mod => (
                  <div key={mod} className="group p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-indigo-500 transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-3 text-indigo-600 font-black text-xs group-hover:scale-110 transition-transform">
                      {mod.substring(0, 3)}
                    </div>
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{mod}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Cohort Distribution</h3>
              <div className="space-y-4">
                {cohortDistribution.map(c => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-600 dark:text-gray-400">{c.name}</span>
                      <span className="text-gray-900 dark:text-white">{c.students} Learners</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.students / learners.length) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};