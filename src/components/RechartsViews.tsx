import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, ComposedChart
} from 'recharts';
import { TransformedAttendance, TransformedPractice, TransformedProject, Learner } from '../types';
import { Trophy, AlertCircle, TrendingUp, Users } from 'lucide-react';

interface RechartsViewsProps {
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  projectData: TransformedProject[];
  learnersData: Learner[];
  onSelectCohort?: (cohort: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9'];

export const RechartsViews: React.FC<RechartsViewsProps> = ({ 
  attendanceData, 
  practiceData, 
  projectData,
  learnersData,
  onSelectCohort
}) => {
  // 1. Total Enrolees by Cohort
  const enroleesByCohort = useMemo(() => {
    const counts = learnersData.reduce((acc, curr) => {
      const cohort = curr.COHORT_NO || 'Unknown';
      acc[cohort] = (acc[cohort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name: `Cohort ${name}`, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [learnersData]);

  // 2. Attendance Performance by Module
  const attByModule = useMemo(() => {
    const agg = attendanceData.reduce((acc, curr) => {
      if (!acc[curr.MODULE]) {
        acc[curr.MODULE] = { name: curr.MODULE, rate: 0, count: 0, absences: 0 };
      }
      acc[curr.MODULE].rate += curr.Attendance_Rate;
      acc[curr.MODULE].count += 1;
      acc[curr.MODULE].absences += (curr.Overall_Sum - curr.Total_Lesson_Sum);
      return acc;
    }, {} as Record<string, { name: string, rate: number, count: number, absences: number }>);

    return Object.values(agg).map((d: any) => ({
      name: d.name,
      AttendanceRate: d.count > 0 ? parseFloat((d.rate / d.count).toFixed(1)) : 0,
      Absences: d.absences
    }));
  }, [attendanceData]);

  // 3. Top Attenders
  const topAttenders = useMemo(() => {
    // Group by student name
    const studentAtt = attendanceData.reduce((acc, curr) => {
      if (!acc[curr.NAME]) {
        acc[curr.NAME] = { name: curr.NAME, totalRate: 0, count: 0 };
      }
      acc[curr.NAME].totalRate += curr.Attendance_Rate;
      acc[curr.NAME].count += 1;
      return acc;
    }, {} as Record<string, { name: string, totalRate: number, count: number }>);

    return Object.values(studentAtt)
      .map((d: any) => ({
        name: d.name,
        rate: d.count > 0 ? (d.totalRate / d.count) : 0
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [attendanceData]);

  // 4. Practice Submission Rates (Class vs Home)
  const practiceRates = useMemo(() => {
    const agg = practiceData.reduce((acc, curr) => {
      if (!acc[curr.MODULE]) {
        acc[curr.MODULE] = { name: curr.MODULE, classRate: 0, classCount: 0, homeRate: 0, homeCount: 0, lateDays: 0, lateCount: 0 };
      }
      if (curr.TYPE === 'Class Practice') {
        acc[curr.MODULE].classRate += curr.Rate_of_Submission;
        acc[curr.MODULE].classCount += 1;
      } else {
        acc[curr.MODULE].homeRate += curr.Rate_of_Submission;
        acc[curr.MODULE].homeCount += 1;
      }
      if (curr.Average_DayDiff > 0) {
        acc[curr.MODULE].lateDays += curr.Average_DayDiff;
        acc[curr.MODULE].lateCount += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(agg).map((d: any) => ({
      name: d.name,
      ClassPractice: d.classCount > 0 ? parseFloat((d.classRate / d.classCount).toFixed(1)) : 0,
      HomePractice: d.homeCount > 0 ? parseFloat((d.homeRate / d.homeCount).toFixed(1)) : 0,
      AvgDaysLate: d.lateCount > 0 ? parseFloat((d.lateDays / d.lateCount).toFixed(1)) : 0
    }));
  }, [practiceData]);

  // 5. Project Scores by Module
  const projectScores = useMemo(() => {
    const agg = projectData.reduce((acc, curr) => {
      if (curr.GPA > 0) {
        if (!acc[curr.MODULE]) {
          acc[curr.MODULE] = { name: curr.MODULE, gpaSum: 0, count: 0 };
        }
        acc[curr.MODULE].gpaSum += curr.GPA;
        acc[curr.MODULE].count += 1;
      }
      return acc;
    }, {} as Record<string, { name: string, gpaSum: number, count: number }>);

    return Object.values(agg).map((d: any) => ({
      name: d.name,
      AverageScore: d.count > 0 ? parseFloat(((d.gpaSum / d.count) * 100).toFixed(1)) : 0
    }));
  }, [projectData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center text-sm">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-600 dark:text-gray-400 mr-2">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.value}{entry.name.includes('Rate') || entry.name.includes('Score') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Enrolees & Top Attenders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Total Enrolees by Cohort
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enroleesByCohort} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-gray-50 dark:text-gray-700/50'}} />
                <Bar 
                  dataKey="count" 
                  name="Enrolees" 
                  radius={[6, 6, 0, 0]} 
                  barSize={48}
                  onClick={(data) => {
                    if (onSelectCohort && data && data.name) {
                      const match = data.name.match(/Cohort (\d+)/);
                      if (match && match[1]) {
                        onSelectCohort(match[1]);
                      }
                    }
                  }}
                  className={onSelectCohort ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                >
                  {enroleesByCohort.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-800 p-6 rounded-2xl shadow-sm text-white transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
              Attendance Champions
            </h3>
          </div>
          <div className="space-y-4">
            {topAttenders.length > 0 ? topAttenders.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold mr-3">
                    {idx + 1}
                  </div>
                  <span className="font-medium truncate max-w-[120px]" title={student.name}>{student.name}</span>
                </div>
                <span className="font-bold text-yellow-300">{student.rate.toFixed(1)}%</span>
              </div>
            )) : (
              <div className="text-indigo-100 text-center py-8">No attendance data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Attendance & Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
            Attendance Performance by Module
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attByModule} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-gray-50 dark:text-gray-700/50'}} />
                <Area type="monotone" dataKey="AttendanceRate" name="Attendance Rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-rose-500 dark:text-rose-400" />
            Student Absence Count
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attByModule} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-gray-50 dark:text-gray-700/50'}} />
                <Bar dataKey="Absences" name="Total Absences" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Practices & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Practice Submission Rates</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={practiceRates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-gray-50 dark:text-gray-700/50'}} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="ClassPractice" name="Class Practice" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="HomePractice" name="Home Practice" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Average Project Scores</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', className: 'text-gray-50 dark:text-gray-700/50'}} />
                <Bar dataKey="AverageScore" name="Avg Score" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                <Line type="monotone" dataKey="AverageScore" stroke="#d97706" strokeWidth={3} dot={{r: 4, fill: '#fff', strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
