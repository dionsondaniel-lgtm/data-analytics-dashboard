import React from 'react';
import { OverallMetrics } from '../types';
import { TrendingUp, Users, CheckCircle, Award } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: OverallMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Average GPA',
      value: `${(metrics.Average_GPA * 100).toFixed(1)}%`,
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Overall Attendance',
      value: `${metrics.Overall_Attendance_Rate.toFixed(1)}%`,
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Submission Rate',
      value: `${metrics.Overall_Submission_Rate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center transition-colors">
          <div className={`p-4 rounded-xl ${card.bgColor} mr-4`}>
            <card.icon className={`h-8 w-8 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
