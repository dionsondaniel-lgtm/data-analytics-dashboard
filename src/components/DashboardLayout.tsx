import React, { ReactNode, useEffect, useState } from 'react';
import { SidebarTree } from './SidebarTree';
import { ViewType } from '../types';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  headerActions
}) => {
  const [bgImage, setBgImage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

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
      setBgImage(localStorage.getItem('app_bg') || '');
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
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
