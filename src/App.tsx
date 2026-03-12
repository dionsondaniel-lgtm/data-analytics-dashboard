import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { MetricsOverview } from './components/MetricsOverview';
import { RechartsViews } from './components/RechartsViews';
import { ImageGrid } from './components/ImageGrid';
import { DataTable } from './components/DataTable';
import { Settings } from './components/Settings';
import { UserManual } from './components/UserManual';
import { fetchSheetData, getStoredGIDs } from './services/GoogleSheetService';
import { transformAttendance, transformPractice, transformProjects, calculateOverallMetrics } from './services/DataTransformer';
import { AppState, ViewType, TransformedAttendance, TransformedPractice, TransformedProject, Learner, AlumniProject, AllCohortsPhoto } from './types';
import { Loader2 } from 'lucide-react';

export const getDriveImageUrl = (url: string) => {
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
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

  // Apply theme on initial load and listen for changes
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('app_theme') || 'light';
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gids = getStoredGIDs();

      // Fetch base data
      const [learnersRaw, alumniRaw, photosRaw] = await Promise.all([
        fetchSheetData('Learners detail to BQ'),
        fetchSheetData('Alumni Project to BQ'),
        fetchSheetData('AllCohortsphototoBQ')
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

      const alumniMapped = (alumniRaw as any[]).map(row => ({
        Project: row['Project'] || '',
        Status: row['Status'] || '',
        Project_Image_Ref: row['Project Image Ref'] || row['Project_Image_Ref'] || '',
        Project_Image_Url: getDriveImageUrl(row['Project Image Ref'] || row['Project_Image_Ref'] || ''),
        Staff_1_to_10: row['Staff_1_to_10'] || ''
      }));

      const photosMapped = (photosRaw as any[]).map(row => ({
        NAME: row['NAME'] || '',
        COMPANY: row['COMPANY'] || '',
        REF_1: row['REF 1'] || row['REF_1'] || '',
        IMAGE_URL: getDriveImageUrl(row['REF 1'] || row['REF_1'] || ''),
        COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || row['COHORT NO'] || '').toUpperCase()
      }));

      setLearners(learnersMapped);
      setAlumniProjects(alumniMapped);
      setCohortPhotos(photosMapped);

      // Fetch dynamic cohort data based on configured GIDs
      const attData: TransformedAttendance[] = [];
      const pracData: TransformedPractice[] = [];
      const projData: TransformedProject[] = [];

      const fetchPromises: Promise<void>[] = [];

      for (const [key, gid] of Object.entries(gids)) {
        if (!gid || typeof gid !== 'string' || gid.trim() === '') continue;

        // Check for Attendance
        const attMatch = key.match(/^(SQL|Python|PBI|Excel)\s+Attendance\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (attMatch) {
          const mod = attMatch[1];
          const cohort = attMatch[2].toUpperCase();
          fetchPromises.push(
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
          fetchPromises.push(
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
          fetchPromises.push(
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
          fetchPromises.push(
            fetchSheetData(key).then(raw => {
              projData.push(...transformProjects(raw, cohort));
            })
          );
          continue;
        }
      }

      await Promise.all(fetchPromises);

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

    switch (state.currentView) {
      case 'Overview':
        return (
          <div className="space-y-6">
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
                <ImageGrid alumniProjects={alumniProjects.slice(0, 4)} cohortPhotos={cohortPhotos.slice(0, 4)} />
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
      case 'Learners Detail':
        return <DataTable columns={['NAME', 'COMPANY', 'DESIGNATION', 'Address', 'Cellphone_No', 'Email_Add', 'LinkedIn_url', 'Facebook_url', 'COHORT_NO']} data={filteredLearners} />;
      default:
        return <div>Select a view from the sidebar.</div>;
    }
  };

  return (
    <DashboardLayout
      currentView={state.currentView}
      selectedCohort={state.selectedCohort}
      selectedModule={state.selectedModule}
      onSelectView={handleSelectView}
      onSelectCohort={handleSelectCohort}
      onSelectModule={handleSelectModule}
      availableCohorts={availableCohorts.length > 0 ? availableCohorts : undefined}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
