import React from 'react';
import { ViewType } from '../types';
import { LayoutDashboard, Home, CheckSquare, FileText, Award, Users, Image as ImageIcon, Briefcase } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems: { title: ViewType, icon: any }[] = [
    { title: 'Portal', icon: LayoutDashboard },
    { title: 'Home', icon: Home },
    { title: 'Attendance', icon: CheckSquare },
    { title: 'Practices', icon: FileText },
    { title: 'Projects', icon: Award },
    { title: 'Learners', icon: Users },
    { title: 'Alumni', icon: ImageIcon },
    { title: 'Mentors', icon: Briefcase },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center space-x-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.title}
          onClick={() => onNavigate(item.title)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
            currentView === item.title
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{item.title}</span>
        </button>
      ))}
    </div>
  );
};
