'use client';

import { useState, useRef } from 'react';
import { api, getErrorMessage } from '@/lib/api';

export default function CsvImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: string[]; failed: { row: string; error: string }[] } | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) return;
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ created: data.created, failed: data.failed });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface-raised p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Import employees</h3>
            <p className="mt-1 text-sm text-muted">Upload a CSV to bulk-create employee records.</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        {!result ? (
          <>
            <div className="mt-4 rounded-md border border-dashed border-border bg-bg p-4 text-xs text-muted">
              Expected columns: <code className="font-mono">employeeId, name, email, phone, password,
              department, designation, salary, joiningDate, status, role</code>. Missing password
              defaults to <code className="font-mono">Welcome@123</code>.
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-4 w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
            />

            {error && <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-3.5 py-2 text-sm text-ink hover:bg-bg">
                Cancel
              </button>
              <button
                type="button"
                disabled={!file || submitting}
                onClick={handleImport}
                className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? 'Importing…' : 'Import CSV'}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink">
              <span className="font-medium text-success">{result.created.length} created</span>
              {result.failed.length > 0 && (
                <span className="text-danger"> &middot; {result.failed.length} failed</span>
              )}
            </p>
            {result.failed.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-bg p-2 text-xs text-muted">
                {result.failed.map((f, i) => (
                  <li key={i}>
                    <span className="font-mono">{f.row}</span>: {f.error}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
