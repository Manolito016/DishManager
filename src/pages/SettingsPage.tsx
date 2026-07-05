import { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';
import { exportAllData, importAllData } from '../hooks/useDishes';
import { useToast } from '../context/ToastContext';
import type { ExportData } from '../hooks/useDishes';

export default function SettingsPage() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dish-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported successfully!', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      if (!data.dishes || !Array.isArray(data.dishes)) throw new Error('Invalid file format');
      await importAllData(data);
      toast(`Imported ${data.dishes.length} dishes successfully!`, 'success');
    } catch (err) {
      toast('Failed to import: invalid file format', 'error');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-text dark:text-text-dark mb-6 font-[family-name:var(--font-heading)]">
        Settings
      </h2>

      <div className="space-y-6">
        {/* Export */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-1">Export Data</h3>
              <p className="text-sm text-muted dark:text-muted-dark mb-4">
                Download all your dishes, ingredients, meal plans, and settings as a JSON backup file.
              </p>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all cursor-pointer">
                <Download size={16} /> Export Backup
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Upload size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-1">Import Data</h3>
              <p className="text-sm text-muted dark:text-muted-dark mb-2">
                Restore from a previously exported JSON backup file.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This will <strong>replace all existing data</strong>. Make sure to export first.
                </p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark font-medium hover:bg-bg dark:hover:bg-bg-dark transition-all cursor-pointer">
                <Upload size={16} /> {importing ? 'Importing...' : 'Choose File'}
                <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Database size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-1">About</h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                Dish Manager stores all data locally in your browser using IndexedDB. No server, no account needed.
                Your data stays on this device only — export regularly to avoid data loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
