import React, { useState, useEffect, useRef } from 'react';
import { getStoredGIDs, saveStoredGIDs, DEFAULT_GIDS } from '../services/GoogleSheetService';
import { Save, Plus, Trash2, AlertCircle, Download, Upload, Image as ImageIcon, Moon, Sun } from 'lucide-react';

interface SettingsProps {
  onSave: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [gids, setGids] = useState<Array<{ key: string; value: string }>>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [bgImage, setBgImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getStoredGIDs();
    // Merge stored with defaults to ensure all default keys are present
    const merged = { ...DEFAULT_GIDS, ...stored };
    const gidArray = Object.entries(merged).map(([key, value]) => ({ key, value }));
    setGids(gidArray);

    // Load UI settings
    setTheme((localStorage.getItem('app_theme') as 'light' | 'dark') || 'light');
    setBgImage(localStorage.getItem('app_bg') || '');
  }, []);

  const handleValueChange = (index: number, newValue: string) => {
    const newGids = [...gids];
    newGids[index].value = newValue;
    setGids(newGids);
    setIsSaved(false);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newGids = [...gids];
    newGids[index].key = newKey;
    setGids(newGids);
    setIsSaved(false);
  };

  const handleAddRow = () => {
    setGids([...gids, { key: '', value: '' }]);
    setIsSaved(false);
  };

  const handleRemoveRow = (index: number) => {
    const newGids = [...gids];
    newGids.splice(index, 1);
    setGids(newGids);
    setIsSaved(false);
  };

  const handleSave = () => {
    const gidsObject: Record<string, string> = {};
    gids.forEach((item) => {
      if (item.key.trim() !== '') {
        gidsObject[item.key.trim()] = item.value.trim();
      }
    });
    saveStoredGIDs(gidsObject);
    
    // Save UI settings
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_bg', bgImage);
    
    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('settings_updated'));

    setIsSaved(true);
    onSave();
    
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportJSON = () => {
    const gidsObject: Record<string, string> = {};
    gids.forEach((item) => {
      if (item.key.trim() !== '') {
        gidsObject[item.key.trim()] = item.value.trim();
      }
    });
    
    const exportData = {
      gids: gidsObject,
      theme,
      bgImage
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wawiwa_dashboard_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.gids) {
          // Merge imported GIDs with defaults
          const merged = { ...DEFAULT_GIDS, ...json.gids };
          const gidArray = Object.entries(merged).map(([key, value]) => ({ key, value: value as string }));
          setGids(gidArray);
        }
        
        if (json.theme) setTheme(json.theme);
        if (json.bgImage !== undefined) setBgImage(json.bgImage);
        
        setIsSaved(false);
        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 max-w-4xl mx-auto transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configure GIDs, appearance, and import/export your configuration.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            className="hidden" 
          />
          <button
            onClick={handleExportJSON}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Appearance</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Image URL (Optional)</label>
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={bgImage}
                  onChange={(e) => { setBgImage(e.target.value); setIsSaved(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start h-fit">
          <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Important Note</p>
            <p>These settings are saved locally in your browser. If you clear your browser data, you will need to enter them again. Use the Export/Import features to backup your configuration or share it with others.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Google Sheet GIDs</h3>
        <div className="grid grid-cols-12 gap-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Sheet Name / Identifier</div>
          <div className="col-span-5">GID Value</div>
          <div className="col-span-1"></div>
        </div>

        {gids.map((item, index) => {
          const isDefault = Object.keys(DEFAULT_GIDS).includes(item.key);
          return (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="col-span-6">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  disabled={isDefault}
                  placeholder="e.g., Python Attendance to BQ - 2"
                  className={`w-full px-3 py-2 rounded-md border ${isDefault ? 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="e.g., 123456789"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {!isDefault && (
                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleAddRow}
          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Sheet
        </button>

        <div className="flex items-center space-x-4">
          {isSaved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Settings saved successfully!</span>}
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
