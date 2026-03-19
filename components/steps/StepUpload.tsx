'use client';
import { useCallback, useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { parseVCF } from '@/lib/vcf-parser';
import { Contact } from '@/lib/types';

interface Props {
  onComplete: (contacts: Contact[]) => void;
}

export function StepUpload({ onComplete }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.vcf') && file.type !== 'text/vcard') {
        setError('Please upload a .vcf file. Export your contacts from iPhone, Android, or Google Contacts.');
        return;
      }
      setError('');
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const contacts = parseVCF(text);
          if (contacts.length === 0) {
            setError('No contacts found in this file. Make sure it\'s a valid .vcf export.');
            setLoading(false);
            return;
          }
          onComplete(contacts);
        } catch {
          setError('Could not parse this file. Please try exporting your contacts again.');
          setLoading(false);
        }
      };
      reader.readAsText(file, 'utf-8');
    },
    [onComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload your contacts</h2>
        <p className="mt-2 text-gray-500">
          Export a <span className="font-medium text-gray-700">.vcf file</span> from your phone or Google Contacts, then upload it here.
          <br />
          <span className="text-sm text-gray-400 mt-1 block">Everything is processed in your browser — your data never leaves your device.</span>
        </p>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={loading}
        className={`w-full rounded-2xl border-2 border-dashed p-12 text-center transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
          dragging
            ? 'border-violet-400 bg-violet-50'
            : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
            <p className="text-sm text-gray-500">Parsing contacts…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${dragging ? 'bg-violet-100' : 'bg-white'} shadow-sm`}>
              <Upload size={24} className={dragging ? 'text-violet-500' : 'text-gray-400'} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {dragging ? 'Drop it here' : 'Drop your .vcf file here'}
              </p>
              <p className="mt-1 text-sm text-gray-400">or click to browse</p>
            </div>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".vcf,text/vcard"
        className="hidden"
        onChange={onInputChange}
      />

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* How to export */}
      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
          How to export your contacts
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="mb-1 text-lg">📱</div>
            <p className="font-semibold text-gray-700">iPhone</p>
            <p>Contacts app → Select All → Share → Export vCard</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="mb-1 text-lg">🤖</div>
            <p className="font-semibold text-gray-700">Android</p>
            <p>Contacts app → Menu → Export → Save as .vcf</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="mb-1 text-lg">📧</div>
            <p className="font-semibold text-gray-700">Google</p>
            <p>contacts.google.com → Export → vCard format</p>
          </div>
        </div>
      </div>
    </div>
  );
}
