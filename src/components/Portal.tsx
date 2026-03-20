import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType, OverallMetrics } from '../types';
import { 
  Home, CheckSquare, FileText, Award, Users, Image as ImageIcon, 
  Briefcase, Info, Sparkles, Database, FileSpreadsheet, 
  BarChart2, Code, X, Zap, ChevronRight 
} from 'lucide-react';
import { getDriveImageUrl } from '../App';

interface PortalProps {
  metrics?: OverallMetrics;
  onNavigate: (view: ViewType) => void;
  currentView?: ViewType;
}

export const Portal: React.FC<PortalProps> = ({ metrics, onNavigate, currentView }) => {
  const [selectedModule, setSelectedModule] = useState<null | typeof modules[0]>(null);

  const cards: { title: ViewType, icon: any, description: string, driveId: string, gradient: string }[] = [
    { title: 'Home', icon: Home, description: 'Main Metrics', driveId: '14V7UqByTDup0JctHZcnQ-8swjjRuGVLE', gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
    { title: 'Attendance', icon: CheckSquare, description: 'Track Logs', driveId: '1mCjxUCTp4XTiVWSfyR-tf1ExuPgmduie', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
    { title: 'Practices', icon: FileText, description: 'Submissions', driveId: '1i6Dm-nd5R_L08Lg3rPQEJPcQf4dWH552', gradient: 'from-orange-500 via-red-500 to-pink-500' },
    { title: 'Projects', icon: Award, description: 'Scores & GPA', driveId: '1LPOkjm5BBcDsDRMXceHvQHA9bfGA6EMO', gradient: 'from-purple-500 via-fuchsia-500 to-rose-500' },
    { title: 'Learners', icon: Users, description: 'Student Files', driveId: '1AG7fUmV-OTGwSIe1J2D239jo4DCvKde0', gradient: 'from-pink-500 via-rose-500 to-red-500' },
    { title: 'Alumni', icon: ImageIcon, description: 'Legacy Works', driveId: '1qhjFwzc0JfIOHajDVTdFIFYfcttAilmW', gradient: 'from-amber-500 via-orange-500 to-yellow-500' },
    { title: 'Mentors', icon: Briefcase, description: 'Expert Directory', driveId: '1yqzBJuIeZN0KXGV3D81e3ZLqAhZPGZqP', gradient: 'from-teal-500 via-emerald-500 to-lime-500' },
    { title: 'About', icon: Info, description: 'App Info', driveId: '15GrZj4O7yFNOFakAo0yQTrEBqTLdMmFm', gradient: 'from-slate-500 via-gray-600 to-slate-700' },
    { title: 'Projecters', icon: Sparkles, description: 'Creative Team', driveId: '1OPGRyMNFFhHnpAKAPn741QxcWM3cp2PK', gradient: 'from-indigo-600 via-violet-600 to-blue-600' },
  ];

  const modules = [
    { 
      name: 'SQL', 
      icon: Database, 
      color: 'from-blue-600 to-blue-400', 
      intro: 'The foundation of data retrieval. Learn to communicate with complex databases and extract meaningful intelligence using industry-standard Structured Query Language.',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Excel', 
      icon: FileSpreadsheet, 
      color: 'from-emerald-600 to-emerald-400', 
      intro: 'Beyond the cells. Master advanced data manipulation, pivot tables, and statistical modeling to turn spreadsheets into powerful decision-making engines.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Power BI', 
      icon: BarChart2, 
      color: 'from-amber-500 to-yellow-400', 
      intro: 'Visual Storytelling. Transform raw numbers into interactive, automated dashboards that reveal the "why" behind the data through stunning visualizations.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Python', 
      icon: Code, 
      color: 'from-indigo-600 to-indigo-400', 
      intro: 'Automated Analytics. Harness the power of programming to handle big data, perform predictive analysis, and automate repetitive data cleaning tasks.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop'
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      
      {/* Core Modules 3D Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">CORE MODULES</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {modules.map((mod) => (
            <motion.div 
              key={mod.name} 
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedModule(mod)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${mod.color} shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <mod.icon className="w-12 h-12 text-white relative z-10 drop-shadow-2xl transition-transform group-hover:rotate-12" />
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <mod.icon className="w-16 h-16 text-white" />
                </div>
              </div>
              <span className="mt-4 font-black text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition-colors">
                {mod.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dashboard Sections with Animated Borders */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">DASHBOARD UNIVERSE</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              onClick={() => onNavigate(card.title)}
              // Periodic Shake every 5 seconds
              animate={{ x: [0, -2, 2, -2, 2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative p-[2px] group cursor-pointer overflow-hidden rounded-[2.5rem]"
            >
              {/* Running Color Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} animate-spin-slow opacity-60 group-hover:opacity-100 transition-opacity`} 
                   style={{ animationDuration: '3s', margin: '-50%' }}></div>
              
              <div className="relative h-64 bg-white dark:bg-gray-900 rounded-[2.4rem] overflow-hidden flex flex-col border border-white/10">
                {/* Background Image Snippet */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={`https://drive.google.com/thumbnail?id=${card.driveId}&sz=w800`} 
                    alt={card.title}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-8 mt-auto">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-black/20`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm font-medium opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    {card.description} — Explore specialized analytics and detailed logs.
                  </p>
                </div>

                {/* Visual Accent */}
                <div className="absolute top-6 right-6 p-2 rounded-full bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Module Quick Info Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
              <button 
                onClick={() => setSelectedModule(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="relative h-48">
                <img src={selectedModule.image} className="w-full h-full object-cover" alt={selectedModule.name} />
                <div className={`absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-black/20`}></div>
                <div className="absolute bottom-4 left-8">
                  <div className={`p-4 rounded-3xl bg-gradient-to-br ${selectedModule.color} shadow-xl inline-flex mb-4`}>
                    <selectedModule.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Quick Introduction</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase italic">
                  {selectedModule.name} Mastery
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {selectedModule.intro}
                </p>

                <button 
                  onClick={() => setSelectedModule(null)}
                  className="mt-8 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl"
                >
                  Confirm Understanding
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes border-flow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: border-flow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};