// src/components/DashboardLayout.tsx

import React, { ReactNode, useEffect, useState } from 'react';
import { SidebarTree } from './SidebarTree';
import { ViewType } from '../types';
import { ChevronLeft, ChevronRight, Filter, Layers, BookOpen, X, Sparkles, LogOut, Award, Gamepad2, Fingerprint } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveBadgesArena } from './LiveBadgesArena';
import { GameNight } from './GameNight';
import { AttendanceLog } from './AttendanceLog';

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: ViewType;
  selectedCohort: string | null;
  selectedModule: string | null;
  onSelectView: (view: ViewType) => void;
  onSelectCohort: (cohort: string | null) => void;
  onSelectModule: (module: string | null) => void;
  availableCohorts?: string[];
  headerActions?: ReactNode;
  subHeader?: ReactNode;
  onToggleAIAgent?: () => void;
  isAIAgentOpen?: boolean;
  onLogout?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  selectedCohort,
  selectedModule,
  onSelectView,
  onSelectCohort,
  onSelectModule,
  availableCohorts = ['1', '2', '3', '4', '5'],
  headerActions,
  subHeader,
  onToggleAIAgent,
  isAIAgentOpen,
  onLogout
}) => {
  const [bgImage, setBgImage] = useState('https://t4.ftcdn.net/jpg/07/49/21/07/360_F_749210788_1LKxjjOHZPsJZwDOclb8D0Y5UsT20blt.jpg');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // MODAL STATES
  const [showLiveBadges, setShowLiveBadges] = useState(false);
  const [showGameNight, setShowGameNight] = useState(false);
  const [showAttendanceLog, setShowAttendanceLog] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateBg = () => {
      setBgImage(localStorage.getItem('app_bg') || 'https://t4.ftcdn.net/jpg/07/49/21/07/360_F_749210788_1LKxjjOHZPsJZwDOclb8D0Y5UsT20blt.jpg');
    };
    
    updateBg();
    window.addEventListener('settings_updated', updateBg);
    window.addEventListener('storage', updateBg);
    
    return () => {
      window.removeEventListener('settings_updated', updateBg);
      window.removeEventListener('storage', updateBg);
    };
  }, []);

  return (
    <div 
      className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200 relative"
      style={bgImage ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {bgImage && (
        <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/90 pointer-events-none z-0 transition-colors duration-200"></div>
      )}
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={clsx(
          "fixed top-[61px] -translate-y-1/2 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white transition-all duration-300",
          isSidebarOpen ? "left-64 -translate-x-1/2" : "left-0 translate-x-1/2"
        )}
      >
        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className="z-10 flex h-full w-full relative">
        <div className={clsx(
          "fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 h-full",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-0 md:overflow-hidden"
        )}>
          <SidebarTree 
            currentView={currentView}
            selectedCohort={selectedCohort}
            selectedModule={selectedModule}
            onSelectView={onSelectView}
            onSelectCohort={onSelectCohort}
            onSelectModule={onSelectModule}
            availableCohorts={availableCohorts}
            onMobileClose={() => {
              if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
              }
            }}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors z-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white ml-2 md:ml-0">
                {currentView} {selectedCohort ? `- Cohort ${selectedCohort}` : ''} {selectedModule ? `- ${selectedModule}` : ''}
              </h1>
            </div>
            
            {/* --- HEADER ACTIONS & LOGOUT --- */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {headerActions}
              
              <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-3 sm:pl-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Live Data Sync</span>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 ml-1 text-gray-400 hover:text-rose-600 dark:text-gray-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all duration-300 flex items-center justify-center group"
                  title="Secure Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </header>
          {subHeader}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-elegant z-10 relative">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>

            {/* --- FLOATING UFO 1: LIVE BADGES ARENA --- */}
            <motion.div
              className="fixed bottom-[80px] right-[80px] z-[45]"
              animate={{
                x: [0, -180, -60, -250, 0],
                y: [0, -250, -150, -350, 0],
                rotate: [0, 5, -5, 3, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLiveBadges(true)}
                className="relative group flex items-center gap-2 px-4 md:px-6 py-2 bg-slate-900 border border-slate-700 hover:border-pink-500/50 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(244,114,182,0.1)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Award className="w-4 h-4 md:w-5 md:h-5 text-pink-400 group-hover:text-purple-300 transition-colors z-10" />
                <span className="text-[10px] md:text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors z-10 whitespace-nowrap">
                  Live Badges Arena
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500 animate-pulse" />
              </motion.button>
            </motion.div>

            {/* --- FLOATING UFO 2: GAME NIGHT --- */}
            <motion.div
              className="fixed bottom-[80px] right-[80px] z-[45]"
              animate={{
                x: [0, -280, -150, -400, 0],
                y: [0, -100, -300, -200, 0],
                rotate: [0, -4, 4, -3, 0]
              }}
              transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGameNight(true)}
                className="relative group flex items-center gap-2 px-4 md:px-6 py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 group-hover:text-cyan-300 transition-colors z-10" />
                <span className="text-[10px] md:text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors z-10 whitespace-nowrap">
                  GAME NIGHT
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500 animate-pulse" />
              </motion.button>
            </motion.div>

            {/* --- FLOATING UFO 3: ATTENDANCE LOG --- */}
            <motion.div
              className="fixed bottom-[80px] right-[80px] z-[45]"
              animate={{
                x: [0, -80, -350, -180, 0],
                y: [0, -300, -100, -250, 0],
                rotate: [0, 6, -2, 4, 0]
              }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAttendanceLog(true)}
                className="relative group flex items-center gap-2 px-4 md:px-6 py-2 bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Fingerprint className="w-4 h-4 md:w-5 md:h-5 text-amber-400 group-hover:text-orange-300 transition-colors z-10" />
                <span className="text-[10px] md:text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors z-10 whitespace-nowrap">
                  Attendance Log
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500 animate-pulse" />
              </motion.button>
            </motion.div>

            {/* Floating Global Buttons */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
              
              {/* --- AI AGENT BUTTON --- */}
              <button
                onClick={() => onToggleAIAgent?.()}
                className={clsx(
                  "p-3 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group",
                  isAIAgentOpen 
                    ? "bg-slate-800 text-white scale-110 ring-4 ring-indigo-500/50" 
                    : "bg-slate-900 text-white hover:scale-110 hover:shadow-indigo-500/50"
                )}
                title="Open AI Agents"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow" style={{ margin: '-50%' }} />
                <div className="absolute inset-[2px] bg-slate-900 rounded-full z-0" />
                <Sparkles className="w-6 h-6 z-10 text-indigo-400 group-hover:text-white transition-colors" />
              </button>

              {/* Existing Filters UI */}
              {isFiltersOpen && (
                <div className="mb-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-64 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-indigo-500" />
                      Global Filters
                    </h3>
                    <button 
                      onClick={() => setIsFiltersOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-2 max-h-80 overflow-y-auto scrollbar-elegant">
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center uppercase tracking-wider">
                        <Layers className="w-3 h-3 mr-2" />
                        By Cohort
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => onSelectCohort(null)}
                          className={clsx(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                            selectedCohort === null 
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          )}
                        >
                          All Cohorts
                        </button>
                        {availableCohorts.map(cohort => (
                          <button
                            key={cohort}
                            onClick={() => onSelectCohort(cohort)}
                            className={clsx(
                              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                              selectedCohort === cohort 
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium" 
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            )}
                          >
                            Cohort {cohort}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center uppercase tracking-wider">
                        <BookOpen className="w-3 h-3 mr-2" />
                        By Module
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => onSelectModule(null)}
                          className={clsx(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                            selectedModule === null 
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          )}
                        >
                          All Modules
                        </button>
                        {['SQL', 'Excel', 'Power BI', 'Python'].map(module => (
                          <button
                            key={module}
                            onClick={() => onSelectModule(module)}
                            className={clsx(
                              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                              selectedModule === module 
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium" 
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            )}
                          >
                            {module}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={clsx(
                  "p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
                  isFiltersOpen 
                    ? "bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105"
                )}
                title="Global Filters"
              >
                <Filter className="w-6 h-6" />
                {(selectedCohort || selectedModule) && !isFiltersOpen && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                )}
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* --- MODALS DEPLOYMENT ZONE --- */}
      <AnimatePresence>
        {showLiveBadges && (
          <div className="fixed inset-0 z-[9999]">
            <LiveBadgesArena onClose={() => setShowLiveBadges(false)} />
          </div>
        )}
        
        {showGameNight && (
          <div className="fixed inset-0 z-[9999]">
            <GameNight onClose={() => setShowGameNight(false)} />
          </div>
        )}

        {showAttendanceLog && (
          <div className="fixed inset-0 z-[9999]">
            <AttendanceLog onClose={() => setShowAttendanceLog(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};