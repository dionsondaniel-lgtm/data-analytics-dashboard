import React from 'react';
import { OverallMetrics, Learner, TransformedAttendance, TransformedPractice, TransformedProject } from '../types';
import { Users, BookOpen, Layers, FileText, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BottomNav } from './BottomNav';

interface HomeProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  projectData: TransformedProject[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Home: React.FC<HomeProps> = ({ metrics, learners, attendanceData, practiceData, projectData, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'Excel', 'Power BI', 'Python'];
  const lessonsCount = { SQL: 10, Excel: 12, 'Power BI': 8, Python: 15 }; // Mock data for lessons

  const cohortDistribution = Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean))).map(cohort => ({
    name: `Cohort ${cohort}`,
    students: learners.filter(l => l.COHORT_NO === cohort).length
  }));

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Home Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Top Row: Overall Module Engagement & Module Engagement Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Module Engagement</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{name: 'SQL', val: 85}, {name: 'Excel', val: 90}, {name: 'PBI', val: 78}, {name: 'Python', val: 88}]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Engagement Rates Across Cohorts</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: 4 Small Cards & Total Meetings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{learners.length}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer">
                  <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cohorts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueCohorts}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lessons</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center">
                <h3 className="text-lg font-medium opacity-90">Total Meetings Across Cohorts</h3>
                <p className="text-4xl font-bold mt-2 mb-4">128</p>
                <div className="h-px bg-white/20 w-full my-2"></div>
                <h3 className="text-lg font-medium opacity-90">Data Analytics Program Batches</h3>
                <p className="text-2xl font-bold mt-1">{uniqueCohorts} Active</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Completions Rates */}
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

            {/* Filters / Modules */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Filters</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {modules.map(mod => (
                  <div key={mod} className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-2 text-indigo-600 font-bold text-xs">
                      {mod.substring(0, 3)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mod}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cohort Distribution</h3>
              <div className="space-y-3">
                {cohortDistribution.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{c.name}</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.students / learners.length) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.students}</span>
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
