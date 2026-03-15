import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const TimeMarquee: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone
    }).format(date);
  };

  const cards = [
    {
      id: 'date',
      title: 'Current Date',
      value: formatDate(time),
      icon: <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
      bg: 'bg-white/80 dark:bg-slate-800/80',
      border: 'border-slate-200/50 dark:border-slate-700/50',
      accent: 'bg-slate-500'
    },
    {
      id: 'manila',
      title: 'Manila, PH',
      value: formatTime(time, 'Asia/Manila'),
      icon: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      flagUrl: 'https://flagcdn.com/w80/ph.png',
      mapUrl: 'https://raw.githubusercontent.com/djaiss/mapsicon/master/all/ph/vector.svg',
      bg: 'bg-white/80 dark:bg-slate-800/80',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      accent: 'bg-blue-500'
    },
    {
      id: 'tokyo',
      title: 'Tokyo, JP',
      value: formatTime(time, 'Asia/Tokyo'),
      icon: <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      flagUrl: 'https://flagcdn.com/w80/jp.png',
      mapUrl: 'https://raw.githubusercontent.com/djaiss/mapsicon/master/all/jp/vector.svg',
      bg: 'bg-white/80 dark:bg-slate-800/80',
      border: 'border-rose-200/50 dark:border-rose-800/50',
      accent: 'bg-rose-500'
    },
    {
      id: 'jerusalem',
      title: 'Jerusalem, IL',
      value: formatTime(time, 'Asia/Jerusalem'),
      icon: <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      flagUrl: 'https://flagcdn.com/w80/il.png',
      mapUrl: 'https://raw.githubusercontent.com/djaiss/mapsicon/master/all/il/vector.svg',
      bg: 'bg-white/80 dark:bg-slate-800/80',
      border: 'border-emerald-200/50 dark:border-emerald-800/50',
      accent: 'bg-emerald-500'
    }
  ];

  // Duplicate for seamless marquee
  const duplicatedCards = [...cards, ...cards, ...cards, ...cards];

  return (
    <div className="w-full overflow-hidden py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm z-20">
      <div className="flex w-max animate-marquee space-x-4 px-4">
        {duplicatedCards.map((card, idx) => (
          <div 
            key={`${card.id}-${idx}`}
            className={`relative flex-none w-60 flex items-center p-2.5 rounded-xl border ${card.border} ${card.bg} shadow-sm backdrop-blur-xl mx-1.5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md group overflow-hidden`}
          >
            {/* Map Silhouette Background */}
            {card.mapUrl && (
              <div className="absolute -right-3 -bottom-3 w-24 h-24 opacity-[0.08] dark:opacity-[0.15] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                <img 
                  src={card.mapUrl} 
                  alt="Map" 
                  className="w-full h-full object-contain filter grayscale dark:invert" 
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}

            {/* Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.accent} opacity-70`} />

            <div className="flex-shrink-0 mr-3 relative z-10">
              <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                {React.cloneElement(card.icon as React.ReactElement, { className: "w-4 h-4 text-slate-700 dark:text-slate-300" })}
              </div>
              {card.flagUrl && (
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <img src={card.flagUrl} alt="Flag" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col z-10">
              <div className="flex items-center space-x-1 mb-0.5">
                {card.flagUrl && <MapPin className="w-2.5 h-2.5 text-slate-400" />}
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                  {card.title}
                </span>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
