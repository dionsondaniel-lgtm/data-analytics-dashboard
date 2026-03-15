import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { MetricsOverview } from './components/MetricsOverview';
import { RechartsViews } from './components/RechartsViews';
import { ImageGrid } from './components/ImageGrid';
import { Profiles } from './components/Profiles';
import { DataTable } from './components/DataTable';
import { Settings } from './components/Settings';
import { UserManual } from './components/UserManual';
import { AutoReport } from './components/AutoReport';
import Projecters from './components/Projecters';
import { TimeMarquee } from './components/TimeMarquee';
import { fetchSheetData, getStoredGIDs } from './services/GoogleSheetService';
import { transformAttendance, transformPractice, transformProjects, calculateOverallMetrics } from './services/DataTransformer';
import { AppState, ViewType, TransformedAttendance, TransformedPractice, TransformedProject, Learner, AlumniProject, AllCohortsPhoto, CohortImage } from './types';
import { Loader2, Download, PlayCircle } from 'lucide-react';
import { exportDashboardToPDF } from './utils/pdfExport';

export const getDriveImageUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return null;
};

export const getHDImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/thumbnail') && !url.includes('sz=')) {
    return `${url}&sz=w1000`;
  }
  return url;
};

export default function App() {
  const [state, setState] = useState<AppState>({
    selectedCohort: null,
    selectedModule: null,
    currentView: 'Overview'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoReportOpen, setIsAutoReportOpen] = useState(false);

  // Apply theme on initial load and listen for changes
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('app_theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    window.addEventListener('storage', applyTheme);
    window.addEventListener('settings_updated', applyTheme);

    return () => {
      window.removeEventListener('storage', applyTheme);
      window.removeEventListener('settings_updated', applyTheme);
    };
  }, []);

  // Data states
  const [attendanceData, setAttendanceData] = useState<TransformedAttendance[]>([]);
  const [practiceData, setPracticeData] = useState<TransformedPractice[]>([]);
  const [projectData, setProjectData] = useState<TransformedProject[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [alumniProjects, setAlumniProjects] = useState<AlumniProject[]>([]);
  const [cohortPhotos, setCohortPhotos] = useState<AllCohortsPhoto[]>([]);
  const [cohortImages, setCohortImages] = useState<CohortImage[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gids = getStoredGIDs();

      // Fetch base data
      const [learnersRaw, alumniRaw, photosRaw, cohortImagesRaw] = await Promise.all([
        fetchSheetData('Learners detail to BQ'),
        fetchSheetData('Alumni Project to BQ'),
        fetchSheetData('AllCohortsphototoBQ'),
        fetchSheetData('Cohort images to BQ')
      ]);

      const learnersMapped = (learnersRaw as any[]).map(row => ({
        NAME: row['NAME'] || row['Name'] || row['name'] || 'Unknown',
        COMPANY: row['COMPANY'] || '',
        DESIGNATION: row['DESIGNATION'] || '',
        Address: row['Address'] || '',
        Cellphone_No: row['Cellphone_No.'] || row['Cellphone_No'] || '',
        Email_Add: row['Email_Add'] || '',
        LinkedIn_url: row['LinkedIn_url'] || '',
        Facebook_url: row['Facebook_url'] || '',
        COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || row['COHORT NO'] || '').toUpperCase()
      }));

      const alumniMapped = (alumniRaw as any[]).map(row => {
        const imgUrl = row['Project Image Url'] || row['Project_Image_Url'] || '';
        const imgRef = row['Project Image Ref'] || row['Project_Image_Ref'] || '';
        
        // Combine Staff 1 to Staff 10
        const staffList: string[] = [];
        for (let i = 1; i <= 10; i++) {
          const staff = row[`Staff ${i}`] || row[`Staff_${i}`];
          if (staff && typeof staff === 'string' && staff.trim() !== '') {
            staffList.push(staff.trim());
          }
        }
        
        return {
          Project: row['Project'] || '',
          Status: row['Status'] || '',
          Project_Image_Ref: imgRef,
          // Prefer HD image from url, fallback to ref
          Project_Image_Url: getHDImageUrl(imgUrl) || getDriveImageUrl(imgRef),
          Staff_1_to_10: staffList.length > 0 ? staffList.join(', ') : (row['Staff_1_to_10'] || '')
        };
      });

      const photosMapped = (photosRaw as any[]).map(row => {
        const imgUrl = row['IMAGE URL'] || row['IMAGE_URL'] || '';
        const ref1 = row['REF 1'] || row['REF_1'] || '';
        
        return {
          NAME: row['NAME'] || '',
          COMPANY: row['COMPANY'] || '',
          REF_1: ref1,
          // Prefer HD image from url, fallback to ref
          IMAGE_URL: getHDImageUrl(imgUrl) || getDriveImageUrl(ref1),
          COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || row['COHORT NO'] || '').toUpperCase()
        };
      });

      const cohortImagesMapped = (cohortImagesRaw as any[]).map(row => {
        const imgUrl = row['image_url'] || row['IMAGE_URL'] || '';
        const ref = row['Reference'] || row['REFERENCE'] || '';
        // Prefer HD image from url, fallback to ref
        return {
          Cohort_no: String(row['Cohort no.'] || row['Cohort_no'] || row['COHORT NO'] || '').toUpperCase(),
          Reference: ref,
          image_url: getHDImageUrl(imgUrl) || getDriveImageUrl(ref)
        };
      });

      setLearners(learnersMapped);
      setAlumniProjects(alumniMapped);
      setCohortPhotos(photosMapped);
      setCohortImages(cohortImagesMapped);

      // Fetch dynamic cohort data based on configured GIDs
      const attData: TransformedAttendance[] = [];
      const pracData: TransformedPractice[] = [];
      const projData: TransformedProject[] = [];

      const fetchTasks: (() => Promise<void>)[] = [];

      for (const [key, gid] of Object.entries(gids)) {
        if (!gid || typeof gid !== 'string' || gid.trim() === '') continue;

        // Check for Attendance
        const attMatch = key.match(/^(SQL|Python|PBI|Excel)\s+Attendance\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (attMatch) {
          const mod = attMatch[1];
          const cohort = attMatch[2].toUpperCase();
          fetchTasks.push(() =>
            fetchSheetData(key).then(raw => {
              attData.push(...transformAttendance(raw, mod, cohort));
            })
          );
          continue;
        }

        // Check for Class Practice
        const cpMatch = key.match(/^(SQL|Python|PBI|Excel)\s+Class\s+Practice\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (cpMatch) {
          const mod = cpMatch[1];
          const cohort = cpMatch[2].toUpperCase();
          fetchTasks.push(() =>
            fetchSheetData(key).then(raw => {
              pracData.push(...transformPractice(raw, mod, 'Class Practice', cohort));
            })
          );
          continue;
        }

        // Check for Home Practice
        const hpMatch = key.match(/^(SQL|Python|PBI|Excel)\s+Home\s+Practice\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (hpMatch) {
          const mod = hpMatch[1];
          const cohort = hpMatch[2].toUpperCase();
          fetchTasks.push(() =>
            fetchSheetData(key).then(raw => {
              pracData.push(...transformPractice(raw, mod, 'Home Practice', cohort));
            })
          );
          continue;
        }

        // Check for Summary Project
        const projMatch = key.match(/^Summary\s+Projects?\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (projMatch) {
          const cohort = projMatch[1].toUpperCase();
          fetchTasks.push(() =>
            fetchSheetData(key).then(raw => {
              projData.push(...transformProjects(raw, cohort));
            })
          );
          continue;
        }
      }

      // Execute in batches of 5 to prevent rate limiting
      const BATCH_SIZE = 5;
      for (let i = 0; i < fetchTasks.length; i += BATCH_SIZE) {
        const batch = fetchTasks.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(task => task()));
      }

      setAttendanceData(attData);
      setPracticeData(pracData);
      setProjectData(projData);

    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if GIDs are configured, if not, show settings
    const gids = getStoredGIDs();
    const hasConfiguredGIDs = Object.values(gids).some(val => val.trim() !== '');
    
    if (!hasConfiguredGIDs) {
      setState(s => ({ ...s, currentView: 'Settings' }));
    }
    
    loadData();
  }, [loadData]);

  const availableCohorts = useMemo(() => {
    const cohorts = new Set<string>();
    learners.forEach(l => {
      if (l.COHORT_NO && l.COHORT_NO.trim() !== '') {
        const match = l.COHORT_NO.match(/\d+/);
        if (match) {
          cohorts.add(match[0]);
        } else {
          cohorts.add(l.COHORT_NO.toUpperCase());
        }
      }
    });
    return Array.from(cohorts).sort((a, b) => parseInt(a) - parseInt(b));
  }, [learners]);

  const handleSelectView = (view: ViewType) => setState(s => ({ ...s, currentView: view }));
  const handleSelectCohort = (cohort: string | null) => setState(s => ({ ...s, selectedCohort: cohort }));
  const handleSelectModule = (module: string | null) => setState(s => ({ ...s, selectedModule: module }));

  const handleSaveSettings = () => {
    loadData();
    // Optionally switch back to overview after saving
    // setState(s => ({ ...s, currentView: 'Overview' }));
  };

  // Filter data based on selection
  const normalizeCohort = (cohort: string | null | undefined) => {
    if (!cohort) return '';
    const match = String(cohort).match(/\d+/);
    return match ? match[0] : String(cohort).toUpperCase();
  };

  const selectedCohortNormalized = normalizeCohort(state.selectedCohort);

  const filteredAtt = attendanceData.filter(d => 
    (!state.selectedCohort || normalizeCohort(d.COHORT_NO) === selectedCohortNormalized) &&
    (!state.selectedModule || d.MODULE === state.selectedModule)
  );

  const filteredPrac = practiceData.filter(d => 
    (!state.selectedCohort || normalizeCohort(d.COHORT_NO) === selectedCohortNormalized) &&
    (!state.selectedModule || d.MODULE === state.selectedModule) &&
    (state.currentView === 'Overview' || d.TYPE === state.currentView)
  );

  const filteredProj = projectData.filter(d => 
    (!state.selectedCohort || normalizeCohort(d.COHORT_NO) === selectedCohortNormalized) &&
    (!state.selectedModule || d.MODULE === state.selectedModule)
  );

  const filteredLearners = learners.filter(d => 
    (!state.selectedCohort || normalizeCohort(d.COHORT_NO) === selectedCohortNormalized)
  );

  const metrics = calculateOverallMetrics(filteredAtt, filteredPrac, filteredProj);

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPDF('dashboard-content', {
        cohort: state.selectedCohort,
        module: state.selectedModule
      });
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const headerActions = (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsAutoReportOpen(true)}
        className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        <PlayCircle className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">Auto Report</span>
      </button>
      <button
        onClick={handleDownloadPDF}
        disabled={isExporting}
        className="group flex items-center justify-center p-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm overflow-hidden"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        ) : (
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        )}
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap">
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </span>
      </button>
    </div>
  );

  const renderContent = () => {
    if (state.currentView === 'Settings') {
      return <Settings onSave={handleSaveSettings} />;
    }

    if (state.currentView === 'User Manual') {
      return <UserManual />;
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      );
    }

    switch (state.currentView) {
      case 'Overview':
        return (
          <div id="dashboard-content" className="space-y-6 bg-white dark:bg-transparent p-1 rounded-xl">
            <MetricsOverview metrics={metrics} />
            <RechartsViews 
              attendanceData={filteredAtt} 
              practiceData={filteredPrac} 
              projectData={filteredProj}
              learnersData={learners}
              onSelectCohort={handleSelectCohort}
              onSelectModule={handleSelectModule}
              selectedCohort={state.selectedCohort}
              selectedModule={state.selectedModule}
            />
            {state.selectedCohort === null && state.selectedModule === null && (
              <div className="mt-8">
                <ImageGrid alumniProjects={alumniProjects} cohortPhotos={cohortPhotos} horizontal={true} />
              </div>
            )}
          </div>
        );
      case 'Attendance':
        return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'Total_Lesson_Sum', 'Overall_Sum', 'Attendance_Rate']} data={filteredAtt} />;
      case 'Class Practice':
      case 'Home Practice':
        return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'TYPE', 'Total_Required', 'Total_Submitted', 'Rate_of_Submission', 'Average_DayDiff']} data={filteredPrac} />;
      case 'Summary Projects':
        return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'Status', 'DayDiff', 'GPA']} data={filteredProj} />;
      case 'Alumni Projects':
        return <ImageGrid alumniProjects={alumniProjects} />;
      case 'Profiles':
        return <Profiles learners={filteredLearners} cohortPhotos={cohortPhotos} alumniProjects={alumniProjects} cohortImages={cohortImages} />;
      case 'Projecters':
        return <Projecters />;
      case 'Learners Detail':
        return <DataTable columns={['NAME', 'COMPANY', 'DESIGNATION', 'Address', 'Cellphone_No', 'Email_Add', 'LinkedIn_url', 'Facebook_url', 'COHORT_NO']} data={filteredLearners} />;
      default:
        return <div>Select a view from the sidebar.</div>;
    }
  };

  const subHeader = state.currentView === 'Overview' ? <TimeMarquee /> : undefined;

  return (
    <>
      <DashboardLayout
        currentView={state.currentView}
        selectedCohort={state.selectedCohort}
        selectedModule={state.selectedModule}
        onSelectView={handleSelectView}
        onSelectCohort={handleSelectCohort}
        onSelectModule={handleSelectModule}
        availableCohorts={availableCohorts.length > 0 ? availableCohorts : undefined}
        headerActions={headerActions}
        subHeader={subHeader}
      >
        {renderContent()}
      </DashboardLayout>
      
      <AutoReport 
        isOpen={isAutoReportOpen} 
        onClose={() => setIsAutoReportOpen(false)} 
        metrics={metrics}
        filters={{ cohort: state.selectedCohort, module: state.selectedModule }}
      />
    </>
  );
}
