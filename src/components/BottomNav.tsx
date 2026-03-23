import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Home, CheckSquare, FileText, 
  Award, Users, Image as ImageIcon, Briefcase, 
  Plus, X, Sparkles, Info , HelpCircle
} from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { title: 'Portal', icon: LayoutDashboard },
    { title: 'Home', icon: Home },
    { title: 'Attendance', icon: CheckSquare },
    { title: 'Practices', icon: FileText },
    { title: 'Projects', icon: Award },
    { title: 'Learners', icon: Users },
    { title: 'Alumni', icon: ImageIcon },
    { title: 'Mentors', icon: Briefcase },
    { title: 'Projecters', icon: Sparkles },
    { title: 'About', icon: Info },
    { title: 'User Manual', icon: HelpCircle },
  ];

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSelect = (view: ViewType) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <Electricity side="left" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleModal}
          className="relative w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white border border-white/20 overflow-hidden group"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} className="z-10">
            <Plus className="w-8 h-8" />
          </motion.div>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
        <Electricity side="right" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white/10 dark:bg-gray-900/40 border border-white/20 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-semibold text-white">Quick Navigation</h2>
                <button onClick={toggleModal} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.title}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(item.title as ViewType)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${
                      currentView === item.title 
                        ? 'bg-white text-indigo-600 shadow-xl' 
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    } border border-white/10`}
                  >
                    <div className={`p-3 rounded-2xl mb-3 ${currentView === item.title ? 'bg-indigo-50 text-indigo-600' : 'bg-white/10'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium tracking-wide">{item.title}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Electricity = ({ side }: { side: 'left' | 'right' }) => (
  <div className={`absolute ${side === 'left' ? '-left-24' : '-right-24'} pointer-events-none`}>
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">
      <motion.path
        d={side === 'left' ? "M100,20 Q75,5 50,20 T0,20" : "M0,20 Q25,35 50,20 T100,20"}
        stroke="url(#elecGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 0.5, 1],
          opacity: [0, 1, 0.8, 1],
          x: side === 'left' ? [0, -5, 0] : [0, 5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
      />
      <defs>
        <linearGradient id="elecGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);