import React, { useState, useMemo } from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto } from '../types';
import { Users, BookOpen, Layers, FileText, Search, Image as ImageIcon, Award, X, FilterX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BottomNav } from './BottomNav';

interface AlumniProps {
  metrics: OverallMetrics;
  learners: Learner[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const Alumni: React.FC<AlumniProps> = ({ metrics, learners, cohortPhotos, onNavigate, currentView }) => {
  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'Excel', 'Power BI', 'Python'];
  const [selectedAlumni, setSelectedAlumni] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Assuming all learners are alumni for this view, or we could filter by completion
  const filteredAlumni = learners.filter(l => l.NAME.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPhoto = selectedAlumni ? cohortPhotos.find(p => p.NAME === selectedAlumni)?.IMAGE_URL : null;

  const mockTrendData = useMemo(() => {
    if (selectedAlumni) {
      const seed = selectedAlumni.length;
      return [
        { name: 'Week 1', val: 80 + (seed % 10) },
        { name: 'Week 2', val: 85 + (seed % 8) },
        { name: 'Week 3', val: 90 + (seed % 5) },
        { name: 'Week 4', val: 95 + (seed % 5) },
      ];
    }
    return [
      { name: 'Week 1', val: 85 },
      { name: 'Week 2', val: 88 },
      { name: 'Week 3', val: 92 },
      { name: 'Week 4', val: 95 },
    ];
  }, [selectedAlumni]);

  const mockAbsenceData = useMemo(() => {
    if (selectedAlumni) {
      const seed = selectedAlumni.length;
      return [
        { name: 'SQL', val: seed % 3 },
        { name: 'Excel', val: seed % 2 },
        { name: 'PBI', val: (seed % 4) + 1 },
        { name: 'Python', val: seed % 2 },
      ];
    }
    return [
      { name: 'SQL', val: 5 },
      { name: 'Excel', val: 2 },
      { name: 'PBI', val: 4 },
      { name: 'Python', val: 3 },
    ];
  }, [selectedAlumni]);

  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 min-h-[80vh] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Alumni Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center relative">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alumni's Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Student details</p>
              
              <div className="w-48 h-48 rounded-full border-4 border-amber-100 dark:border-amber-900/50 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner mb-4 relative">
                {selectedPhoto ? (
                  <img src={selectedPhoto} alt="Alumni" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                )}
                <div className="absolute bottom-2 right-6 bg-amber-500 rounded-full p-2 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{selectedAlumni || 'Select an Alumni'}</h3>
              
              {selectedAlumni && (
                <button 
                  onClick={() => setSelectedAlumni(null)}
                  className="absolute top-6 right-6 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alumni Search</h3>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 dark:text-white"
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
                  {filteredAlumni.slice(0, 50).map(l => (
                    <div 
                      key={l.NAME} 
                      onClick={() => setSelectedAlumni(l.NAME)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedAlumni === l.NAME ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{l.NAME}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{l.COHORT_NO}</p>
                    </div>
                  ))}
                  {filteredAlumni.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No alumni found.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {modules.map(mod => (
                  <div key={mod} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center mb-4 shadow-inner">
                      <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{mod.substring(0, 3)}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{mod} Module</h4>
                    <p className="text-xs text-gray-500 mt-1">Alumni Performance</p>
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
                      <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={3} />
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
                      <Bar dataKey="val" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
