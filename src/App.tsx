// src/App.tsx

import Papa from 'papaparse';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1kUXcCxH3b8AzSnObYGt6CmL7x7BiPByjmLUPFNXfVqE/export?format=csv&gid=';

// Placeholder GIDs, to be filled later
export const DEFAULT_GIDS: Record<string, string> = {
  "Alumni Project to BQ": "1563795676",
  "Learners detail to BQ": "1245766494",
  "Cohort images to BQ": "45264196",
  "AllCohortsphototoBQ": "234813605",
  "Lesson Details to BQ": "400904442",
  "Summary Project to BQ - 1": "899198731",
  "Python Class Practice to BQ - 1": "364465039",
  "PBI Class Practice to BQ - 1": "1647685920",
  "Excel Home Practice to BQ - 1": "1277811500",
  "Excel Class Practice to BQ - 1": "542263215",
  "SQL Home Practice to BQ - 1": "1756184976",
  "SQL Class Practice to BQ - 1": "2108769113",
  "Python Attendance to BQ - 1": "1004516540",
  "PBI Attendance to BQ - 1": "246998359",
  "Excel Attendance to BQ - 1": "1007783101",
  "SQL Attendance to BQ - 1": "2057316276",
  "Summary Project to BQ - 2": "156259053",
  "Python Class Practice to BQ - 2": "1229123528",
  "PBI Class Practice to BQ - 2": "884426422",
  "Excel Home Practice to BQ - 2": "1025479425",
  "Excel Class Practice to BQ - 2": "1065031375",
  "SQL Home Practice to BQ - 2": "1878938541",
  "SQL Class Practice to BQ - 2": "562002542",
  "Python Attendance to BQ - 2": "915621869",
  "PBI Attendance to BQ - 2": "1321755481",
  "Excel Attendance to BQ - 2": "1167106269",
  "SQL Attendance to BQ - 2": "974310832",
  "Summary Project to BQ - 3": "920401601",
  "Python Class Practice to BQ - 3": "903360901",
  "PBI Class Practice to BQ - 3": "1544614136",
  "Excel Home Practice to BQ - 3": "805336467",
  "Excel Class Practice to BQ - 3": "322584067",
  "SQL Home Practice to BQ - 3": "1093171656",
  "SQL Class Practice to BQ - 3": "153593135",
  "Python Attendance to BQ - 3": "1880967685",
  "PBI Attendance to BQ - 3": "703262523",
  "Excel Attendance to BQ - 3": "1244143885",
  "SQL Attendance to BQ - 3": "832165842",
  "Summary Project to BQ - 4": "45096893",
  "Python Class Practice to BQ - 4": "52969388",
  "PBI Class Practice to BQ - 4": "158916836",
  "Excel Home Practice to BQ - 4": "529534035",
  "Excel Class Practice to BQ - 4": "1937021404",
  "SQL Home Practice to BQ - 4": "1638435623",
  "SQL Class Practice to BQ - 4": "670625255",
  "Python Attendance To BQ - 4": "1077360614",
  "PBI Attendance To BQ - 4": "550435936",
  "Excel Attendance To BQ - 4": "1964136017",
  "SQL Attendance To BQ - 4": "0",
  "SQL Class Practice to BQ - 5": "2069441620",
  "SQL Attendance To BQ - 5": "510646361",
  "Excel Attendance To BQ - 5": "354369398",
  "Excel Class Practice to BQ - 5": "1119464560"
};

export const getStoredGIDs = (): Record<string, string> => {
  const stored = localStorage.getItem('dashboard_sheet_gids');
  let mergedGids = { ...DEFAULT_GIDS };

  if (stored) {
    try {
      const parsedGids = JSON.parse(stored);
      // Merge existing user saved config on top of the defaults
      mergedGids = { ...DEFAULT_GIDS, ...parsedGids };
    } catch (e) {
      console.error('Failed to parse stored GIDs', e);
    }
  }

  // Auto-save merged configuration on init load to ensure new defaults are registered
  localStorage.setItem('dashboard_sheet_gids', JSON.stringify(mergedGids));

  return mergedGids;
};

export const saveStoredGIDs = (gids: Record<string, string>) => {
  localStorage.setItem('dashboard_sheet_gids', JSON.stringify(gids));
};

