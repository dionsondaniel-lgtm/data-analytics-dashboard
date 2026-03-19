import React from 'react';
import { ViewType, OverallMetrics } from '../types';
import { Home, CheckSquare, FileText, Award, Users, Image as ImageIcon, Briefcase, Info, Sparkles, Database, FileSpreadsheet, BarChart2, Code } from 'lucide-react';

interface PortalProps {
  metrics?: OverallMetrics;
  onNavigate: (view: ViewType) => void;
  currentView?: ViewType;
}

export const Portal: React.FC<PortalProps> = ({ metrics, onNavigate, currentView }) => {
  const cards: { title: ViewType, icon: any, description: string, color: string, gradient: string, previewText: string }[] = [
    { 
      title: 'Home', 
      icon: Home, 
      description: 'Main dashboard and completion rates', 
      color: 'text-blue-500', 
      gradient: 'from-blue-500 to-cyan-400',
      previewText: 'View overall completion rates and key metrics across all cohorts.'
    },
    { 
      title: 'Attendance', 
      icon: CheckSquare, 
      description: 'Attendance tracking and trends', 
      color: 'text-emerald-500', 
      gradient: 'from-emerald-500 to-teal-400',
      previewText: 'Track learner attendance trends over time and by module.'
    },
    { 
      title: 'Practices', 
      icon: FileText, 
      description: 'Class and home practice submissions', 
      color: 'text-indigo-500', 
      gradient: 'from-indigo-500 to-blue-400',
      previewText: 'Monitor submission rates for class and home practices.'
    },
    { 
      title: 'Projects', 
      icon: Award, 
      description: 'Project scores and performance', 
      color: 'text-purple-500', 
      gradient: 'from-purple-500 to-pink-400',
      previewText: 'Analyze project scores and identify top-performing learners.'
    },
    { 
      title: 'Learners', 
      icon: Users, 
      description: 'Learner profiles and details', 
      color: 'text-pink-500', 
      gradient: 'from-pink-500 to-rose-400',
      previewText: 'Detailed profiles, scores, and attendance for individual learners.'
    },
    { 
      title: 'Alumni', 
      icon: ImageIcon, 
      description: 'Alumni projects and snippets', 
      color: 'text-orange-500', 
      gradient: 'from-orange-500 to-amber-400',
      previewText: 'Explore projects and achievements from past cohorts.'
    },
    { 
      title: 'Mentors', 
      icon: Briefcase, 
      description: 'Mentor directory and metrics', 
      color: 'text-teal-500', 
      gradient: 'from-teal-500 to-emerald-400',
      previewText: 'Connect with mentors and view their expertise and ratings.'
    },
    { 
      title: 'About', 
      icon: Info, 
      description: 'About the Data Analytics Program', 
      color: 'text-gray-500', 
      gradient: 'from-gray-500 to-slate-400',
      previewText: 'Learn about the purpose, features, and security of the app.'
    },
    { 
      title: 'Projecters', 
      icon: Sparkles, 
      description: 'Projecters showcase', 
      color: 'text-amber-500', 
      gradient: 'from-amber-500 to-yellow-400',
      previewText: 'Meet the team behind the TTSP Data Analytics Dashboard.'
    },
  ];

  const modules = [
    { name: 'SQL', icon: Database, color: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/50' },
    { name: 'Excel', icon: FileSpreadsheet, color: 'from-emerald-600 to-emerald-400', shadow: 'shadow-emerald-500/50' },
    { name: 'Power BI', icon: BarChart2, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/50' },
    { name: 'Python', icon: Code, color: 'from-indigo-600 to-indigo-400', shadow: 'shadow-indigo-500/50' },
  ];

  return (
    <div className="p-6 space-y-10">
      {/* Modules 3D Icons Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Core Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {modules.map((mod) => (
            <div key={mod.name} className="flex flex-col items-center justify-center group cursor-pointer">
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${mod.color} shadow-lg ${mod.shadow} transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 flex items-center justify-center`}>
                <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                <mod.icon className="w-10 h-10 text-white relative z-10 drop-shadow-md" />
              </div>
              <span className="mt-4 font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {mod.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div 
              key={card.title}
              onClick={() => onNavigate(card.title)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Mini Preview Header */}
              <div className={`h-24 w-full bg-gradient-to-r ${card.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute top-4 left-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md border border-white/30 shadow-sm">
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Mini Preview Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  {card.description}
                </p>
                
                {/* Simulated Content Lines */}
                <div className="mt-auto space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 italic">
                  {card.previewText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
