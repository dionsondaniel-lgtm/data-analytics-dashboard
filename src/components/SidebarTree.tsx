import React, { useState } from 'react';
import { 
  LayoutDashboard, Home, CheckSquare, FileText, 
  Award, Users, Image as ImageIcon, Briefcase, 
  Info, Sparkles, Settings, HelpCircle, Gem, 
  Unlock, Table as TableIcon, UserCircle, ClipboardList 
} from 'lucide-react';
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

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors text-left",
      active 
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    )}
  >
    <Icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", active ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
    <span className="truncate">{label}</span>
  </button>
);

export const SidebarTree: React.FC<SidebarTreeProps> = ({
  currentView,
  onSelectView,
  onMobileClose
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const handleUnlockClick = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
    } else {
      const pass = prompt("Enter password to unlock hidden tabs:");
      if (pass === "LED") {
        setIsUnlocked(true);
      } else if (pass !== null) {
        alert("Incorrect password");
      }
    }
  };

  // Helper to ensure view updates before mobile sidebar closes
  const handleNavClick = (view: any) => {
    onSelectView(view);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Safely cast currentView to string to avoid TypeScript union overlap errors
  const current = currentView as string;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden flex flex-col transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Data Dashboard
        </h2>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-elegant">
        {/* --- MAIN DASHBOARDS SECTION --- */}
        <h3 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Views</h3>
        <NavItem icon={LayoutDashboard} label="Portal" active={current === 'Portal'} onClick={() => handleNavClick('Portal')} />
        <NavItem icon={Home} label="Home" active={current === 'Home'} onClick={() => handleNavClick('Home')} />
        <NavItem icon={CheckSquare} label="Attendance" active={current === 'Attendance'} onClick={() => handleNavClick('Attendance')} />
        <NavItem icon={FileText} label="Practices" active={current === 'Practices'} onClick={() => handleNavClick('Practices')} />
        <NavItem icon={Award} label="Projects" active={current === 'Projects'} onClick={() => handleNavClick('Projects')} />
        <NavItem icon={Users} label="Learners" active={current === 'Learners'} onClick={() => handleNavClick('Learners')} />
        <NavItem icon={ImageIcon} label="Alumni" active={current === 'Alumni'} onClick={() => handleNavClick('Alumni')} />
        <NavItem icon={Briefcase} label="Mentors" active={current === 'Mentors'} onClick={() => handleNavClick('Mentors')} />
        <NavItem icon={Sparkles} label="Projecters" active={current === 'Projecters'} onClick={() => handleNavClick('Projecters')} />
        <NavItem icon={Info} label="About" active={current === 'About'} onClick={() => handleNavClick('About')} />
        <NavItem icon={HelpCircle} label="User Manual" active={current === 'User Manual'} onClick={() => handleNavClick('User Manual')} />
        
        {/* Lock/Unlock Toggle */}
        <div className="pt-2 pb-2 border-t border-gray-200 dark:border-gray-800 mt-4">
          <NavItem 
            icon={isUnlocked ? Unlock : Gem} 
            label={isUnlocked ? "Lock Database" : "Unlock Master Database"} 
            active={false} 
            onClick={handleUnlockClick} 
          />
        </div>

        {/* --- HIDDEN MASTER DATABASE SECTION --- */}
        {isUnlocked && (
          <div className="pt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300 pb-6">
            <h3 className="px-4 py-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">Master Database</h3>
            
            <NavItem icon={TableIcon} label="Learners Detail" active={current === 'Learners Detail'} onClick={() => handleNavClick('Learners Detail')} />
            <NavItem icon={CheckSquare} label="Attendance Table" active={current === 'Attendance Table'} onClick={() => handleNavClick('Attendance Table')} />
            <NavItem icon={ClipboardList} label="Class Practice" active={current === 'Class Practice'} onClick={() => handleNavClick('Class Practice')} />
            <NavItem icon={FileText} label="Home Practice" active={current === 'Home Practice'} onClick={() => handleNavClick('Home Practice')} />
            <NavItem icon={Award} label="Summary Projects" active={current === 'Summary Projects'} onClick={() => handleNavClick('Summary Projects')} />
            <NavItem icon={ImageIcon} label="Alumni Projects" active={current === 'Alumni Projects'} onClick={() => handleNavClick('Alumni Projects')} />
            <NavItem icon={UserCircle} label="Profiles" active={current === 'Profiles'} onClick={() => handleNavClick('Profiles')} />

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Config</h3>
              <NavItem icon={Settings} label="GID Settings" active={current === 'Settings'} onClick={() => handleNavClick('Settings')} />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};