import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Image as ImageIcon, X, FilterX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BottomNav } from './BottomNav';

interface LearnersProps {
  metrics: OverallMetrics;
  learners: Learner[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Learners: React.FC<LearnersProps> = ({ metrics, learners, cohortPhotos, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'Excel', 'Power BI', 'Python'];
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLearners = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedLearner ? cohortPhotos.find(p => p.NAME === selectedLearner)?.IMAGE_URL : null;

  const mockTrendData = useMemo(() => {
    if (selectedLearner) {
      // Generate pseudo-random data based on learner name length for consistency
      const seed = selectedLearner.length;
      return [
        { name: 'Week 1', val: 70 + (seed * 2 % 30) },
        { name: 'Week 2', val: 75 + (seed * 3 % 25) },
        { name: 'Week 3', val: 80 + (seed * 4 % 20) },
        { name: 'Week 4', val: 85 + (seed * 5 % 15) },
      ];
    }
    return [
      { name: 'Week 1', val: 80 },
      { name: 'Week 2', val: 85 },
      { name: 'Week 3', val: 90 },
      { name: 'Week 4', val: 88 },
    ];
  }, [selectedLearner]);

  const mockAbsenceData = useMemo(() => {
    if (selectedLearner) {
      const seed = selectedLearner.length;
      return [
        { name: 'SQL', val: seed % 4 },
        { name: 'Excel', val: (seed + 1) % 3 },
        { name: 'PBI', val: (seed + 2) % 5 },
        { name: 'Python', val: (seed + 3) % 4 },
      ];
    }
    return [
      { name: 'SQL', val: 12 },
      { name: 'Excel', val: 8 },
      { name: 'PBI', val: 15 },
      { name: 'Python', val: 10 },
    ];
  }, [selectedLearner]);

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
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLearner === l.NAME ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{l.NAME}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{l.COHORT_NO}</p>
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
                  {selectedLearner ? `${selectedLearner}'s Practice Trend` : 'Overall Practice Trend'}
                </h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedLearner ? `${selectedLearner}'s Absences` : 'Overall Absence Count'}
                </h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAbsenceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="val" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
