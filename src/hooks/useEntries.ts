import { useState, useEffect, useCallback } from 'react';
import { EntryRecord, INITIAL_ENTRIES } from '../data/scheduleData';

const STORAGE_KEY = 'golden_monday_entries_v2';
const SUPABASE_URL = 'https://bcjsqyinskfqszqtfoea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjanNxeWluc2tmcXN6cXRmb2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTUzODgsImV4cCI6MjEwNDA3MTM4OH0.nIbmzx0x7Wal_PgRVbMBqwnxQpfSCKeiXNsNZ5aAOvM';

export function useEntries() {
  const [entries, setEntries] = useState<Record<number, EntryRecord>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...INITIAL_ENTRIES, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored entries from localStorage', e);
    }
    return INITIAL_ENTRIES;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Initial fetch from Supabase to ensure fresh cloud sync
  useEffect(() => {
    let active = true;

    async function syncCloud() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/golden_monday_entries?select=*`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (!active) return;

        if (res.ok) {
          const cloudData: EntryRecord[] = await res.json();
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            setEntries(prev => {
              const merged = { ...prev };
              for (const row of cloudData) {
                if (row.week) {
                  merged[row.week] = {
                    ...merged[row.week],
                    ...row
                  };
                }
              }
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {
                // Ignore localStorage errors
              }
              return merged;
            });
          }
        }
      } catch (err: unknown) {
        console.warn('Supabase fetch notice (using local storage cache):', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    syncCloud();
    return () => {
      active = false;
    };
  }, []);

  const upsert = useCallback(
    async (week: number, patch: Partial<EntryRecord>) => {
      let updatedRecord: EntryRecord | null = null;

      setEntries(prev => {
        const existing = prev[week];
        const record: EntryRecord = {
          week,
          topic: patch.topic ?? existing?.topic ?? '',
          status: patch.status ?? existing?.status ?? 'planned',
          invited: patch.invited ?? existing?.invited ?? 30,
          attended: patch.attended !== undefined ? patch.attended : (existing?.attended ?? null),
          feedback: patch.feedback !== undefined ? patch.feedback : (existing?.feedback ?? null),
          comment: patch.comment ?? existing?.comment ?? '',
          documents: patch.documents !== undefined ? patch.documents : (existing?.documents ?? []),
          updated_at: new Date().toISOString()
        };

        updatedRecord = record;
        const next = { ...prev, [week]: record };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('LocalStorage write error', e);
        }
        return next;
      });

      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);

      // Attempt cloud upsert
      if (updatedRecord) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/golden_monday_entries`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates'
            },
            body: JSON.stringify(updatedRecord)
          });
        } catch {
          // Cloud sync failure is silently caught; localStorage preserves the change
        }
      }
    },
    []
  );

  const addDocument = useCallback(
    async (week: number, doc: import('../data/scheduleData').ProgramDocument) => {
      setEntries(prev => {
        const existing = prev[week] || {
          week,
          topic: '',
          status: 'planned' as const,
          invited: 30,
          attended: null,
          feedback: null,
          comment: '',
          documents: []
        };
        const updatedDocs = [...(existing.documents || []), doc];
        const updatedRecord: EntryRecord = {
          ...existing,
          documents: updatedDocs,
          updated_at: new Date().toISOString()
        };
        const next = { ...prev, [week]: updatedRecord };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('LocalStorage write error', e);
        }
        return next;
      });

      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    },
    []
  );

  const removeDocument = useCallback(
    async (week: number, docId: string) => {
      setEntries(prev => {
        const existing = prev[week];
        if (!existing || !existing.documents) return prev;
        const updatedDocs = existing.documents.filter(d => d.id !== docId);
        const updatedRecord: EntryRecord = {
          ...existing,
          documents: updatedDocs,
          updated_at: new Date().toISOString()
        };
        const next = { ...prev, [week]: updatedRecord };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('LocalStorage write error', e);
        }
        return next;
      });

      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    },
    []
  );

  const resetToDefault = useCallback(() => {
    if (window.confirm('ሁሉንም የተቀመጡ መረጃዎች ወደ መጀመሪያው ሁኔታ መመለስ ይፈልጋሉ?')) {
      setEntries(INITIAL_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENTRIES));
      } catch {
        // Ignore
      }
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    }
  }, []);

  const exportToJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `golden_monday_schedule_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [entries]);

  const importFromJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        setEntries(prev => {
          const next = { ...prev, ...parsed };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        setIsSavedRecently(true);
        setTimeout(() => setIsSavedRecently(false), 2000);
        return true;
      }
    } catch (e) {
      console.error('Import error', e);
    }
    return false;
  }, []);

  return {
    entries,
    loading,
    error,
    isSavedRecently,
    upsert,
    addDocument,
    removeDocument,
    resetToDefault,
    exportToJson,
    importFromJson
  };
}
