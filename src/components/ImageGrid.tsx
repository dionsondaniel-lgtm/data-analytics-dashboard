import React from 'react';
import { AlumniProject, AllCohortsPhoto } from '../types';

interface ImageGridProps {
  alumniProjects?: AlumniProject[];
  cohortPhotos?: AllCohortsPhoto[];
  horizontal?: boolean;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ alumniProjects, cohortPhotos, horizontal = false }) => {
  // Helper to extract a clean URL if it's wrapped in some text or is a drive link
  const cleanUrl = (url: string) => {
    if (!url) return '';
    return url.trim();
  };

  const containerClass = horizontal 
    ? "flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 snap-x scrollbar-elegant" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  const itemClass = horizontal
    ? "flex-none w-72 sm:w-80 snap-start bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    : "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow";

  return (
    <div className="space-y-8">
      {alumniProjects && alumniProjects.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Alumni Projects</h3>
          <div className={containerClass}>
            {alumniProjects.map((proj, idx) => (
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
            ))}
          </div>
        </div>
      )}

      {cohortPhotos && cohortPhotos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cohort Photos</h3>
          <div className={containerClass}>
            {cohortPhotos.map((photo, idx) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
