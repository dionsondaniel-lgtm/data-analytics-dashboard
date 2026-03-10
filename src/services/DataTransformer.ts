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
  return rawData.map(row => {
    let totalRequired = 0;
    let totalSubmitted = 0;
    let totalDayDiff = 0;
    let validDiffs = 0;

    // We assume columns are paired like L1_REQDDATE, L1_SUBMDATE
    const reqKeys = Object.keys(row).filter(k => k.includes('REQDDATE') || k.includes('ReqdDate') || k.includes('reqddate'));
    
    reqKeys.forEach(reqKey => {
      const prefix = reqKey.split('_')[0]; // e.g., L1
      const submKey = Object.keys(row).find(k => k.startsWith(prefix) && (k.includes('SUBMDATE') || k.includes('SubmDate') || k.includes('submdate')));
      
      if (row[reqKey]) {
        totalRequired++;
        if (submKey && row[submKey]) {
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

  rawData.forEach(row => {
    modules.forEach(mod => {
      const reqDate = row[`${mod} Date Required`] || row[`${mod}_Date_Required`];
      const submDate = row[`${mod} Submitted`] || row[`${mod}_Submitted`];
      const totalScore = parseFloat(row[`${mod} Total Score`] || row[`${mod}_Total_Score`]);
      const actScore = parseFloat(row[`${mod} Score`] || row[`${mod}_Score`]);

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
