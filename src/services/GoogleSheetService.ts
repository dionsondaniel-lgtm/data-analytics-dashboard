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
  "SQL Attendance To BQ - 5": "510646361"
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
