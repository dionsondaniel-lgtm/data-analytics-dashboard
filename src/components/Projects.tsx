import React from 'react';
import { OverallMetrics, Learner, TransformedProject, AlumniProject } from '../types';
import { Users, BookOpen, Layers, FileText, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ImageGrid } from './ImageGrid';
import { BottomNav } from './BottomNav';

interface ProjectsProps {
  metrics: OverallMetrics;
  learners: Learner[];
  projectData: TransformedProject[];
  alumniProjects: AlumniProject[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Projects: React.FC<ProjectsProps> = ({ metrics, learners, projectData, alumniProjects, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;

  const mockScoreData = [
    { cohort: '1ST', score: 95 },
    { cohort: '2ND', score: 92 },
    { cohort: '3RD', score: 88 },
  ];

  const mockPerformanceData = [
    { name: 'SQL', '1ST': 95, '2ND': 90, '3RD': 85 },
    { name: 'Excel', '1ST': 92, '2ND': 88, '3RD': 82 },
    { name: 'PBI', '1ST': 90, '2ND': 85, '3RD': 80 },
    { name: 'Python', '1ST': 88, '2ND': 82, '3RD': 78 },
  ];

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Projects Dashboard</h1>
        
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Average Score per Cohorts</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockScoreData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="cohort" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Students</h3>
                <div className="space-y-3">
                  {learners.slice(0, 5).map((l, i) => (
                    <div key={l.NAME} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">#{i + 1}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{l.NAME}</span>
                      </div>
                      <span className="font-bold text-emerald-500">{(95 - i).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Performance Analysis by Cohort</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="1ST" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="2ND" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="3RD" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average BIT Project Scores per Cohort</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockScoreData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="cohort" type="category" />
                      <Tooltip />
                      <Bar dataKey="score" fill="#ec4899" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alumni Projects Showcase</h3>
              <ImageGrid alumniProjects={alumniProjects} horizontal={true} />
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};
