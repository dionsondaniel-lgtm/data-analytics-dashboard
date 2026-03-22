import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto, TransformedAttendance, TransformedPractice, ViewType } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Image as ImageIcon, X, FilterX, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface LearnersProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Learners: React.FC<LearnersProps> = ({ 
  metrics, 
  learners, 
  attendanceData, 
  practiceData, 
  cohortPhotos, 
  onNavigate, 
  currentView 
}) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = [
    { id: 'SQL', color: '#3b82f6' },
    { id: 'Excel', color: '#10b981' },
    { id: 'PBI', color: '#f59e0b' },
    { id: 'Python', color: '#6366f1' }
  ];
  
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLearners = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedLearner ? cohortPhotos.find(p => p.NAME === selectedLearner)?.IMAGE_URL : null;

  // Helper to get Module-specific rate for the 4 analytic mini-cards
  const getModuleRate = (modId: string) => {
    const searchKey = modId === 'PBI' ? 'PBI' : modId.toUpperCase();
    const logs = practiceData.filter(d => 
      (d.MODULE.toUpperCase().includes(searchKey) || (modId === 'PBI' && d.MODULE.toUpperCase().includes('POWER BI'))) && 
      (selectedLearner ? d.NAME === selectedLearner : true)
    );
    if (logs.length === 0) return 0;
    return Math.round(logs.reduce((sum, curr) => sum + curr.Rate_of_Submission, 0) / logs.length);
  };

  // REAL DATA: Practice Trend (Line Chart)
  const realTrendData = useMemo(() => {
    return modules.map(mod => {
      const searchKey = mod.id === 'PBI' ? 'PBI' : mod.id.toUpperCase();
      const logs = practiceData.filter(d => 
        (d.MODULE.toUpperCase().includes(searchKey) || (mod.id === 'PBI' && d.MODULE.toUpperCase().includes('POWER BI'))) && 
        (selectedLearner ? d.NAME === selectedLearner : true)
      );
      const avgRate = logs.length > 0 ? logs.reduce((sum, curr) => sum + curr.Rate_of_Submission, 0) / logs.length : 0;
      return { name: mod.id, val: Math.round(avgRate) };
    });
  }, [selectedLearner, practiceData]);

  // REAL DATA: Attendance Stacked Bar
  const realAttendanceData = useMemo(() => {
    return modules.map(mod => {
      const searchKey = mod.id === 'PBI' ? 'PBI' : mod.id.toUpperCase();
      const logs = attendanceData.filter(d => 
        (d.MODULE.toUpperCase().includes(searchKey) || (mod.id === 'PBI' && d.MODULE.toUpperCase().includes('POWER BI'))) && 
        (selectedLearner ? d.NAME === selectedLearner : true)
      );
      const totalPresent = logs.reduce((sum, curr) => sum + curr.Total_Lesson_Sum, 0);
      const totalPossible = logs.reduce((sum, curr) => sum + curr.Overall_Sum, 0);
      return {
        name: mod.id,
        present: totalPresent,
        absent: Math.max(0, totalPossible - totalPresent)
      };
    });
  }, [selectedLearner, attendanceData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop")' }}>
      
      {/* Custom Scrollbar Styling */}
      <style>{`
        .scrollbar-elegant::-webkit-scrollbar { width: 6px; }
        .scrollbar-elegant::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-elegant::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .scrollbar-elegant::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        .dark .scrollbar-elegant::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Learners Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Profile */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learner's Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Student details</p>
              
              <div className="w-48 h-48 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner mb-4">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Learner" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                {selectedLearner || 'Select a Learner'}
              </h3>
            </div>

            {/* Overall Stats Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-2"><Users className="w-5 h-5 text-blue-600" /></div>
                  <p className="text-[10px] text-gray-500 uppercase">Enrollees</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{learners.length}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-2"><Layers className="w-5 h-5 text-emerald-600" /></div>
                  <p className="text-[10px] text-gray-500 uppercase">Cohorts</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{uniqueCohorts}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full mb-2"><BookOpen className="w-5 h-5 text-purple-600" /></div>
                  <p className="text-[10px] text-gray-500 uppercase">Modules</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-full mb-2"><FileText className="w-5 h-5 text-amber-600" /></div>
                  <p className="text-[10px] text-gray-500 uppercase">Lessons</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">45</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Search Card */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learner Search</h3>
                  {selectedLearner && (
                    <button 
                      onClick={() => setSelectedLearner(null)} 
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg flex items-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <FilterX className="w-3 h-3 mr-1" /> RESET FILTER
                    </button>
                  )}
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" placeholder="Search name..." 
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto max-h-[250px] space-y-1 pr-2 scrollbar-elegant">
                  {filteredLearners.slice(0, 50).map(l => (
                    <div 
                      key={l.NAME} 
                      onClick={() => setSelectedLearner(l.NAME)} 
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 
                        ${selectedLearner === l.NAME 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-gray-700 dark:text-gray-200'
                        }`}
                    >
                      <p className="font-bold text-sm">{l.NAME}</p>
                      <p className={`text-[10px] font-medium ${selectedLearner === l.NAME ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {l.COHORT_NO}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANALYTIC MINI-GAUGE CARDS */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {modules.map(mod => {
                  const rate = getModuleRate(mod.id);
                  return (
                    <div key={mod.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mod.id} Completion</p>
                          <h4 className="text-2xl font-black text-gray-900 dark:text-white">{rate}%</h4>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-indigo-500 transition-colors">
                          <Target size={18} />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000 ease-out rounded-full"
                          style={{ width: `${rate}%`, backgroundColor: mod.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedLearner ? `${selectedLearner}'s Practice Trend` : 'Overall Practice Rate (%)'}
                </h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Line type="monotone" dataKey="val" name="Submission %" stroke="#6366f1" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedLearner ? `${selectedLearner}'s Attendance` : 'Overall Attendance Breakdown'}
                </h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar name="Present" dataKey="present" stackId="a" fill="#10b981" />
                      <Bar name="Absent" dataKey="absent" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
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