import React, { useState } from 'react';
import { AlumniProject, AllCohortsPhoto } from '../types';
import { Lock, Unlock, KeyRound } from 'lucide-react';

interface ImageGridProps {
  alumniProjects?: AlumniProject[];
  cohortPhotos?: AllCohortsPhoto[];
  horizontal?: boolean;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ alumniProjects, cohortPhotos, horizontal = false }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Elite7') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  // Helper to extract a clean URL if it's wrapped in some text or is a drive link
  const cleanUrl = (url: string) => {
    if (!url) return '';
    return url.trim();
  };

  const containerClass = horizontal 
    ? "flex overflow-hidden pb-6 -mx-4 px-4 sm:mx-0 sm:px-0" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  const itemClass = horizontal
    ? "flex-none w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow mx-3"
    : "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow";

  const renderAlumniItem = (proj: AlumniProject, idx: number) => (
    <div key={idx} className={itemClass}>
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {proj.Project_Image_Url ? (
          <img 
            src={cleanUrl(proj.Project_Image_Url)} 
            alt={proj.Project} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${proj.Project.replace(/\s/g, '')}/400/300`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
          {proj.Status}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={proj.Project}>{proj.Project}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">Ref: {proj.Project_Image_Ref}</p>
      </div>
    </div>
  );

  const renderCohortItem = (photo: AllCohortsPhoto, idx: number) => (
    <div key={idx} className={itemClass}>
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
        {photo.IMAGE_URL ? (
          <img 
            src={cleanUrl(photo.IMAGE_URL)} 
            alt={photo.NAME} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${photo.NAME.replace(/\s/g, '')}/400/400`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={photo.NAME}>{photo.NAME}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{photo.COMPANY}</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Cohort {photo.COHORT_NO}</p>
      </div>
    </div>
  );

  const renderMarquee = (items: any[], renderItem: (item: any, idx: number) => React.ReactNode) => {
    // Duplicate items to ensure seamless scrolling
    const duplicatedItems = [...items, ...items, ...items, ...items];
    return (
      <div className={containerClass}>
        <div className="flex w-max animate-marquee">
          {duplicatedItems.map((item, idx) => renderItem(item, idx))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {alumniProjects && alumniProjects.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Alumni Projects</h3>
          {horizontal ? (
            renderMarquee(alumniProjects, renderAlumniItem)
          ) : (
            <div className={containerClass}>
              {alumniProjects.map(renderAlumniItem)}
            </div>
          )}
        </div>
      )}

      {cohortPhotos && cohortPhotos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Cohort Photos
            {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
            {isUnlocked && <Unlock className="w-5 h-5 text-emerald-500" />}
          </h3>
          
          {!isUnlocked ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Protected Content</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                Please enter the password to view the cohort photos.
              </p>
              <form onSubmit={handleUnlock} className="w-full space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  Unlock Photos
                </button>
              </form>
            </div>
          ) : (
            horizontal ? (
              renderMarquee(cohortPhotos, renderCohortItem)
            ) : (
              <div className={containerClass}>
                {cohortPhotos.map(renderCohortItem)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
