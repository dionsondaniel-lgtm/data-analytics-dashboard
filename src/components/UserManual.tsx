import React from 'react';
import { BookOpen, Settings as SettingsIcon, Filter, Database, FileSpreadsheet } from 'lucide-react';

export const UserManual: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 max-w-4xl mx-auto space-y-12 transition-colors">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
          <BookOpen className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">User Manual</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Welcome to the Data Analytics Dashboard. This guide will help you set up your data sources and navigate the reporting features.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <Database className="h-6 w-6 mr-3 text-indigo-500 dark:text-indigo-400" />
            1. Introduction
          </h2>
          <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              This dashboard is designed to read data directly from a public Google Sheet, process it, and visualize it using interactive charts and tables. It provides a comprehensive overview of learner attendance, practice submissions, and project performance across different cohorts and modules.
            </p>
            <p>
              Because the data is fetched directly from Google Sheets, you don't need a complex backend database. You simply update your Google Sheets, and the dashboard reflects those changes in real-time.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <SettingsIcon className="h-6 w-6 mr-3 text-indigo-500 dark:text-indigo-400" />
            2. Setting up GIDs
          </h2>
          <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              To connect your Google Sheets to the dashboard, you need to configure the <strong>GIDs</strong>. A GID is a unique identifier for a specific tab (sheet) within a Google Spreadsheet.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 my-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                How to find a GID:
              </h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open your Google Spreadsheet in your browser.</li>
                <li>Navigate to the specific tab (sheet) you want to link.</li>
                <li>Look at the URL in your browser's address bar.</li>
                <li>Find the part that says <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">gid=...</code> at the very end.</li>
                <li>The number after the equals sign is your GID. (e.g., in <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">.../edit#gid=123456789</code>, the GID is <strong>123456789</strong>).</li>
              </ol>
            </div>
            <p>
              Go to the <strong>GID Settings</strong> page from the sidebar. Enter the corresponding GID for each sheet name. If you don't have data for a specific sheet yet, you can leave it blank. The dashboard will gracefully handle missing data.
            </p>
            <p>
              <strong>Adding New Cohorts:</strong> You can add custom sheets by clicking "Add Custom Sheet" in the settings. Use the naming convention <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">[Module] [Type] to BQ - [Cohort Number]</code> (e.g., <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">Python Attendance to BQ - 2</code>).
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <Filter className="h-6 w-6 mr-3 text-indigo-500 dark:text-indigo-400" />
            3. Filtering and Reporting
          </h2>
          <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              The sidebar allows you to filter the data presented in the dashboard. You can drill down into specific cohorts or modules to see targeted metrics.
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>App Overview:</strong> Shows aggregated metrics across all selected data. If no filters are applied, it shows data for the entire program.
              </li>
              <li>
                <strong>By Cohort:</strong> Expand this section to select a specific cohort (e.g., Cohort 1). All charts and tables will instantly update to show only data relevant to that cohort.
              </li>
              <li>
                <strong>By Module:</strong> Expand this section to filter by subject matter (e.g., SQL, Python, Excel, PBI).
              </li>
              <li>
                <strong>Detailed Views:</strong> Use the links under "App Configuration" to view raw data tables for Attendance, Class Practice, Home Practice, Summary Projects, and Learner Details. These tables respect your active Cohort and Module filters.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <Database className="h-6 w-6 mr-3 text-indigo-500 dark:text-indigo-400" />
            4. Local Development
          </h2>
          <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              If you have downloaded this project to run locally:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Ensure you have Node.js installed on your machine.</li>
              <li>Open your terminal and navigate to the project directory.</li>
              <li>Run <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">npm install</code> to install all necessary dependencies (React, Tailwind CSS, Recharts, Lucide, etc.).</li>
              <li>Run <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">npm run dev</code> to start the local development server.</li>
              <li>Open your browser to the local address provided (usually <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">http://localhost:5173</code> or <code className="dark:bg-gray-800 dark:text-gray-200 px-1 rounded">http://localhost:3000</code>).</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
              Note: Tailwind CSS is already configured and ready to use. Any changes you make to the components will be reflected immediately thanks to Vite's Hot Module Replacement (HMR).
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
