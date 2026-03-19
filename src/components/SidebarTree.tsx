import React, { useState } from 'react';
import { LayoutDashboard, Home, CheckSquare, FileText, Award, Users, Image as ImageIcon, Briefcase, Info, Sparkles, Settings, HelpCircle, Gem, Unlock } from 'lucide-react';
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
  onMobileClose?: () => void;
}

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

export const SidebarTree: React.FC<SidebarTreeProps> = ({
  currentView,
  selectedCohort,
  selectedModule,
  onSelectView,
  onSelectCohort,
  onSelectModule,
  availableCohorts = [],
  onMobileClose
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const handleUnlockClick = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
    } else {
      const pass = prompt("Enter password to unlock hidden tabs:");
      if (pass === "Elite7") {
        setIsUnlocked(true);
      } else if (pass !== null) {
        alert("Incorrect password");
      }
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto flex flex-col transition-colors scrollbar-elegant">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Data Dashboard
        </h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavItem icon={LayoutDashboard} label="Portal" active={currentView === 'Portal'} onClick={() => { onSelectView('Portal'); onMobileClose?.(); }} />
        <NavItem icon={Home} label="Home" active={currentView === 'Home'} onClick={() => { onSelectView('Home'); onMobileClose?.(); }} />
        <NavItem icon={CheckSquare} label="Attendance" active={currentView === 'Attendance'} onClick={() => { onSelectView('Attendance'); onMobileClose?.(); }} />
        <NavItem icon={FileText} label="Practices" active={currentView === 'Practices'} onClick={() => { onSelectView('Practices'); onMobileClose?.(); }} />
        <NavItem icon={Award} label="Projects" active={currentView === 'Projects'} onClick={() => { onSelectView('Projects'); onMobileClose?.(); }} />
        <NavItem icon={Users} label="Learners" active={currentView === 'Learners'} onClick={() => { onSelectView('Learners'); onMobileClose?.(); }} />
        <NavItem icon={ImageIcon} label="Alumni" active={currentView === 'Alumni'} onClick={() => { onSelectView('Alumni'); onMobileClose?.(); }} />
        <NavItem icon={Briefcase} label="Mentors" active={currentView === 'Mentors'} onClick={() => { onSelectView('Mentors'); onMobileClose?.(); }} />
        <NavItem icon={Info} label="About" active={currentView === 'About'} onClick={() => { onSelectView('About'); onMobileClose?.(); }} />
        <NavItem icon={Sparkles} label="Projecters" active={currentView === 'Projecters'} onClick={() => { onSelectView('Projecters'); onMobileClose?.(); }} />

        <div className="pt-2 pb-2 border-t border-gray-200 dark:border-gray-800 mt-4">
          <NavItem 
            icon={isUnlocked ? Unlock : Gem} 
            label={isUnlocked ? "Lock Settings" : "Unlock Settings"} 
            active={false} 
            onClick={handleUnlockClick} 
          />
        </div>

        {isUnlocked && (
          <div className="pt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">App Configuration</h3>
            <NavItem icon={Settings} label="GID Settings" active={currentView === 'Settings'} onClick={() => { onSelectView('Settings'); onMobileClose?.(); }} />
            <NavItem icon={HelpCircle} label="User Manual" active={currentView === 'User Manual'} onClick={() => { onSelectView('User Manual'); onMobileClose?.(); }} />
          </div>
        )}
      </nav>
    </div>
  );
};
