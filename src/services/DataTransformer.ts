import { TransformedAttendance, TransformedPractice, TransformedProject, OverallMetrics } from '../types';

// Helper to calculate days between two dates
const calculateDayDiff = (submDateStr: string, reqDateStr: string): number => {
  if (!submDateStr || !reqDateStr) return 0;
  const submDate = new Date(submDateStr);
  const reqDate = new Date(reqDateStr);
  if (isNaN(submDate.getTime()) || isNaN(reqDate.getTime())) return 0;
  const diffTime = submDate.getTime() - reqDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getName = (row: any): string => {
  return row['NAME'] || row['Name'] || row['name'] || row['Student Name'] || row['Learner Name'] || 'Unknown';
};

export const transformAttendance = (rawData: any[], moduleName: string, cohortNo: string): TransformedAttendance[] => {
  return rawData
    .filter(row => {
      const name = getName(row);
      return name && name.trim() !== '' && name !== 'Unknown';
    })
    .map(row => {
      let totalLessonSum = 0;
      let overallSum = 0;
      
      // Find columns that look like dates/lessons containing TRUE/FALSE
      for (const key in row) {
        const upperKey = key.toUpperCase();
        if (upperKey !== 'NAME' && upperKey !== 'COHORT_NO' && upperKey !== 'MODULE' && upperKey !== 'COHORT NO.') {
          const val = row[key]?.toUpperCase();
          if (val === 'TRUE' || val === 'FALSE') {
            overallSum++;
            if (val === 'TRUE') {
              totalLessonSum++;
            }
          }
        }
      }

      return {
        NAME: getName(row),
        COHORT_NO: cohortNo,
        MODULE: moduleName,
        Total_Lesson_Sum: totalLessonSum,
        Overall_Sum: overallSum,
        Attendance_Rate: overallSum > 0 ? (totalLessonSum / overallSum) * 100 : 0
      };
    });
};

export const transformPractice = (rawData: any[], moduleName: string, type: 'Class Practice' | 'Home Practice', cohortNo: string): TransformedPractice[] => {
  return rawData
    .filter(row => {
      const name = getName(row);
      return name && name.trim() !== '' && name !== 'Unknown';
    })
    .map(row => {
      let totalRequired = 0;
      let totalSubmitted = 0;
      let totalDayDiff = 0;
      let validDiffs = 0;

      // We assume columns are paired like L1_REQDDATE, L1_SUBMDATE or L1 Date Required, L1 Date Submitted
      const reqKeys = Object.keys(row).filter(k => {
        const upperK = k.toUpperCase();
        return upperK.includes('REQDDATE') || upperK.includes('DATE REQUIRED') || upperK.includes('DATE_REQUIRED');
      });
      
      reqKeys.forEach(reqKey => {
        const prefixMatch = reqKey.match(/^\s*(L\d+)/i);
        const prefix = prefixMatch ? prefixMatch[1] : reqKey.trim().split(/[_ ]/)[0]; // e.g., L1
        
        const submKey = Object.keys(row).find(k => {
          const upperK = k.toUpperCase();
          return k.trim().toUpperCase().startsWith(prefix.toUpperCase()) && (upperK.includes('SUBMDATE') || upperK.includes('DATE SUBMITTED') || upperK.includes('DATE_SUBMITTED'));
        });
        
        if (row[reqKey] && String(row[reqKey]).trim() !== '') {
          totalRequired++;
          if (submKey && row[submKey] && String(row[submKey]).trim() !== '') {
            totalSubmitted++;
            const dayDiff = calculateDayDiff(row[submKey], row[reqKey]);
            totalDayDiff += dayDiff;
            validDiffs++;
          }
        }
      });

      const avgDayDiff = validDiffs > 0 ? totalDayDiff / validDiffs : 0;

      return {
        NAME: getName(row),
        COHORT_NO: cohortNo,
        MODULE: moduleName,
        TYPE: type,
        Total_Required: totalRequired,
        Total_Submitted: totalSubmitted,
        Rate_of_Submission: totalRequired > 0 ? (totalSubmitted / totalRequired) * 100 : 0,
        Average_DayDiff: avgDayDiff,
        Average_WeekDiff: avgDayDiff / 7
      };
    });
};

export const transformProjects = (rawData: any[], cohortNo: string): TransformedProject[] => {
  const projects: TransformedProject[] = [];
  const modules = ['SQL', 'Excel', 'PBI', 'Python', 'BIT'];

  const findKey = (row: any, searchStrings: string[]) => {
    return Object.keys(row).find(k => {
      const cleanK = k.trim().toUpperCase();
      return searchStrings.some(s => cleanK === s.toUpperCase());
    });
  };

  rawData
    .filter(row => {
      const name = getName(row);
      return name && name.trim() !== '' && name !== 'Unknown';
    })
    .forEach(row => {
    modules.forEach(mod => {
      const reqDateKey = findKey(row, [`${mod} DATE REQUIRED`, `${mod}_DATE_REQUIRED`]);
      const submDateKey = findKey(row, [`${mod} SUBMITTED`, `${mod}_SUBMITTED`, `${mod} DATE SUBMITTED`, `${mod}_DATE_SUBMITTED`]);
      const totalScoreKey = findKey(row, [`${mod} TOTAL SCORE`, `${mod}_TOTAL_SCORE`]);
      const actScoreKey = findKey(row, [`${mod} SCORE`, `${mod}_SCORE`]);

      const reqDate = reqDateKey ? row[reqDateKey] : undefined;
      const submDate = submDateKey ? row[submDateKey] : undefined;
      const totalScore = totalScoreKey ? parseFloat(row[totalScoreKey]) : NaN;
      const actScore = actScoreKey ? parseFloat(row[actScoreKey]) : NaN;

      if (reqDate || submDate || !isNaN(totalScore)) {
        projects.push({
          NAME: getName(row),
          COHORT_NO: cohortNo,
          MODULE: mod,
          Status: submDate ? 'Submitted' : 'Missed',
          DayDiff: calculateDayDiff(submDate, reqDate),
          GPA: (!isNaN(actScore) && !isNaN(totalScore) && totalScore > 0) ? (actScore / totalScore) : 0
        });
      }
    });
  });

  return projects;
};

export const calculateOverallMetrics = (
  attendance: TransformedAttendance[],
  practice: TransformedPractice[],
  projects: TransformedProject[]
): OverallMetrics => {
  const avgAtt = attendance.length > 0 
    ? attendance.reduce((sum, a) => sum + a.Attendance_Rate, 0) / attendance.length 
    : 0;

  const avgSubm = practice.length > 0
    ? practice.reduce((sum, p) => sum + p.Rate_of_Submission, 0) / practice.length
    : 0;

  const validProjects = projects.filter(p => p.GPA > 0);
  const avgGPA = validProjects.length > 0
    ? validProjects.reduce((sum, p) => sum + p.GPA, 0) / validProjects.length
    : 0;

  return {
    Average_GPA: avgGPA,
    Overall_Attendance_Rate: avgAtt,
    Overall_Submission_Rate: avgSubm
  };
};
