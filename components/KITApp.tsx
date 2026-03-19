'use client';
import { useState, useEffect } from 'react';
import { Contact, TierAssignments, TierSchedules, Step, DEFAULT_SCHEDULES } from '@/lib/types';
import { ProgressBar } from './ui/ProgressBar';
import { StepUpload } from './steps/StepUpload';
import { StepCategorise } from './steps/StepCategorise';
import { StepSchedule } from './steps/StepSchedule';
import { StepDownload } from './steps/StepDownload';

const STORAGE_KEY = 'kit-assignments';

export function KITApp() {
  const [step, setStep] = useState<Step>('upload');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [assignments, setAssignments] = useState<TierAssignments>({});
  const [schedules, setSchedules] = useState<TierSchedules>(DEFAULT_SCHEDULES);

  // Persist assignments to sessionStorage as safety net
  useEffect(() => {
    if (Object.keys(assignments).length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
      } catch {}
    }
  }, [assignments]);

  const handleUploadComplete = (parsed: Contact[]) => {
    setContacts(parsed);
    // Try to rehydrate assignments from sessionStorage if same session
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setAssignments(JSON.parse(saved));
    } catch {}
    setStep('categorise');
  };

  const reset = () => {
    setStep('upload');
    setContacts([]);
    setAssignments({});
    setSchedules(DEFAULT_SCHEDULES);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const othersCount = contacts.filter((c) => assignments[c.id] === 'others').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Keep In Touch</h1>
            <p className="text-xs text-gray-400">Never lose a relationship again</p>
          </div>
          <a
            href="https://github.com/akint/keep-in-touch"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            ★ GitHub
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero — only on upload step */}
        {step === 'upload' && (
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-3xl shadow-lg shadow-violet-200">
              📞
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Stay close to the people<br />who matter most
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-gray-500">
              Upload your contacts, set how often you want to reach out, and get a personalised outreach calendar — straight to Apple, Google, or Outlook.
            </p>
            <div className="mx-auto mt-4 flex max-w-sm justify-center gap-4 text-sm text-gray-400">
              <span>✓ 100% private</span>
              <span>✓ No account needed</span>
              <span>✓ Free forever</span>
            </div>
          </div>
        )}

        <ProgressBar current={step} />

        {step === 'upload' && <StepUpload onComplete={handleUploadComplete} />}

        {step === 'categorise' && (
          <StepCategorise
            contacts={contacts}
            assignments={assignments}
            onChange={setAssignments}
            onNext={() => setStep('schedule')}
          />
        )}

        {step === 'schedule' && (
          <StepSchedule
            schedules={schedules}
            onChange={setSchedules}
            onNext={() => setStep('download')}
            onBack={() => setStep('categorise')}
            othersCount={othersCount}
          />
        )}

        {step === 'download' && (
          <StepDownload
            contacts={contacts}
            assignments={assignments}
            schedules={schedules}
            onReset={reset}
            onBack={() => setStep('schedule')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Open source · No data stored · Made with ♥
      </footer>
    </div>
  );
}
