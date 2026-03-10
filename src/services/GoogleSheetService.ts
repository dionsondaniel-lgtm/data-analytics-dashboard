import Papa from 'papaparse';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1kUXcCxH3b8AzSnObYGt6CmL7x7BiPByjmLUPFNXfVqE/export?format=csv&gid=';

// Placeholder GIDs, to be filled later
export const DEFAULT_GIDS: Record<string, string> = {
  'Alumni Project to BQ': '',
  'Learners detail to BQ': '',
  'Cohort images to BQ': '',
  'AllCohortsphototoBQ': '',
  'Lesson Details to BQ': '',
  // Cohort 1
  'Summary Project to BQ - 1': '',
  'Python Class Practice to BQ - 1': '',
  'PBI Class Practice to BQ - 1': '',
  'Excel Home Practice to BQ - 1': '',
  'Excel Class Practice to BQ - 1': '',
  'SQL Home Practice to BQ - 1': '',
  'SQL Class Practice to BQ - 1': '',
  'Python Attendance to BQ - 1': '',
  'PBI Attendance to BQ - 1': '',
  'Excel Attendance to BQ - 1': '',
  'SQL Attendance to BQ - 1': '',
  // Add more cohorts as needed
};

export const getStoredGIDs = (): Record<string, string> => {
  const stored = localStorage.getItem('dashboard_sheet_gids');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored GIDs', e);
    }
  }
  return DEFAULT_GIDS;
};

export const saveStoredGIDs = (gids: Record<string, string>) => {
  localStorage.setItem('dashboard_sheet_gids', JSON.stringify(gids));
};

export const fetchSheetData = async (sheetName: string): Promise<any[]> => {
  const gids = getStoredGIDs();
  const gid = gids[sheetName];
  if (!gid) {
    console.warn(`No GID found for sheet: ${sheetName}`);
    return [];
  }

  const url = `${BASE_URL}${gid}`;

  return new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // If the response is HTML (e.g., error page for invalid GID), it might parse as a single column with HTML tags
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

        // Trim all string values
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
        console.error(`Error fetching sheet ${sheetName}:`, error);
        resolve([]); // Resolve with empty array to prevent app crash
      }
    });
  });
};
