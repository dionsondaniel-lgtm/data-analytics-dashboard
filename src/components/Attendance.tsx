import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, TransformedAttendance, AllCohortsPhoto, ViewType } from '../types';
import { 
  Users, BookOpen, Layers, FileText, CheckCircle, Award, 
  ArrowUpRight, ArrowDownRight, Image as ImageIcon, Search, 
  X, FilterX 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, ComposedChart, Legend 
} from 'recharts';
import { BottomNav } from './BottomNav';

interface AttendanceProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Attendance: React.FC<AttendanceProps> = ({ 
  metrics, 
  learners, 
  attendanceData, 
  cohortPhotos, 
  onNavigate, 
  currentView 
}) => {
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const [learnerSearch, setLearnerSearch] = useState('');

  const modules = ['SQL', 'EXCEL', 'PBI', 'PYTHON'];
  const uniqueCohortsCount = useMemo(() => 
    new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size
  , [learners]);

  // --- ACTUAL DATA: Attendance Trends (Chart) ---
  const realTrendsData = useMemo(() => {
    return modules.map(m => {
      const data = attendanceData.filter(d => 
        d.MODULE.toUpperCase().includes(m) && 
        (selectedLearner ? d.NAME === selectedLearner : true)
      );
      
      const totalPresent = data.reduce((acc, curr) => acc + curr.Total_Lesson_Sum, 0);
      const totalPossible = data.reduce((acc, curr) => acc + curr.Overall_Sum, 0);
      const avgRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

      return {
        module: m,
        rate: Math.round(avgRate),
        present: totalPresent,
        total: totalPossible
      };
    });
  }, [selectedLearner, attendanceData]);

  // --- ACTUAL DATA: Performance by Cohort (Table) ---
  const performanceTable = useMemo(() => {
    const cohorts = Array.from(new Set(attendanceData.map(d => d.COHORT_NO))).sort();
    
    return cohorts.map(c => {
      const row: any = { cohort: `Cohort ${c}` };
      modules.forEach(m => {
        const data = attendanceData.filter(d => d.COHORT_NO === c && d.MODULE.toUpperCase().includes(m));
        const avg = data.length > 0 
          ? data.reduce((sum, curr) => sum + curr.Attendance_Rate, 0) / data.length 
          : 0;
        row[m.toLowerCase()] = `${Math.round(avg)}%`;
      });
      return row;
    });
  }, [attendanceData]);

  // --- ACTUAL DATA: Comparison Stats (SQL -> Excel -> PBI -> Python) ---
  const statComparisons = useMemo(() => {
    const getModAvg = (mod: string) => {
      const d = attendanceData.filter(d => d.MODULE.toUpperCase().includes(mod));
      return d.length > 0 ? d.reduce((a, b) => a + b.Attendance_Rate, 0) / d.length : 0;
    };

    const sql = getModAvg('SQL');
    const excel = getModAvg('EXCEL');
    const pbi = getModAvg('PBI');
    const python = getModAvg('PYTHON');

    return {
      sqlVsExcel: { val: Math.round(excel), diff: (excel - sql).toFixed(1) },
      excelVsPbi: { val: Math.round(pbi), diff: (pbi - excel).toFixed(1) },
      pbiVsPython: { val: Math.round(python), diff: (python - pbi).toFixed(1) },
    };
  }, [attendanceData]);

  const selectedPhoto = selectedLearner ? cohortPhotos.find(p => p.NAME === selectedLearner)?.IMAGE_URL : null;
  const filteredLearners = learners.filter(l => l.NAME.toLowerCase().includes(learnerSearch.toLowerCase()));

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Attendance Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Completion Rates Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Completion Rates</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Aggregate Metrics</p>
              
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-emerald-400">Attendance</span>
                  </div>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300">{metrics.Overall_Attendance_Rate.toFixed(1)}%</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center justify-between border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-blue-400">Submission</span>
                  </div>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-300">{metrics.Overall_Submission_Rate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* THE 4 SMALL INTERACTIVE CARDS (Preserved & Real Data) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-blue-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-blue-600">
                  <Users size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Enrollees</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{learners.length}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-emerald-600">
                  <Layers size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Cohorts</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{uniqueCohortsCount}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-purple-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-purple-600">
                  <BookOpen size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Modules</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">4</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-amber-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-amber-600">
                  <FileText size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Lessons</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">45</p>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">SQL vs EXCEL</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{statComparisons.sqlVsExcel.val}%</span>
                  <span className={`flex items-center text-xs font-bold mb-1 ${Number(statComparisons.sqlVsExcel.diff) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Number(statComparisons.sqlVsExcel.diff) >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>}
                    {Math.abs(Number(statComparisons.sqlVsExcel.diff))}%
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">EXCEL vs PBI</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{statComparisons.excelVsPbi.val}%</span>
                  <span className={`flex items-center text-xs font-bold mb-1 ${Number(statComparisons.excelVsPbi.diff) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Number(statComparisons.excelVsPbi.diff) >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>}
                    {Math.abs(Number(statComparisons.excelVsPbi.diff))}%
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">PBI vs PYTHON</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{statComparisons.pbiVsPython.val}%</span>
                  <span className={`flex items-center text-xs font-bold mb-1 ${Number(statComparisons.pbiVsPython.diff) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Number(statComparisons.pbiVsPython.diff) >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>}
                    {Math.abs(Number(statComparisons.pbiVsPython.diff))}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                {selectedLearner ? `${selectedLearner}'s Attendance` : 'Global Attendance Trends'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={realTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="module" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Bar dataKey="rate" name="Rate (%)" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                    <Line type="monotone" dataKey="present" name="Present Count" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Cohort Performance Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-4 font-black">COHORT</th>
                      <th className="px-4 py-4 font-black">SQL</th>
                      <th className="px-4 py-4 font-black">EXCEL</th>
                      <th className="px-4 py-4 font-black">PBI</th>
                      <th className="px-4 py-4 font-black">PYTHON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {performanceTable.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">{row.cohort}</td>
                        <td className="px-4 py-4 font-medium text-gray-600 dark:text-gray-400">{row.sql}</td>
                        <td className="px-4 py-4 font-medium text-gray-600 dark:text-gray-400">{row.excel}</td>
                        <td className="px-4 py-4 font-medium text-gray-600 dark:text-gray-400">{row.pbi}</td>
                        <td className="px-4 py-4 font-medium text-gray-600 dark:text-gray-400">{row.python}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Student Search</h3>
                {selectedLearner && (
                  <button onClick={() => setSelectedLearner(null)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                    RESET
                  </button>
                )}
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={learnerSearch}
                  onChange={(e) => setLearnerSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredLearners.map(l => (
                  <button 
                    key={l.NAME}
                    onClick={() => setSelectedLearner(l.NAME)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedLearner === l.NAME ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  >
                    {l.NAME}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex-1 flex flex-col items-center">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight w-full">Student Profile</h3>
              <div className="w-full h-full border-4 border-indigo-50 dark:border-indigo-900/20 rounded-[2rem] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50 relative shadow-inner">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Learner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                      {selectedLearner ? 'No Photo found' : 'Select a student'}
                    </p>
                  </div>
                )}
                {selectedLearner && (
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/90 backdrop-blur-sm p-4 text-center">
                    <p className="font-black text-white text-sm uppercase truncate px-2">{selectedLearner}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};