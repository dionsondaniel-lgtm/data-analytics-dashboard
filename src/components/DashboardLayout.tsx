import React, { ReactNode, useEffect, useState } from 'react';
import { SidebarTree } from './SidebarTree';
import { ViewType } from '../types';
import { Menu, X, ChevronLeft, ChevronRight, Filter, Layers, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

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
  subHeader
}) => {
  const [bgImage, setBgImage] = useState('https://t4.ftcdn.net/jpg/07/49/21/07/360_F_749210788_1LKxjjOHZPsJZwDOclb8D0Y5UsT20blt.jpg');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Listen for storage changes to update background immediately
  useEffect(() => {
    const updateBg = () => {
      setBgImage(localStorage.getItem('app_bg') || 'https://t4.ftcdn.net/jpg/07/49/21/07/360_F_749210788_1LKxjjOHZPsJZwDOclb8D0Y5UsT20blt.jpg');
    };
    
    updateBg();
    
    // Custom event listener for when settings are saved within the app
    window.addEventListener('settings_updated', updateBg);
    // Standard storage listener for cross-tab updates
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
      {/* Background overlay for readability */}
      {bgImage && (
        <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/90 pointer-events-none z-0 transition-colors duration-200"></div>
      )}
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Boundary Toggle Button */}
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
            <div className="flex items-center space-x-4">
              {headerActions}
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Live Data Sync</span>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </header>
          {subHeader}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-elegant z-10 relative">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>

            {/* Floating Global Filters */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
              {isFiltersOpen && (
                <div className="mb-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-64 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
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
                    {/* Cohort Filters */}
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

                    {/* Module Filters */}
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
    </div>
  );
};
