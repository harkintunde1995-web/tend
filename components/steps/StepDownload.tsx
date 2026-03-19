'use client';
import { useEffect, useState } from 'react';
import { Download, Calendar, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { Contact, TierAssignments, TierSchedules } from '@/lib/types';
import { generateICS, downloadICS, ICSResult } from '@/lib/ics-generator';

interface Props {
  contacts: Contact[];
  assignments: TierAssignments;
  schedules: TierSchedules;
  onReset: () => void;
  onBack: () => void;
}

export function StepDownload({ contacts, assignments, schedules, onReset, onBack }: Props) {
  const [result, setResult] = useState<ICSResult | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const r = generateICS(contacts, assignments, schedules);
    setResult(r);
  }, [contacts, assignments, schedules]);

  const handleDownload = () => {
    if (!result) return;
    downloadICS(result);
    setDownloaded(true);
    // Increment public counter (fire and forget)
    fetch('/api/stats', { method: 'POST' }).catch(() => {});
  };

  const familyCount = contacts.filter((c) => assignments[c.id] === 'family').length;
  const closeCount = contacts.filter((c) => assignments[c.id] === 'close').length;
  const othersCount = contacts.filter((c) => assignments[c.id] === 'others').length;

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
          <Calendar size={36} className="text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your calendar is ready</h2>
        <p className="mt-2 text-gray-500">
          {result?.eventCount ?? '…'} recurring events generated — download and import into your calendar app.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-rose-50 p-4">
          <p className="text-2xl font-bold text-rose-600">{familyCount}</p>
          <p className="mt-0.5 text-xs text-rose-500">Family</p>
          <p className="mt-1 text-xs text-gray-500">Every {schedules.family.intervalDays} days</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4">
          <p className="text-2xl font-bold text-violet-600">{closeCount}</p>
          <p className="mt-0.5 text-xs text-violet-500">Close Friends</p>
          <p className="mt-1 text-xs text-gray-500">Fortnightly</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-4">
          <p className="text-2xl font-bold text-sky-600">{othersCount}</p>
          <p className="mt-0.5 text-xs text-sky-500">Everyone Else</p>
          <p className="mt-1 text-xs text-gray-500">
            ~{result ? `${result.cycleWeeks}wk cycle` : '…'}
          </p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!result}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:shadow-violet-300 disabled:opacity-50"
      >
        {downloaded ? (
          <>
            <CheckCircle size={20} />
            Downloaded! Click to download again
          </>
        ) : (
          <>
            <Download size={20} className="transition-transform group-hover:-translate-y-0.5" />
            Download keep-in-touch.ics
          </>
        )}
      </button>

      {/* Import instructions */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          How to import
        </p>
        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 text-base">📱</span>
            <div>
              <span className="font-medium text-gray-800">iPhone / Apple Calendar</span>
              <p className="text-xs text-gray-500">Tap the .ics file in Files app → &quot;Add All&quot; → Choose calendar</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 text-base">📅</span>
            <div>
              <span className="font-medium text-gray-800">Google Calendar</span>
              <p className="text-xs text-gray-500">Settings → Import → Select .ics file → Import</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 text-base">📧</span>
            <div>
              <span className="font-medium text-gray-800">Outlook</span>
              <p className="text-xs text-gray-500">File → Open & Export → Import/Export → Import iCalendar (.ics)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Start over
        </button>
      </div>
    </div>
  );
}
