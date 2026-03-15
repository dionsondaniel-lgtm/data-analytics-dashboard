// src/types.ts

export interface Learner {
  NAME: string;
  COMPANY: string;
  DESIGNATION: string;
  Address: string;
  Cellphone_No: string;
  Email_Add: string;
  LinkedIn_url: string;
  Facebook_url: string;
  COHORT_NO: string;
}

export interface AlumniProject {
  Project: string;
  Status: string;
  Project_Image_Ref: string;
  Project_Image_Url: string;
  Staff_1_to_10: string;
}

export interface CohortImage {
  Cohort_no: string;
  Reference: string;
  image_url: string;
}

export interface AllCohortsPhoto {
  NAME: string;
  COMPANY: string;
  REF_1: string;
  IMAGE_URL: string;
  COHORT_NO: string;
}

export interface LessonDetail {
  MODULE: string;
  LESSON_NO: string;
  DETAILS: string;
}

export interface TransformedAttendance {
  NAME: string;
  COHORT_NO: string;
  MODULE: string;
  Total_Lesson_Sum: number;
  Overall_Sum: number;
  Attendance_Rate: number;
}

export interface TransformedPractice {
  NAME: string;
  COHORT_NO: string;
  MODULE: string;
  TYPE: 'Class Practice' | 'Home Practice';
  Total_Required: number;
  Total_Submitted: number;
  Rate_of_Submission: number;
  Average_DayDiff: number;
  Average_WeekDiff: number;
}

export interface TransformedProject {
  NAME: string;
  COHORT_NO: string;
  MODULE: string;
  Status: string;
  DayDiff: number;
  GPA: number;
}

export interface OverallMetrics {
  Average_GPA: number;
  Overall_Attendance_Rate: number;
  Overall_Submission_Rate: number;
}

export type ViewType = 'Overview' | 'Attendance' | 'Class Practice' | 'Home Practice' | 'Summary Projects' | 'Alumni Projects' | 'Learners Detail' | 'Profiles' | 'Projecters' | 'Settings' | 'User Manual';

export interface AppState {
  selectedCohort: string | null;
  selectedModule: string | null;
  selectedTeam: string | null;
  currentView: ViewType;
}
