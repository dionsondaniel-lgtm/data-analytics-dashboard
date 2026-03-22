import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType, OverallMetrics } from '../types';
import { 
  Home, CheckSquare, FileText, Award, Users, Image as ImageIcon, 
  Briefcase, Info, Sparkles, Database, FileSpreadsheet, 
  BarChart2, Code, X, Zap, ChevronRight 
} from 'lucide-react';

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
      name: 'SQL', icon: Database, color: 'from-blue-600 to-blue-400', 
      intro: 'The foundation of data retrieval. Learn to communicate with databases using standard Structured Query Language.',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Excel', icon: FileSpreadsheet, color: 'from-emerald-600 to-emerald-400', 
      intro: 'Beyond the cells. Master advanced data manipulation, pivot tables, and statistical modeling.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Power BI', icon: BarChart2, color: 'from-amber-500 to-yellow-400', 
      intro: 'Visual Storytelling. Transform raw numbers into interactive, automated dashboards.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop'
    },
    { 
      name: 'Python', icon: Code, color: 'from-indigo-600 to-indigo-400', 
      intro: 'Automated Analytics. Harness programming to handle big data and predictive analysis.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* CORE MODULES */}
      <section>
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Core Modules</h2>
        </motion.div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
          {modules.map((mod) => (
            <motion.div 
              key={mod.name} 
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setSelectedModule(mod)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br ${mod.color} shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-3`}>
                <mod.icon className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10 drop-shadow-lg" />
              </div>
              <span className="mt-3 font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition-colors">
                {mod.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* DASHBOARD UNIVERSE */}
      <section>
        <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Dashboard Universe</h2>
        </motion.div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              onClick={() => onNavigate(card.title)}
              // RELAY SHAKE ANIMATION
              animate={{ 
                x: [0, -1, 1, -1, 1, 0],
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                repeatDelay: 8,
                delay: index * 0.2
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="relative p-[1px] group cursor-pointer overflow-hidden rounded-[2.5rem]"
            >
              {/* Border Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-30 group-hover:opacity-100 transition-opacity animate-spin-slow`} style={{ margin: '-100%' }} />
              
              <div className="relative h-64 md:h-72 bg-white dark:bg-gray-900 rounded-[2.4rem] overflow-hidden flex flex-col border border-white/5 shadow-xl">
                {/* Background Image - Made CLEARER */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={`https://drive.google.com/thumbnail?id=${card.driveId}&sz=w800`} 
                    alt={card.title}
                    className="w-full h-full object-cover opacity-60 contrast-125 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-6 md:p-8 mt-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter shadow-black drop-shadow-md">
                      {card.title}
                    </h3>
                  </div>
                  {/* Always visible description for mobile, slight slide-up for Desktop */}
                  <p className="text-gray-200 text-xs md:text-sm font-medium transition-all duration-500 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0">
                    {card.description} — Specialized Analytics.
                  </p>
                </div>

                {/* Hover Icon */}
                <div className="absolute top-6 right-6 p-2 rounded-full bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* MODULE MODAL - Adjusted Position lower (increased pt-36 md:pt-48) */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto pt-36 md:pt-48">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 mb-20"
            >
              <button 
                onClick={() => setSelectedModule(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white"
              >
                <X size={20} />
              </button>

              <div className="relative h-48">
                <img src={selectedModule.image} className="w-full h-full object-cover" alt={selectedModule.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-black/20" />
                <div className="absolute -bottom-6 left-8">
                  <div className={`p-4 rounded-3xl bg-gradient-to-br ${selectedModule.color} shadow-2xl`}>
                    <selectedModule.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8 pt-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Module Briefing</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase italic">
                  {selectedModule.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {selectedModule.intro}
                </p>

                <button 
                  onClick={() => setSelectedModule(null)}
                  className="mt-8 w-full py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirm & Close
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
          animation: border-flow 6s linear infinite;
        }
      `}</style>
    </div>
  );
};