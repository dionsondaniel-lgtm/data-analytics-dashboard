import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto, TransformedAttendance, TransformedPractice, ViewType } from '../types';
import { 
  Users, BookOpen, Layers, FileText, Search, 
  Image as ImageIcon, Award, X, FilterX, 
  Database, Table, BarChart3, Code2 
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
    { name: 'SQL', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Excel', icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Power BI', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Python', icon: Code2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const filteredAlumni = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedAlumni ? cohortPhotos.find(p => p.NAME === selectedAlumni)?.IMAGE_URL : null;

  // ACTUAL DATA: Practice Submission Trend
  const realPracticeTrend = useMemo(() => {
    return moduleConfig.map(mod => {
      const logs = practiceData.filter(d => 
        d.MODULE.toUpperCase().includes(mod.name.toUpperCase()) && 
        (selectedAlumni ? d.NAME === selectedAlumni : true)
      );
      
      const avgRate = logs.length > 0 
        ? logs.reduce((sum, curr) => sum + curr.Rate_of_Submission, 0) / logs.length 
        : 0;

      return { name: mod.name, val: Math.round(avgRate) };
    });
  }, [selectedAlumni, practiceData]);

  // ACTUAL DATA: Attendance Stacked Bar (Present vs Absent)
  const realAttendanceData = useMemo(() => {
    return moduleConfig.map(mod => {
      const logs = attendanceData.filter(d => 
        d.MODULE.toUpperCase().includes(mod.name.toUpperCase()) && 
        (selectedAlumni ? d.NAME === selectedAlumni : true)
      );

      const totalPresent = logs.reduce((sum, curr) => sum + curr.Total_Lesson_Sum, 0);
      const totalPossible = logs.reduce((sum, curr) => sum + curr.Overall_Sum, 0);
      const totalAbsent = Math.max(0, totalPossible - totalPresent);

      return {
        name: mod.name,
        present: totalPresent,
        absent: totalAbsent
      };
    });
  }, [selectedAlumni, attendanceData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")' }}>
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
              
              {selectedAlumni && (
                <button 
                  onClick={() => setSelectedAlumni(null)}
                  className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FilterX className="w-4 h-4" /> Reset Filter
                </button>
              )}
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
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Directory</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search alumni..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto max-h-[280px] space-y-2 pr-2 custom-scrollbar">
                  {filteredAlumni.map(l => (
                    <div 
                      key={l.NAME} 
                      onClick={() => setSelectedAlumni(l.NAME)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all ${selectedAlumni === l.NAME ? 'bg-amber-500 text-white shadow-lg scale-[0.98]' : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                    >
                      <p className="font-bold text-sm">{l.NAME}</p>
                      <p className={`text-[10px] opacity-70 font-medium`}>{l.COHORT_NO}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Cards with Icons */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {moduleConfig.map(mod => (
                  <div key={mod.name} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 hover:shadow-xl transition-all group cursor-default">
                    <div className={`${mod.bg} ${mod.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <mod.icon size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-lg">{mod.name}</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase">Module</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Class Practice Trend (%)</h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realPracticeTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="val" name="Submission Rate" stroke="#f59e0b" strokeWidth={5} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Attendance Breakdown</h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realAttendanceData} margin={{ top: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar name="Days Present" dataKey="present" stackId="a" fill="#10b981" barSize={35} />
                      <Bar name="Days Absent" dataKey="absent" stackId="a" fill="#f43f5e" barSize={35} radius={[10, 10, 0, 0]} />
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