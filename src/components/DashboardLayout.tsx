import React, { ReactNode, useEffect, useState } from 'react';
import { SidebarTree } from './SidebarTree';
import { ViewType } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: ViewType;
  selectedCohort: string | null;
  selectedModule: string | null;
  onSelectView: (view: ViewType) => void;
  onSelectCohort: (cohort: string | null) => void;
  onSelectModule: (module: string | null) => void;
  availableCohorts?: string[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  selectedCohort,
  selectedModule,
  onSelectView,
  onSelectCohort,
  onSelectModule,
  availableCohorts = ['1', '2', '3', '4', '5']
}) => {
  const [bgImage, setBgImage] = useState('');

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
      
      <div className="z-10 flex h-full w-full relative">
        <SidebarTree 
          currentView={currentView}
          selectedCohort={selectedCohort}
          selectedModule={selectedModule}
          onSelectView={onSelectView}
          onSelectCohort={onSelectCohort}
          onSelectModule={onSelectModule}
          availableCohorts={availableCohorts}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {currentView} {selectedCohort ? `- Cohort ${selectedCohort}` : ''} {selectedModule ? `- ${selectedModule}` : ''}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Live Data Sync</span>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
