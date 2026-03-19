import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, TransformedAttendance, AllCohortsPhoto } from '../types';
import { Users, BookOpen, Layers, FileText, CheckCircle, Award, ArrowUpRight, ArrowDownRight, Image as ImageIcon, Search, X, FilterX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface AttendanceProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Attendance: React.FC<AttendanceProps> = ({ metrics, learners, attendanceData, cohortPhotos, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const [learnerSearch, setLearnerSearch] = useState('');

  const cohortDistribution = Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean))).map(cohort => ({
    name: `Cohort ${cohort}`,
    students: learners.filter(l => l.COHORT_NO === cohort).length
  }));

  const mockTrendsData = useMemo(() => {
    if (selectedLearner) {
      // Generate pseudo-random data based on learner name to simulate their specific attendance
      const seed = selectedLearner.length;
      return [
        { lesson: 'Lesson 1', duration: 3, attended: (seed % 3) + 1 },
        { lesson: 'Lesson 2', duration: 3, attended: (seed % 2) + 2 },
        { lesson: 'Lesson 3', duration: 3, attended: (seed % 3) + 1 },
        { lesson: 'Mini Project', duration: 5, attended: (seed % 4) + 2 },
        { lesson: 'Lesson 4', duration: 3, attended: (seed % 2) + 1 },
        { lesson: 'BIT Project', duration: 10, attended: (seed % 5) + 5 },
      ];
    }
    return [
      { lesson: 'Lesson 1', duration: 3, attended: 25 },
      { lesson: 'Lesson 2', duration: 3, attended: 24 },
      { lesson: 'Lesson 3', duration: 3, attended: 22 },
      { lesson: 'Mini Project', duration: 5, attended: 20 },
      { lesson: 'Lesson 4', duration: 3, attended: 23 },
      { lesson: 'BIT Project', duration: 10, attended: 18 },
    ];
  }, [selectedLearner]);

  const mockPerformanceData = useMemo(() => {
    if (selectedLearner) {
      const learner = learners.find(l => l.NAME === selectedLearner);
      const cohort = learner?.COHORT_NO || 'Unknown';
      return [
        { cohort: cohort, sql: '100%', xls: '100%', pbi: '95%', python: '90%' }
      ];
    }
    return [
      { cohort: '1ST', sql: '100%', xls: '95%', pbi: '90%', python: '85%' },
      { cohort: '2ND', sql: '98%', xls: '92%', pbi: '88%', python: '80%' },
      { cohort: '3RD', sql: '95%', xls: '90%', pbi: '85%', python: '75%' },
    ];
  }, [selectedLearner, learners]);

  const selectedPhoto = selectedLearner ? cohortPhotos.find(p => p.NAME === selectedLearner)?.IMAGE_URL : null;

  const filteredLearners = learners.filter(l => l.NAME.toLowerCase().includes(learnerSearch.toLowerCase()));

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Attendance Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column (Similar to Home) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completion Rates</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Overall student completion</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Attendance Rates</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{(metrics.Overall_Attendance_Rate).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Class Practice</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{(metrics.Overall_Submission_Rate).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Home Practice</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{(metrics.Overall_Submission_Rate - 5).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{learners.length}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center justify-center text-center">
                <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cohorts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueCohorts}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex flex-col items-center justify-center text-center">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prev. Lesson vs Current</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">92%</span>
                  <span className="flex items-center text-sm text-emerald-500 mb-1"><ArrowUpRight className="w-4 h-4 mr-1"/> 2%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current vs Prev. Lesson</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">94%</span>
                  <span className="flex items-center text-sm text-emerald-500 mb-1"><ArrowUpRight className="w-4 h-4 mr-1"/> 2%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next vs Current (Proj)</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">88%</span>
                  <span className="flex items-center text-sm text-red-500 mb-1"><ArrowDownRight className="w-4 h-4 mr-1"/> 6%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trends in Student Attendance per Lesson</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTrendsData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="lesson" angle={-60} textAnchor="end" height={60} tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="top" />
                    <Bar yAxisId="left" dataKey="attended" name="Attended Days Count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="duration" name="Lesson Duration Days" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Performance by Cohort in Each Module</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">COHORT</th>
                      <th className="px-4 py-3">SQL</th>
                      <th className="px-4 py-3">XLS</th>
                      <th className="px-4 py-3">PBI</th>
                      <th className="px-4 py-3">PYTHON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPerformanceData.map((row, i) => (
                      <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.cohort}</td>
                        <td className="px-4 py-3">{row.sql}</td>
                        <td className="px-4 py-3">{row.xls}</td>
                        <td className="px-4 py-3">{row.pbi}</td>
                        <td className="px-4 py-3">{row.python}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full max-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learner Filter</h3>
                {selectedLearner && (
                  <button 
                    onClick={() => setSelectedLearner(null)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                  >
                    <FilterX className="w-3 h-3 mr-1" /> Unfilter
                  </button>
                )}
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search learner..." 
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={learnerSearch}
                  onChange={(e) => setLearnerSearch(e.target.value)}
                />
                {learnerSearch && (
                  <button 
                    onClick={() => setLearnerSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-elegant">
                {filteredLearners.map(l => (
                  <label key={l.NAME} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    <input 
                      type="radio" 
                      name="learner"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" 
                      onChange={() => setSelectedLearner(l.NAME)}
                      checked={selectedLearner === l.NAME}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{l.NAME}</span>
                  </label>
                ))}
                {filteredLearners.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No learners found.</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Matters</h3>
              <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50 min-h-[200px]">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Learner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Select a learner to view photo</p>
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
