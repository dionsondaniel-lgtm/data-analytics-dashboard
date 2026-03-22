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
import { Portal } from './components/Portal';
import { Home } from './components/Home';
import { Attendance } from './components/Attendance';
import { Practices } from './components/Practices';
import { Projects } from './components/Projects';
import { Learners } from './components/Learners';
import { Alumni } from './components/Alumni';
import { Mentors } from './components/Mentors';
import { About } from './components/About';
import Projecters from './components/Projecters';
import { TimeMarquee } from './components/TimeMarquee';
import { fetchSheetData, getStoredGIDs } from './services/GoogleSheetService';
import { transformAttendance, transformPractice, transformProjects, calculateOverallMetrics } from './services/DataTransformer';
import { AppState, ViewType, TransformedAttendance, TransformedPractice, TransformedProject, Learner, AlumniProject, AllCohortsPhoto, CohortImage } from './types';
import { Loader2, Download, PlayCircle, Moon, Sun } from 'lucide-react'; // Added Moon/Sun icons
import { exportDashboardToPDF } from './utils/pdfExport';

// --- Helpers ---
export const getDriveImageUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return null;
};

export const getHDImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/thumbnail') && !url.includes('sz=')) return `${url}&sz=w1000`;
  return url;
};

export default function App() {
  const [state, setState] = useState<AppState>({
    selectedCohort: null,
    selectedModule: null,
    selectedTeam: null,
    currentView: 'Portal'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoReportOpen, setIsAutoReportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Local state for theme to sync the toggle button immediately
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('app_theme') as 'light' | 'dark') || 'dark'
  );

  // Data states
  const [attendanceData, setAttendanceData] = useState<TransformedAttendance[]>([]);
  const [practiceData, setPracticeData] = useState<TransformedPractice[]>([]);
  const [projectData, setProjectData] = useState<TransformedProject[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [alumniProjects, setAlumniProjects] = useState<AlumniProject[]>([]);
  const [cohortPhotos, setCohortPhotos] = useState<AllCohortsPhoto[]>([]);
  const [cohortImages, setCohortImages] = useState<CohortImage[]>([]);

  // --- Theme Listener & Initial Apply ---
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('app_theme') || 'dark';
      setCurrentTheme(theme as 'light' | 'dark');
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

  // --- Toggle Theme Function ---
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app_theme', newTheme);
    
    // Notify application
    window.dispatchEvent(new Event('settings_updated'));
    
    // Explicitly update class for immediate feedback if event is slow
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setCurrentTheme(newTheme);
  };

  const normalizeCohort = (c: string | null) => {
    if (!c) return '';
    const match = String(c).match(/\d+/);
    return match ? match[0] : String(c).toUpperCase();
  };

  // --- Main Data Loader ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gids = getStoredGIDs();

      const [learnersRaw, alumniRaw, photosRaw, cohortImagesRaw] = await Promise.all([
        fetchSheetData('Learners detail to BQ'),
        fetchSheetData('Alumni Project to BQ'),
        fetchSheetData('AllCohortsphototoBQ'),
        fetchSheetData('Cohort images to BQ')
      ]);

      setLearners((learnersRaw as any[]).map(row => ({
        NAME: row['NAME'] || row['Name'] || 'Unknown',
        COMPANY: row['COMPANY'] || '',
        DESIGNATION: row['DESIGNATION'] || '',
        Address: row['Address'] || '',
        Cellphone_No: row['Cellphone_No.'] || row['Cellphone_No'] || '',
        Email_Add: row['Email_Add'] || '',
        LinkedIn_url: row['LinkedIn_url'] || '',
        Facebook_url: row['Facebook_url'] || '',
        COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || '').toUpperCase()
      })));

      setAlumniProjects((alumniRaw as any[]).map(row => ({
        Project: row['Project'] || '',
        Status: row['Status'] || '',
        Project_Image_Ref: row['Project Image Ref'] || '',
        Project_Image_Url: getHDImageUrl(row['Project Image Url'] || '') || getDriveImageUrl(row['Project Image Ref'] || ''),
        Staff_1_to_10: row['Staff_1_to_10'] || ''
      })));

      setCohortPhotos((photosRaw as any[]).map(row => ({
        NAME: row['NAME'] || '',
        COMPANY: row['COMPANY'] || '',
        REF_1: row['REF 1'] || '',
        IMAGE_URL: getHDImageUrl(row['IMAGE URL'] || '') || getDriveImageUrl(row['REF 1'] || ''),
        COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || '').toUpperCase()
      })));

      setCohortImages((cohortImagesRaw as any[]).map(row => ({
        Cohort_no: String(row['Cohort no.'] || row['Cohort_no'] || '').toUpperCase(),
        Reference: row['Reference'] || '',
        image_url: getHDImageUrl(row['image_url'] || '') || getDriveImageUrl(row['Reference'] || '')
      })));

      const attData: TransformedAttendance[] = [];
      const pracData: TransformedPractice[] = [];
      const projData: TransformedProject[] = [];
      const fetchTasks: (() => Promise<void>)[] = [];

      for (const [key, gid] of Object.entries(gids)) {
        if (!gid || gid.trim() === '') continue;

        const moduleMatch = key.match(/^(SQL|Python|PBI|Power\s*BI|Excel)/i);
        const cohortMatch = key.match(/-\s*([A-Za-z0-9]+)$/i);
        
        if (moduleMatch && cohortMatch) {
          let modName = moduleMatch[1].toUpperCase();
          if (modName.includes("POWER") || modName === "POWERBI") modName = "PBI";
          
          const cohort = cohortMatch[1].toUpperCase();

          if (key.toLowerCase().includes('attendance')) {
            fetchTasks.push(async () => {
              const raw = await fetchSheetData(key);
              attData.push(...transformAttendance(raw, modName, cohort));
            });
          } else if (key.toLowerCase().includes('class practice')) {
            fetchTasks.push(async () => {
              const raw = await fetchSheetData(key);
              pracData.push(...transformPractice(raw, modName, 'Class Practice', cohort));
            });
          } else if (key.toLowerCase().includes('home practice')) {
            fetchTasks.push(async () => {
              const raw = await fetchSheetData(key);
              pracData.push(...transformPractice(raw, modName, 'Home Practice', cohort));
            });
          }
        }

        const projMatch = key.match(/^Summary\s+Projects?\s+to\s+BQ\s*-\s*([A-Za-z0-9]+)$/i);
        if (projMatch) {
          fetchTasks.push(async () => {
            const raw = await fetchSheetData(key);
            projData.push(...transformProjects(raw, projMatch[1].toUpperCase()));
          });
        }
      }

      const BATCH_SIZE = 5;
      for (let i = 0; i < fetchTasks.length; i += BATCH_SIZE) {
        await Promise.all(fetchTasks.slice(i, i + BATCH_SIZE).map(task => task()));
      }

      setAttendanceData(attData);
      setPracticeData(pracData);
      setProjectData(projData);

    } catch (err) {
      console.error(err);
      setError('Critical: Failed to sync Master Database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- FILTER LOGIC ---
  const selCohort = normalizeCohort(state.selectedCohort);
  const selModule = state.selectedModule?.toUpperCase() === "POWER BI" ? "PBI" : state.selectedModule?.toUpperCase();

  const filteredAtt = attendanceData.filter(d => 
    (!selCohort || normalizeCohort(d.COHORT_NO) === selCohort) &&
    (!selModule || d.MODULE.toUpperCase() === selModule)
  );

  const filteredPrac = practiceData.filter(d => 
    (!selCohort || normalizeCohort(d.COHORT_NO) === selCohort) &&
    (!selModule || d.MODULE.toUpperCase() === selModule) &&
    (state.currentView === 'Class Practice' || state.currentView === 'Home Practice' ? d.TYPE === state.currentView : true)
  );

  const filteredProj = projectData.filter(d => 
    (!selCohort || normalizeCohort(d.COHORT_NO) === selCohort) &&
    (!selModule || d.MODULE.toUpperCase() === selModule)
  );

  const filteredLearners = learners.filter(d => 
    (!selCohort || normalizeCohort(d.COHORT_NO) === selCohort)
  );

  const availableCohorts = useMemo(() => {
    const cohorts = new Set<string>();
    learners.forEach(l => { if (l.COHORT_NO) cohorts.add(normalizeCohort(l.COHORT_NO)); });
    return Array.from(cohorts).sort((a, b) => parseInt(a) - parseInt(b));
  }, [learners]);

  const metrics = calculateOverallMetrics(filteredAtt, filteredPrac, filteredProj);
  const handleSelectView = (view: ViewType) => setState(s => ({ ...s, currentView: view }));

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPDF('dashboard-content', { cohort: state.selectedCohort, module: state.selectedModule });
    } finally {
      setIsExporting(false);
    }
  };

  // --- View Rendering ---
  const renderContent = () => {
    if (state.currentView === 'Settings') return <Settings onSave={loadData} />;
    if (state.currentView === 'User Manual') return <UserManual />;

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Master Database...</p>
      </div>
    );

    switch (state.currentView) {
      case 'Portal': return <Portal metrics={metrics} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Home': return (
        <Home 
          metrics={metrics} 
          learners={filteredLearners} 
          attendanceData={filteredAtt} 
          practiceData={filteredPrac} 
          projectData={filteredProj} 
          onNavigate={handleSelectView} 
          currentView={state.currentView} 
        />
      );
      case 'Attendance': return <Attendance metrics={metrics} learners={filteredLearners} attendanceData={filteredAtt} cohortPhotos={cohortPhotos} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Practices': return <Practices metrics={metrics} learners={filteredLearners} practiceData={filteredPrac} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Learners': return <Learners metrics={metrics} learners={filteredLearners} attendanceData={filteredAtt} practiceData={filteredPrac} cohortPhotos={cohortPhotos} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Alumni': return <Alumni metrics={metrics} learners={filteredLearners} attendanceData={filteredAtt} practiceData={filteredPrac} cohortPhotos={cohortPhotos} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Projects': return <Projects metrics={metrics} learners={filteredLearners} projectData={filteredProj} alumniProjects={alumniProjects} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Mentors': return <Mentors metrics={metrics} learners={filteredLearners} attendanceData={filteredAtt} practiceData={filteredPrac} cohortPhotos={cohortPhotos} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'About': return <About metrics={metrics} learners={filteredLearners} cohortPhotos={cohortPhotos} onNavigate={handleSelectView} currentView={state.currentView} />;
      case 'Projecters': return <Projecters onNavigate={handleSelectView} currentView={state.currentView} learners={learners} />;
      case 'Attendance Table' as any: return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'Total_Lesson_Sum', 'Overall_Sum', 'Attendance_Rate']} data={filteredAtt} />;
      case 'Class Practice':
      case 'Home Practice': return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'TYPE', 'Total_Required', 'Total_Submitted', 'Rate_of_Submission', 'Average_DayDiff']} data={filteredPrac} />;
      case 'Summary Projects': return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'Status', 'DayDiff', 'GPA']} data={filteredProj} />;
      case 'Alumni Projects': return <ImageGrid alumniProjects={alumniProjects} />;
      case 'Profiles': return <Profiles learners={filteredLearners} cohortPhotos={cohortPhotos} alumniProjects={alumniProjects} cohortImages={cohortImages} />;
      case 'Learners Detail': return <DataTable columns={['NAME', 'COMPANY', 'DESIGNATION', 'Address', 'Cellphone_No', 'Email_Add', 'LinkedIn_url', 'Facebook_url', 'COHORT_NO']} data={filteredLearners} />;
      default: return <Portal metrics={metrics} onNavigate={handleSelectView} currentView={state.currentView} />;
    }
  };

  const subHeader = state.currentView === 'Portal' ? <TimeMarquee /> : undefined;

  return (
    <div id="dashboard-content">
      <DashboardLayout
        currentView={state.currentView}
        selectedCohort={state.selectedCohort}
        selectedModule={state.selectedModule}
        onSelectView={handleSelectView}
        onSelectCohort={(c) => setState(s => ({ ...s, selectedCohort: c }))}
        onSelectModule={(m) => setState(s => ({ ...s, selectedModule: m }))}
        availableCohorts={availableCohorts}
        headerActions={(
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsAutoReportOpen(true)} className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 transition-colors">
              <PlayCircle className="w-4 h-4 mr-1.5" /> Auto Report
            </button>
            
            {/* ELEGANT THEME TOGGLE SWITCH */}
            <button 
              onClick={toggleTheme}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-indigo-600 dark:text-indigo-400"
              title={currentTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button onClick={handleDownloadPDF} disabled={isExporting} className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Download className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        )}
        subHeader={subHeader}
      >
        {renderContent()}
      </DashboardLayout>
      <AutoReport isOpen={isAutoReportOpen} onClose={() => setIsAutoReportOpen(false)} metrics={metrics} filters={{ cohort: state.selectedCohort, module: state.selectedModule }} />
    </div>
  );
}