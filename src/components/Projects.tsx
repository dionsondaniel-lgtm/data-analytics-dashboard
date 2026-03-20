import React, { useMemo } from 'react';
import { OverallMetrics, Learner, TransformedProject, AlumniProject, ViewType } from '../types';
import { Users, BookOpen, Layers, FileText, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { ImageGrid } from './ImageGrid';
import { BottomNav } from './BottomNav';

interface ProjectsProps {
  metrics: OverallMetrics;
  learners: Learner[];
  projectData: TransformedProject[];
  alumniProjects: AlumniProject[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Projects: React.FC<ProjectsProps> = ({ metrics, learners, projectData, alumniProjects, onNavigate, currentView }) => {
  
  // REAL DATA CALCULATIONS
  const uniqueCohortsCount = useMemo(() => 
    new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size
  , [learners]);

  const cohortAverageScores = useMemo(() => {
    const cohortGroups: Record<string, { total: number; count: number }> = {};
    projectData.forEach(p => {
      if (!cohortGroups[p.COHORT_NO]) cohortGroups[p.COHORT_NO] = { total: 0, count: 0 };
      if (p.GPA > 0) {
        cohortGroups[p.COHORT_NO].total += p.GPA;
        cohortGroups[p.COHORT_NO].count += 1;
      }
    });
    return Object.keys(cohortGroups).map(cohort => ({
      cohort: `Cohort ${cohort}`,
      score: cohortGroups[cohort].count > 0 ? Math.round((cohortGroups[cohort].total / cohortGroups[cohort].count) * 100) : 0
    })).sort((a, b) => a.cohort.localeCompare(b.cohort));
  }, [projectData]);

  const topPerformers = useMemo(() => {
    const studentScores: Record<string, { total: number; count: number }> = {};
    projectData.forEach(p => {
      if (!studentScores[p.NAME]) studentScores[p.NAME] = { total: 0, count: 0 };
      if (p.GPA > 0) {
        studentScores[p.NAME].total += p.GPA;
        studentScores[p.NAME].count += 1;
      }
    });
    return Object.keys(studentScores)
      .map(name => ({ name, score: studentScores[name].count > 0 ? (studentScores[name].total / studentScores[name].count) * 100 : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [projectData]);

  const modulePerformance = useMemo(() => {
    const modules = ['SQL', 'Excel', 'PBI', 'Python'];
    const cohorts = Array.from(new Set(projectData.map(p => p.COHORT_NO))).sort();
    return modules.map(mod => {
      const entry: any = { name: mod };
      cohorts.forEach(cohort => {
        const matches = projectData.filter(p => p.MODULE === mod && p.COHORT_NO === cohort && p.GPA > 0);
        const avg = matches.length > 0 ? matches.reduce((sum, curr) => sum + curr.GPA, 0) / matches.length : 0;
        entry[`Cohort ${cohort}`] = Math.round(avg * 100);
      });
      return entry;
    });
  }, [projectData]);

  // BIT Project Specific Scores
  const bitProjectScores = useMemo(() => {
    const cohorts = Array.from(new Set(projectData.map(p => p.COHORT_NO))).sort();
    return cohorts.map(cohort => {
      const matches = projectData.filter(p => p.MODULE === 'BIT' && p.COHORT_NO === cohort && p.GPA > 0);
      const avg = matches.length > 0 ? matches.reduce((sum, curr) => sum + curr.GPA, 0) / matches.length : 0;
      return { cohort: `Cohort ${cohort}`, score: Math.round(avg * 100) };
    });
  }, [projectData]);

  const cohortKeys = useMemo(() => 
    Array.from(new Set(projectData.map(p => `Cohort ${p.COHORT_NO}`))).sort()
  , [projectData]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 min-h-[85vh] flex flex-col transition-all">
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Projects Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Completion Rates Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Completion Rates</h2>
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

            {/* THE 4 SMALL INTERACTIVE CARDS (RETAINED) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-blue-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-blue-600">
                  <Users size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Enrollees</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{learners.length}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-emerald-600">
                  <Layers size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Cohorts</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{uniqueCohortsCount}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-purple-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-purple-600">
                  <BookOpen size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Modules</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">4</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform group">
                <div className="p-3 bg-amber-500 rounded-2xl text-white mb-3 shadow-md group-hover:bg-amber-600">
                  <FileText size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Lessons</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">45</p>
              </div>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Avg. Score per Cohort</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortAverageScores}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="cohort" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[12, 12, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Top Performers</h3>
                <div className="space-y-3">
                  {topPerformers.map((student, i) => (
                    <div key={student.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-500'}`}>
                          {i + 1}
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">{student.name}</span>
                      </div>
                      <span className="font-black text-emerald-500">{student.score.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Module Performance Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Performance by Module</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '20px'}} />
                      <Legend verticalAlign="top" iconType="circle" />
                      {cohortKeys.map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 4]} strokeWidth={4} dot={{r: 6}} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BIT Project Scores Chart (ADDED & STYLED) */}
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Average BIT Project Scores</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bitProjectScores} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} />
                      <YAxis dataKey="cohort" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={30}>
                        {bitProjectScores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ec4899' : '#be185d'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Alumni Projects Showcase */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Alumni Projects Showcase</h3>
                <div className="h-1 flex-1 bg-gray-100 dark:bg-gray-700 mx-8 rounded-full" />
              </div>
              <ImageGrid alumniProjects={alumniProjects} horizontal={true} />
            </div>

          </div>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};