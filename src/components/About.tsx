import React from 'react';
import { OverallMetrics, Learner, AllCohortsPhoto } from '../types';
import { Info, Target, Lightbulb, ShieldCheck } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface AboutProps {
  metrics: OverallMetrics;
  learners: Learner[];
  cohortPhotos: AllCohortsPhoto[];
  onNavigate: (view: any) => void;
  currentView: any;
}

export const About: React.FC<AboutProps> = ({ onNavigate, currentView }) => {
  return (
    <div className="min-h-screen p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop")' }}>
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 md:p-12 min-h-[80vh] flex flex-col max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <Info className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">About the Dashboard</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">TTSP Data Analytics Program</p>
          </div>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-indigo-500" />
              Our Purpose
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The TTSP Data Analytics Dashboard is a comprehensive platform designed to track, analyze, and visualize the progress of learners across multiple cohorts. Our primary goal is to provide actionable insights into student performance, attendance, and project completion rates, enabling mentors and administrators to make data-driven decisions that enhance the learning experience.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              By aggregating data from various modules including SQL, Excel, Power BI, and Python, this tool offers a holistic view of the educational journey, ensuring that no learner is left behind and that the curriculum remains effective and engaging.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Real-time Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Monitor attendance and practice submissions as they happen, allowing for immediate intervention and support for learners who may be struggling.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Comprehensive Metrics</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Evaluate overall performance through detailed charts and graphs that break down scores by cohort, module, and individual learner.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mentor Insights</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Equip mentors with the data they need to tailor their guidance, track their own impact, and foster a more productive learning environment.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Alumni Showcase</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Celebrate success by highlighting outstanding projects and achievements from past cohorts, inspiring current learners to excel.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              Data Integrity & Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We prioritize the privacy and security of all learner data. The dashboard employs robust authentication and authorization protocols to ensure that sensitive information is only accessible to authorized personnel. Data is regularly synced and backed up to maintain accuracy and reliability.
            </p>
          </section>
        </div>
      </div>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};

