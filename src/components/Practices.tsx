import React from 'react';
import { OverallMetrics, Learner, TransformedPractice } from '../types';
import { Users, BookOpen, Layers, FileText, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BottomNav } from './BottomNav';

interface PracticesProps {
  metrics: OverallMetrics;
  learners: Learner[];
  practiceData: TransformedPractice[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Practices: React.FC<PracticesProps> = ({ metrics, learners, practiceData, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;

  const mockFrequencyData = [
    { name: 'Excellent', value: 400 },
    { name: 'Good', value: 300 },
    { name: 'Average', value: 300 },
    { name: 'Needs Improvement', value: 200 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Practices Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column */}
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

          {/* Middle & Right Columns */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Average Class Practice Submission Rate</h3>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{(metrics.Overall_Submission_Rate).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <FileText className="w-10 h-10 text-indigo-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Average Home Practice Submission Rate</h3>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{(metrics.Overall_Submission_Rate - 5).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                  <Award className="w-10 h-10 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Path to Success: Individualized Support (Home Practice) & Students Needing Extra Support: Engagement Focus (Class Practice)</h3>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {learners.slice(0, 5).map(l => (
                      <div key={l.NAME} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{l.NAME}</span>
                        <div className="flex space-x-4">
                          <span className="text-sm text-red-500">Class: 45%</span>
                          <span className="text-sm text-amber-500">Home: 50%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequency of Student Ratings (Class Practice)</h3>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockFrequencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockFrequencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
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
