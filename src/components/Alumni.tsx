import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto, TransformedAttendance, TransformedPractice, ViewType } from '../types';
import { 
  Users, BookOpen, Layers, FileText, Search, 
  Image as ImageIcon, Award, X, FilterX, 
  Database, Table, BarChart3, Code2, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface AlumniProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Alumni: React.FC<AlumniProps> = ({ 
  metrics, 
  learners, 
  attendanceData, 
  practiceData, 
  cohortPhotos, 
  onNavigate, 
  currentView 
}) => {
  const [selectedAlumni, setSelectedAlumni] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Module configurations for icons and colors
  const moduleConfig = [
    { name: 'SQL', icon: Database, color: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Excel', icon: Table, color: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Power BI', icon: BarChart3, color: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Python', icon: Code2, color: '#6366f1', text: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const filteredAlumni = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedAlumni ? cohortPhotos.find(p => p.NAME === selectedAlumni)?.IMAGE_URL : null;

  // Helper to get analytic metrics per module for the 4 small cards
  const getModuleMetrics = (modName: string) => {
    const searchKey = modName === 'Power BI' ? 'PBI' : modName.toUpperCase();
    
    // Attendance Calculation
    const attLogs = attendanceData.filter(d => d.MODULE.toUpperCase().includes(searchKey) && (selectedAlumni ? d.NAME === selectedAlumni : true));
    const attRate = attLogs.length > 0 ? (attLogs.reduce((s, c) => s + c.Total_Lesson_Sum, 0) / attLogs.reduce((s, c) => s + c.Overall_Sum, 0)) * 100 : 0;
    
    // Practice Calculation
    const pracLogs = practiceData.filter(d => d.MODULE.toUpperCase().includes(searchKey) && (selectedAlumni ? d.NAME === selectedAlumni : true));
    const pracRate = pracLogs.length > 0 ? pracLogs.reduce((s, c) => s + c.Rate_of_Submission, 0) / pracLogs.length : 0;

    return {
      attendance: Math.round(attRate),
      submission: Math.round(pracRate),
      health: Math.round((attRate + pracRate) / 2)
    };
  };

  // ACTUAL DATA: Practice Submission Trend
  const realPracticeTrend = useMemo(() => {
    return moduleConfig.map(mod => {
      const searchKey = mod.name === 'Power BI' ? 'PBI' : mod.name.toUpperCase();
      const logs = practiceData.filter(d => d.MODULE.toUpperCase().includes(searchKey) && (selectedAlumni ? d.NAME === selectedAlumni : true));
      const avgRate = logs.length > 0 ? logs.reduce((sum, curr) => sum + curr.Rate_of_Submission, 0) / logs.length : 0;
      return { name: mod.name, val: Math.round(avgRate) };
    });
  }, [selectedAlumni, practiceData]);

  // ACTUAL DATA: Attendance Stacked Bar
  const realAttendanceData = useMemo(() => {
    return moduleConfig.map(mod => {
      const searchKey = mod.name === 'Power BI' ? 'PBI' : mod.name.toUpperCase();
      const logs = attendanceData.filter(d => d.MODULE.toUpperCase().includes(searchKey) && (selectedAlumni ? d.NAME === selectedAlumni : true));
      const totalPresent = logs.reduce((sum, curr) => sum + curr.Total_Lesson_Sum, 0);
      const totalPossible = logs.reduce((sum, curr) => sum + curr.Overall_Sum, 0);
      return { name: mod.name, present: totalPresent, absent: Math.max(0, totalPossible - totalPresent) };
    });
  }, [selectedAlumni, attendanceData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")' }}>
      
      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 min-h-[80vh] flex flex-col transition-all duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Alumni Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tracking graduate performance and engagement</p>
          </div>
          <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-2xl border border-amber-500/20 flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-bold">Elite Certified</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Profile Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
              
              <div className="w-44 h-44 rounded-full border-4 border-amber-100 dark:border-amber-900/50 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-2xl mb-6 relative">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Alumni" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center leading-tight">
                {selectedAlumni || 'Select an Alumni'}
              </h3>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Enrollees', val: learners.length, icon: Users, color: 'bg-blue-500' },
                  { label: 'Cohorts', val: uniqueCohorts, icon: Layers, color: 'bg-emerald-500' },
                  { label: 'Modules', val: 4, icon: BookOpen, color: 'bg-purple-500' },
                  { label: 'Lessons', val: 45, icon: FileText, color: 'bg-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                    <div className={`p-2 ${stat.color} rounded-xl mb-2 text-white shadow-lg`}>
                      <stat.icon size={18} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{stat.val}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Charts & Search Column */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Card */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alumni Search</h3>
                  {selectedAlumni && (
                    <button 
                      onClick={() => setSelectedAlumni(null)}
                      className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg flex items-center hover:bg-amber-100 transition-colors"
                    >
                      <FilterX className="w-3 h-3 mr-1" /> RESET
                    </button>
                  )}
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" placeholder="Search alumni..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 dark:text-white"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredAlumni.map(l => (
                    <div 
                      key={l.NAME} onClick={() => setSelectedAlumni(l.NAME)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 ${selectedAlumni === l.NAME ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-gray-700 dark:text-gray-200'}`}
                    >
                      <p className="font-bold text-sm">{l.NAME}</p>
                      <p className={`text-[10px] font-medium ${selectedAlumni === l.NAME ? 'text-amber-100' : 'text-gray-500'}`}>{l.COHORT_NO}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANALYTIC MODULE CARDS (REPLACED STATIC CARDS) */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {moduleConfig.map(mod => {
                  const stats = getModuleMetrics(mod.name);
                  return (
                    <div key={mod.name} className="bg-white dark:bg-gray-800 rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-2xl ${mod.bg} ${mod.text} group-hover:scale-110 transition-transform`}>
                          <mod.icon size={22} />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mod.name} Status</p>
                          <div className="flex items-center gap-1 justify-end text-emerald-500">
                            <Activity size={12} />
                            <span className="text-xs font-bold">Active</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 my-2">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Attendance</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.attendance}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Practice</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.submission}%</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                          <span>Health Score</span>
                          <span>{stats.health}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${stats.health}%`, backgroundColor: mod.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Large Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                   {selectedAlumni ? `${selectedAlumni}'s Submission Mastery` : 'Global Submission Trends'}
                </h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realPracticeTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="val" name="Rate" stroke="#f59e0b" strokeWidth={5} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                   {selectedAlumni ? `${selectedAlumni}'s Engagement` : 'Global Engagement Breakdown'}
                </h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realAttendanceData} margin={{ top: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar name="Present" dataKey="present" stackId="a" fill="#10b981" barSize={35} />
                      <Bar name="Absent" dataKey="absent" stackId="a" fill="#f43f5e" barSize={35} radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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