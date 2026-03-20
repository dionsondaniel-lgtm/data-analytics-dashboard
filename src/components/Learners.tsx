import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto, TransformedAttendance, TransformedPractice, ViewType } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Image as ImageIcon, X, FilterX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface LearnersProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[]; // Added to use real sheet data
  practiceData: TransformedPractice[];     // Added to use real sheet data
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
  const modules = ['SQL', 'Excel', 'PBI', 'Python'];
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLearners = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedLearner ? cohortPhotos.find(p => p.NAME === selectedLearner)?.IMAGE_URL : null;

  // REAL DATA: Practice Trend (Line Chart)
  const realTrendData = useMemo(() => {
    return modules.map(mod => {
      const logs = practiceData.filter(d => 
        d.MODULE.toUpperCase().includes(mod.toUpperCase()) && 
        (selectedLearner ? d.NAME === selectedLearner : true)
      );
      
      const avgRate = logs.length > 0 
        ? logs.reduce((sum, curr) => sum + curr.Rate_of_Submission, 0) / logs.length 
        : 0;

      return { name: mod, val: Math.round(avgRate) };
    });
  }, [selectedLearner, practiceData]);

  // REAL DATA: Attendance Stacked Bar (Present vs Absent)
  const realAttendanceData = useMemo(() => {
    return modules.map(mod => {
      const logs = attendanceData.filter(d => 
        d.MODULE.toUpperCase().includes(mod.toUpperCase()) && 
        (selectedLearner ? d.NAME === selectedLearner : true)
      );

      const totalPresent = logs.reduce((sum, curr) => sum + curr.Total_Lesson_Sum, 0);
      const totalPossible = logs.reduce((sum, curr) => sum + curr.Overall_Sum, 0);
      const totalAbsent = Math.max(0, totalPossible - totalPresent);

      return {
        name: mod,
        present: totalPresent,
        absent: totalAbsent
      };
    });
  }, [selectedLearner, attendanceData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Learners Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column */}
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{selectedLearner || 'Select a Learner'}</h3>
              
              {selectedLearner && (
                <button 
                  onClick={() => setSelectedLearner(null)}
                  className="absolute top-6 right-6 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                >
                  <FilterX className="w-3 h-3 mr-1" /> Unfilter
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Enrollees</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{learners.length}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-2">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Cohorts</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{uniqueCohorts}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Modules</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-full mb-2">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Lessons</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">45</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learner Search</h3>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 scrollbar-elegant">
                  {filteredLearners.slice(0, 50).map(l => (
                    <div 
                      key={l.NAME} 
                      onClick={() => setSelectedLearner(l.NAME)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLearner === l.NAME ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white'}`}
                    >
                      <p className="font-medium text-sm">{l.NAME}</p>
                      <p className={`text-xs ${selectedLearner === l.NAME ? 'text-indigo-100' : 'text-gray-500'}`}>{l.COHORT_NO}</p>
                    </div>
                  ))}
                  {filteredLearners.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No learners found.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {modules.map(mod => (
                  <div key={mod} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4 shadow-inner">
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{mod.substring(0, 3)}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{mod} Module</h4>
                    <p className="text-xs text-gray-500 mt-1">View Details</p>
                  </div>
                ))}
              </div>
            </div>

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
                      <Tooltip />
                      <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* UPDATED ATTENDANCE CHART CARD */}
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
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar 
                        name="Days Present" 
                        dataKey="present" 
                        stackId="a" 
                        fill="#10b981" 
                        radius={[0, 0, 0, 0]} 
                      />
                      <Bar 
                        name="Days Absent" 
                        dataKey="absent" 
                        stackId="a" 
                        fill="#f43f5e" 
                        radius={[6, 6, 0, 0]} 
                      />
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