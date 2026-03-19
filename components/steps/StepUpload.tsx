'use client';
import { useCallback, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
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
            setError("No contacts found in this file. Make sure it's a valid .vcf export.");
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
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={loading}
        className={`group w-full relative rounded-card-lg border-2 border-dashed p-14 text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 ${
          dragging
            ? 'border-primary-container bg-secondary-container/20 scale-[1.01]'
            : 'border-outline-variant bg-surface-container-lowest hover:border-primary-container hover:shadow-2xl hover:shadow-primary-container/10'
        }`}
        style={dragging ? { boxShadow: '0 20px 60px rgba(124,58,237,0.15)' } : {}}
      >
        {/* Subtle contact dots background hint */}
        <div className="absolute inset-0 overflow-hidden rounded-card-lg pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-container rounded-full blur-[1px]" />
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-primary-container rounded-full" />
          <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-primary-container rounded-full blur-[1px]" />
          <div className="absolute top-1/3 left-2/3 w-1.5 h-1.5 bg-primary-container rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          {loading ? (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary-container" />
              <p className="text-sm text-on-surface-variant">Parsing contacts…</p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                dragging ? 'bg-primary-container' : 'bg-secondary-container group-hover:bg-primary-container'
              }`}>
                <span
                  className={`material-symbols-outlined text-3xl transition-colors duration-300 ${
                    dragging ? 'text-white' : 'text-primary-container group-hover:text-white'
                  }`}
                >
                  upload_file
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-secondary-fixed font-[family-name:var(--font-bricolage)]">
                  {dragging ? 'Drop it here' : 'Drop your contact export here'}
                </h3>
                <p className="mt-1 text-on-surface-variant text-sm max-w-sm mx-auto">
                  Tend processes everything locally. Your relationships never leave your device.
                </p>
              </div>
              <div className="mt-2 px-6 py-3 bg-on-secondary-fixed text-white rounded-full text-sm font-bold tracking-wide">
                SELECT .VCF FILE
              </div>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".vcf,text/vcard"
        className="hidden"
        onChange={onInputChange}
      />

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-card bg-error-container/50 p-4 text-sm text-on-error-container">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