export const fetchSheetData = async (sheetName: string, retries = 3): Promise<any[]> => {
  const gids = getStoredGIDs();
  const gid = gids[sheetName];
  if (!gid) {
    console.warn(`No GID found for sheet: ${sheetName}`);
    return [];
  }

  const url = `${BASE_URL}${gid}`;

  const attemptFetch = async (attempt: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const firstRow = results.data[0] as any;
            const keys = Object.keys(firstRow);
            if (keys.length > 0) {
              const firstKey = keys[0].trim().toLowerCase();
              if (firstKey.includes('<!doctype html') || firstKey.includes('<html') || firstKey.includes('google.com')) {
                console.warn(`Sheet ${sheetName} returned HTML instead of CSV. Check the GID.`);
                resolve([]);
                return;
              }
            }
          }

          const cleanedData = results.data.map((row: any) => {
            const cleanedRow: any = {};
            for (const key in row) {
              if (Object.prototype.hasOwnProperty.call(row, key)) {
                const value = row[key];
                const cleanedKey = key.trim();
                cleanedRow[cleanedKey] = typeof value === 'string' ? value.trim() : value;
              }
            }
            return cleanedRow;
          });
          resolve(cleanedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  for (let i = 0; i < retries; i++) {
    try {
      return await attemptFetch(i);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for sheet ${sheetName}:`, error);
      if (i === retries - 1) {
        console.error(`Error fetching sheet ${sheetName}:`, error);
        return [];
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000 + Math.random() * 1000));
    }
  }
  return [];
};


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // <-- NEW: Imported framer-motion
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
import { AIAgents } from './components/AIAgents';
import LandingPage from './components/LandingPage';
import { transformAttendance, transformPractice, transformProjects, calculateOverallMetrics } from './services/DataTransformer';
import { AppState, ViewType, TransformedAttendance, TransformedPractice, TransformedProject, Learner, AlumniProject, AllCohortsPhoto, CohortImage } from './types';
import { Loader2, Download, PlayCircle, Moon, Sun } from 'lucide-react';
import { exportDashboardToPDF } from './utils/pdfExport';

// --- Helpers ---
export const getDriveImageUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return null;
};

export const getHDImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com/thumbnail') && !url.includes('sz=')) return `${url}&sz=w1000`;
  return url;
};

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(
    localStorage.getItem('dashboard_authorized') === 'true'
  );

  const handleAccessGranted = () => {
    setIsAuthorized(true);
    localStorage.setItem('dashboard_authorized', 'true');
  };

  // <-- NEW: Added handleLogout logic -->
  const handleLogout = () => {
    localStorage.removeItem('dashboard_authorized');
    setIsAuthorized(false);
  };

  const [state, setState] = useState<AppState>({
    selectedCohort: null,
    selectedModule: null,
    selectedTeam: null,
    currentView: 'Portal'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoReportOpen, setIsAutoReportOpen] = useState(false);
  const [isAIAgentsOpen, setIsAIAgentsOpen] = useState(false);
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
        Project_Image_Url: getHDImageUrl(row['Project Image Url'] || '') || getDriveImageUrl(row['Project Image Ref'] || '') || '',
        Staff_1_to_10: row['Staff_1_to_10'] || ''
      })));

      setCohortPhotos((photosRaw as any[]).map(row => ({
        NAME: row['NAME'] || '',
        COMPANY: row['COMPANY'] || '',
        REF_1: row['REF 1'] || '',
        IMAGE_URL: getHDImageUrl(row['IMAGE URL'] || '') || getDriveImageUrl(row['REF 1'] || '') || '',
        COHORT_NO: String(row['COHORT NO.'] || row['COHORT_NO'] || '').toUpperCase()
      })));

      setCohortImages((cohortImagesRaw as any[]).map(row => ({
        Cohort_no: String(row['Cohort no.'] || row['Cohort_no'] || '').toUpperCase(),
        Reference: row['Reference'] || '',
        image_url: getHDImageUrl(row['image_url'] || '') || getDriveImageUrl(row['Reference'] || '') || ''
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
    ((state.currentView as string) === 'Class Practice' || (state.currentView as string) === 'Home Practice' ? d.TYPE === (state.currentView as string) : true)
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
      case 'Class Practice' as any:
      case 'Home Practice' as any: return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'TYPE', 'Total_Required', 'Total_Submitted', 'Rate_of_Submission', 'Average_DayDiff']} data={filteredPrac} />;
      case 'Summary Projects' as any: return <DataTable columns={['NAME', 'COHORT_NO', 'MODULE', 'Status', 'DayDiff', 'GPA']} data={filteredProj} />;
      case 'Alumni Projects' as any: return <ImageGrid alumniProjects={alumniProjects} />;
      case 'Profiles' as any: return <Profiles learners={filteredLearners} cohortPhotos={cohortPhotos} alumniProjects={alumniProjects} cohortImages={cohortImages} />;
      case 'Learners Detail' as any: return <DataTable columns={['NAME', 'COMPANY', 'DESIGNATION', 'Address', 'Cellphone_No', 'Email_Add', 'LinkedIn_url', 'Facebook_url', 'COHORT_NO']} data={filteredLearners} />;
      
      default: return <Portal metrics={metrics} onNavigate={handleSelectView} currentView={state.currentView} />;
    }
  };

  const subHeader = state.currentView === 'Portal' ? <TimeMarquee /> : undefined;


  // <-- NEW: AnimatePresence Wrapper around the whole layout -->
  return (
    <AnimatePresence mode="wait">
      {!isAuthorized ? (
        <motion.div 
          key="landing-page" 
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }} 
          transition={{ duration: 0.4 }}
          className="w-full min-h-screen"
        >
          <LandingPage onAccessGranted={handleAccessGranted} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-app"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full h-screen"
        >
          <div id="dashboard-content" className="h-full w-full">
            <DashboardLayout
              currentView={state.currentView}
              selectedCohort={state.selectedCohort}
              selectedModule={state.selectedModule}
              onSelectView={handleSelectView}
              onSelectCohort={(c) => setState(s => ({ ...s, selectedCohort: c }))}
              onSelectModule={(m) => setState(s => ({ ...s, selectedModule: m }))}
              availableCohorts={availableCohorts}
              onToggleAIAgent={() => setIsAIAgentsOpen(!isAIAgentsOpen)}
              isAIAgentOpen={isAIAgentsOpen}
              onLogout={handleLogout} // Passed the logout logic to the layout
              headerActions={(
                <div className="flex items-center space-x-2">
                  <button onClick={() => setIsAutoReportOpen(true)} className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 transition-colors">
                    <PlayCircle className="w-4 h-4 mr-1.5" /> Auto Report
                  </button>
                  
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
            
            <AIAgents 
              isOpen={isAIAgentsOpen} 
              onClose={() => setIsAIAgentsOpen(false)}
              metrics={metrics}
              learners={filteredLearners}
              attendanceData={filteredAtt} 
              practiceData={filteredPrac} 
              projectData={filteredProj} 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}