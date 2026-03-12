import React, { useState } from 'react';
import { ChevronRight, ChevronDown, LayoutDashboard, Users, BookOpen, CheckSquare, Home, Award, Image as ImageIcon, FileText, Settings, HelpCircle, Briefcase } from 'lucide-react';
import { ViewType } from '../types';
import { clsx } from 'clsx';

interface SidebarTreeProps {
  currentView: ViewType;
  selectedCohort: string | null;
  selectedModule: string | null;
  onSelectView: (view: ViewType) => void;
  onSelectCohort: (cohort: string | null) => void;
  onSelectModule: (module: string | null) => void;
  availableCohorts?: string[];
}

const modules = ['SQL', 'Excel', 'PBI', 'Python'];

export const SidebarTree: React.FC<SidebarTreeProps> = ({
  currentView,
  selectedCohort,
  selectedModule,
  onSelectView,
  onSelectCohort,
  onSelectModule,
  availableCohorts = ['1', '2', '3', '4', '5']
}) => {
  const [expandedCohorts, setExpandedCohorts] = useState<boolean>(true);
  const [expandedModules, setExpandedModules] = useState<boolean>(true);

  const NavItem = ({ icon: Icon, label, active, onClick, indent = false }: any) => (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
        active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
        indent ? "pl-8" : ""
      )}
    >
      <Icon className={clsx("mr-3 h-5 w-5", active ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
      {label}
    </button>
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto flex flex-col transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Data Dashboard
        </h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavItem 
          icon={LayoutDashboard} 
          label="App Overview" 
          active={currentView === 'Overview'} 
          onClick={() => { onSelectView('Overview'); onSelectCohort(null); onSelectModule(null); }} 
        />
        
        <div className="pt-4 pb-2">
          <button 
            onClick={() => setExpandedCohorts(!expandedCohorts)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            <span className="flex items-center">
              <Users className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              By Cohort
            </span>
            {expandedCohorts ? <ChevronDown className="h-4 w-4 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 dark:text-gray-400" />}
          </button>
          {expandedCohorts && availableCohorts.map(cohort => (
            <button
              key={cohort}
              onClick={() => onSelectCohort(cohort)}
              className={clsx(
                "w-full flex items-center pl-12 pr-4 py-2 text-sm font-medium rounded-md transition-colors",
                selectedCohort === cohort ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              Cohort {cohort}
            </button>
          ))}
        </div>

        <div className="pt-2 pb-2">
          <button 
            onClick={() => setExpandedModules(!expandedModules)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            <span className="flex items-center">
              <BookOpen className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              By Module
            </span>
            {expandedModules ? <ChevronDown className="h-4 w-4 dark:text-gray-400" /> : <ChevronRight className="h-4 w-4 dark:text-gray-400" />}
          </button>
          {expandedModules && modules.map(mod => (
            <button
              key={mod}
              onClick={() => onSelectModule(mod)}
              className={clsx(
                "w-full flex items-center pl-12 pr-4 py-2 text-sm font-medium rounded-md transition-colors",
                selectedModule === mod ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              {mod}
            </button>
          ))}
        </div>

        <div className="pt-4 space-y-1 border-t border-gray-200 dark:border-gray-800">
          <NavItem icon={CheckSquare} label="Attendance" active={currentView === 'Attendance'} onClick={() => onSelectView('Attendance')} />
          <NavItem icon={FileText} label="Class Practice" active={currentView === 'Class Practice'} onClick={() => onSelectView('Class Practice')} />
          <NavItem icon={Home} label="Home Practice" active={currentView === 'Home Practice'} onClick={() => onSelectView('Home Practice')} />
          <NavItem icon={Award} label="Summary Projects" active={currentView === 'Summary Projects'} onClick={() => onSelectView('Summary Projects')} />
          <NavItem icon={ImageIcon} label="Alumni Projects" active={currentView === 'Alumni Projects'} onClick={() => onSelectView('Alumni Projects')} />
          <NavItem icon={Users} label="Learners Detail" active={currentView === 'Learners Detail'} onClick={() => onSelectView('Learners Detail')} />
        </div>

        <div className="pt-4 space-y-1 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">App Configuration</h3>
          <NavItem icon={Settings} label="GID Settings" active={currentView === 'Settings'} onClick={() => onSelectView('Settings')} />
          <NavItem icon={HelpCircle} label="User Manual" active={currentView === 'User Manual'} onClick={() => onSelectView('User Manual')} />
        </div>
      </nav>
    </div>
  );
};
