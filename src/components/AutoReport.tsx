import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { OverallMetrics } from '../types';

interface AutoReportProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: OverallMetrics;
  filters: { cohort: string | null; module: string | null };
}

export const AutoReport: React.FC<AutoReportProps> = ({ isOpen, onClose, metrics, filters }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fullText = `
==================================================
          📊 EXECUTIVE SUMMARY REPORT 📊
==================================================

[ 🎯 FILTERS APPLIED ]
> 👥 Cohort: ${filters.cohort ? filters.cohort : 'All Cohorts'}
> 📚 Module: ${filters.module ? filters.module : 'All Modules'}

[ 📈 PERFORMANCE OVERVIEW ]
> 📅 Overall Attendance Rate : ${metrics.Overall_Attendance_Rate.toFixed(1)}%
> 📝 Practice Submission Rate: ${metrics.Overall_Submission_Rate.toFixed(1)}%
> 🎓 Average Project GPA     : ${metrics.Average_GPA.toFixed(1)}%

[ 💡 KEY INSIGHTS & ANALYSIS ]
${metrics.Overall_Attendance_Rate < 80 ? '⚠️ [WARNING] Attendance is below the 80% threshold. Immediate intervention recommended.' : '✅ [OK] Attendance is healthy and above 80%.'}
${metrics.Overall_Submission_Rate < 70 ? '⚠️ [WARNING] Practice submissions are lagging. Consider sending reminders.' : '✅ [OK] Practice submissions are on track.'}
${metrics.Average_GPA >= 85 ? '🏆 [EXCELLENT] High project performance observed.' : '✅ [OK] Project performance is within expected ranges.'}

==================================================
          🏁 END OF AUTOMATED REPORT 🏁
==================================================
  `.trim();

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setCurrentIndex(0);
      setIsTyping(true);
      setIsFullscreen(false);
      return;
    }

    const interval = setInterval(() => {
      if (isTyping && currentIndex < fullText.length) {
        setText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
        
        // Auto-scroll to bottom
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      } else if (currentIndex >= fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25); // Typing speed

    return () => clearInterval(interval);
  }, [isOpen, isTyping, currentIndex, fullText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-500">
      <div 
        className={`bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[80vh] rounded-2xl'
        }`}
      >
        {/* Video Player Style Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-black/50 text-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-sm font-medium tracking-wider uppercase text-gray-400">Live Report Generation</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="hover:bg-white/10 p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose} 
              className="hover:bg-red-500/20 p-1.5 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal/Video Content Area */}
        <div 
          ref={contentRef}
          className="p-8 flex-1 overflow-y-auto font-mono text-base md:text-lg text-green-400 whitespace-pre-wrap leading-relaxed bg-gradient-to-b from-gray-900 to-black scrollbar-elegant"
          style={{ textShadow: '0 0 5px rgba(74, 222, 128, 0.3)' }}
        >
          {text}
          {isTyping && <span className="animate-pulse inline-block w-3 h-5 bg-green-400 ml-1 align-middle shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>}
        </div>

        {/* Video Player Style Controls */}
        <div className="px-6 py-4 border-t border-gray-800 bg-black/80 flex items-center justify-between">
          
          {/* Progress Bar (Visual only) */}
          <div className="absolute top-0 left-0 h-0.5 bg-gray-800 w-full">
            <div 
              className="h-full bg-green-500 transition-all duration-75" 
              style={{ width: `${(currentIndex / fullText.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsTyping(!isTyping)} 
              className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              {isTyping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button 
              onClick={() => { setText(''); setCurrentIndex(0); setIsTyping(true); }} 
              className="flex items-center justify-center w-10 h-10 bg-white/5 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono text-gray-500">
              {Math.round((currentIndex / fullText.length) * 100)}% COMPLETE
            </div>
          </div>
          
          <div className="text-xs font-mono text-gray-600">
            SYSTEM.OUT // {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
