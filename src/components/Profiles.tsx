import React, { useState, useMemo } from 'react';
import { Learner, AllCohortsPhoto, AlumniProject, CohortImage } from '../types';
import { Mail, MapPin, Building, Briefcase, Linkedin, Facebook, Search, Filter } from 'lucide-react';

interface ProfilesProps {
  learners: Learner[];
  cohortPhotos: AllCohortsPhoto[];
  alumniProjects: AlumniProject[];
  cohortImages: CohortImage[];
}

type ProfileType = 'Alumni' | 'Mentors';

export const Profiles: React.FC<ProfilesProps> = ({ learners, cohortPhotos, alumniProjects, cohortImages }) => {
  const [profileType, setProfileType] = useState<ProfileType>('Alumni');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('All');

  const cohorts = useMemo(() => {
    const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean));
    return ['All', ...Array.from(uniqueCohorts).sort()];
  }, [learners]);

  const filteredProfiles = useMemo(() => {
    if (profileType === 'Mentors') return []; // No mentor data yet

    return learners.filter(learner => {
      const matchesSearch = learner.NAME.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            learner.COMPANY.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCohort = selectedCohort === 'All' || learner.COHORT_NO === selectedCohort;
      return matchesSearch && matchesCohort;
    });
  }, [learners, profileType, searchTerm, selectedCohort]);

  const getLearnerPhoto = (name: string) => {
    const photo = cohortPhotos.find(p => p.NAME.toLowerCase() === name.toLowerCase());
    return photo?.IMAGE_URL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  const getLearnerProjects = (name: string) => {
    return alumniProjects.filter(p => p.Staff_1_to_10 && p.Staff_1_to_10.toLowerCase().includes(name.toLowerCase()));
  };

  const getCohortImage = (cohortNo: string) => {
    const img = cohortImages.find(c => c.Cohort_no === cohortNo);
    return img?.image_url || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <select
            value={profileType}
            onChange={(e) => setProfileType(e.target.value as ProfileType)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="Alumni">Learners / Alumni</option>
            <option value="Mentors">Mentors</option>
          </select>
          
          {profileType === 'Alumni' && (
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              {cohorts.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Cohorts' : `Cohort ${c}`}</option>
              ))}
            </select>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Search by name or company..."
          />
        </div>
      </div>

      {profileType === 'Mentors' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Mentors Directory</h3>
          <p className="text-gray-500 dark:text-gray-400">Mentor profiles will be available soon.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">No profiles found matching your criteria.</p>
            </div>
          ) : (
            filteredProfiles.map((learner, idx) => {
              const projects = getLearnerProjects(learner.NAME);
              const cohortImg = getCohortImage(learner.COHORT_NO);
              
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
                  {/* Left Column: Profile Info */}
                  <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md mb-4">
                      <img 
                        src={getLearnerPhoto(learner.NAME)} 
                        alt={learner.NAME} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{learner.NAME}</h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">{learner.DESIGNATION}</p>
                    
                    <div className="w-full space-y-3 text-left mt-4">
                      {learner.COMPANY && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                          <Building className="w-4 h-4 mr-3 text-gray-400" />
                          <span>{learner.COMPANY}</span>
                        </div>
                      )}
                      {learner.Email_Add && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                          <Mail className="w-4 h-4 mr-3 text-gray-400" />
                          <a href={`mailto:${learner.Email_Add}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate">{learner.Email_Add}</a>
                        </div>
                      )}
                      {learner.Address && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                          <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="truncate">{learner.Address}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                        <span>Cohort {learner.COHORT_NO}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6 w-full justify-center">
                      {learner.LinkedIn_url && (
                        <a href={learner.LinkedIn_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-700 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {learner.Facebook_url && (
                        <a href={learner.Facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-700 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Projects & Cohort */}
                  <div className="md:w-2/3 p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                        Initiated Projects
                      </h3>
                      
                      {projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {projects.map((proj, pIdx) => (
                            <div key={pIdx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                                {proj.Project_Image_Url ? (
                                  <img 
                                    src={proj.Project_Image_Url} 
                                    alt={proj.Project} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${proj.Project.replace(/\s/g, '')}/400/300`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {proj.Status}
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2" title={proj.Project}>{proj.Project}</h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">No projects recorded yet.</p>
                      )}
                    </div>

                    {/* Cohort Image Section */}
                    {cohortImg && (
                      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Cohort {learner.COHORT_NO} Photo
                        </h3>
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                          <img 
                            src={cohortImg} 
                            alt={`Cohort ${learner.COHORT_NO}`} 
                            className="w-full h-full object-cover object-center"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
