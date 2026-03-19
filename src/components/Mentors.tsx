import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Star, X, FilterX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BottomNav } from './BottomNav';

interface MentorsProps {
  metrics: OverallMetrics;
  learners: Learner[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Mentors: React.FC<MentorsProps> = ({ metrics, learners, cohortPhotos, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'Excel', 'Power BI', 'Python'];
  const [searchTerm, setSearchTerm] = useState('');

  const mentorList = [
    { 
      name: 'Marianyl Itumay - Orlain', 
      module: 'Data Analytics', 
      image: 'https://drive.google.com/file/d/1cSdF7bbZjgp8FY9YU4bt0jtW3Jlb2POu/view?usp=drive_link' 
    }
  ];

  const filteredMentors = mentorList.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.module.toLowerCase().includes(searchTerm.toLowerCase()));
  const [selectedMentor, setSelectedMentor] = useState<string | null>(mentorList[0].name);

  const currentMentorData = mentorList.find(m => m.name === selectedMentor) || mentorList[0];

  // Helper to get direct image URL from drive link
  const getDriveImageUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/\/d\/(.*?)\//);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
  };

  const mockTrendData = useMemo(() => {
    if (selectedMentor) {
      const seed = selectedMentor.length;
      return [
        { name: 'Week 1', val: 90 + (seed % 5) },
        { name: 'Week 2', val: 92 + (seed % 6) },
        { name: 'Week 3', val: 95 + (seed % 4) },
        { name: 'Week 4', val: 98 + (seed % 2) },
      ];
    }
    return [
      { name: 'Week 1', val: 95 },
      { name: 'Week 2', val: 96 },
      { name: 'Week 3', val: 98 },
      { name: 'Week 4', val: 99 },
    ];
  }, [selectedMentor]);

  const mockAbsenceData = useMemo(() => {
    if (selectedMentor) {
      const seed = selectedMentor.length;
      return [
        { name: 'SQL', val: seed % 3 },
        { name: 'Excel', val: seed % 2 },
        { name: 'PBI', val: (seed % 2) + 1 },
        { name: 'Python', val: seed % 2 },
      ];
    }
    return [
      { name: 'SQL', val: 2 },
      { name: 'Excel', val: 1 },
      { name: 'PBI', val: 0 },
      { name: 'Python', val: 1 },
    ];
  }, [selectedMentor]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mentors Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mentor's Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Mentor details</p>
              
              {selectedMentor && (
                <button 
                  onClick={() => setSelectedMentor(null)}
                  className="absolute top-6 right-6 flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-md transition-colors"
                >
                  <FilterX className="w-3 h-3" />
                  Unfilter
                </button>
              )}

              <div className="w-48 h-48 rounded-full border-4 border-rose-100 dark:border-rose-900/50 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner mb-4 relative">
                <img src={getDriveImageUrl(currentMentorData.image)} alt={currentMentorData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute bottom-2 right-6 bg-rose-500 rounded-full p-2 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{currentMentorData.name}</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{currentMentorData.module} Expert</p>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mentor Search</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search mentor..." 
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 dark:text-white"
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
                  {filteredMentors.map((mentor) => (
                    <div 
                      key={mentor.name}
                      onClick={() => setSelectedMentor(mentor.name)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMentor === mentor.name 
                          ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{mentor.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{mentor.module} Expert</p>
                    </div>
                  ))}
                  {filteredMentors.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No mentors found</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {modules.map(mod => (
                  <div key={mod} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 flex items-center justify-center mb-4 shadow-inner">
                      <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{mod.substring(0, 3)}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{mod} Module</h4>
                    <p className="text-xs text-gray-500 mt-1">Mentor Performance</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Class Practice Submission Trend</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="val" stroke="#e11d48" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Absence Count for Each Module</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAbsenceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
