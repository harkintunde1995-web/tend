'use client';
import { useState, useEffect } from 'react';
import { Contact, TierAssignments, TierSchedules, Step, DEFAULT_SCHEDULES } from '@/lib/types';
import { ProgressBar } from './ui/ProgressBar';
import { StepUpload } from './steps/StepUpload';
import { StepCategorise } from './steps/StepCategorise';
import { StepSchedule } from './steps/StepSchedule';
import { StepDownload } from './steps/StepDownload';

const STORAGE_KEY = 'tend-assignments';
const YT_VIDEO_ID = process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID;

function HugIcon({ small }: { small?: boolean }) {
  const size = small ? 18 : 32;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      {/* Left person head */}
      <circle cx="13" cy="9" r="4.5" fill="white" opacity="0.95" />
      {/* Right person head */}
      <circle cx="27" cy="9" r="4.5" fill="white" opacity="0.95" />
      {/* Left body */}
      <path d="M13 14 C13 14 10 20 11 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* Right body */}
      <path d="M27 14 C27 14 30 20 29 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* Left arm reaching over right shoulder */}
      <path d="M13 18 C17 15 24 15 29 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      {/* Right arm reaching over left shoulder */}
      <path d="M27 18 C23 15 16 15 11 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Counter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  if (!count || count < 5) return null;

  return (
    <p className="mt-3 text-sm text-gray-400">
      {count.toLocaleString()} {count === 1 ? 'person has' : 'people have'} already downloaded their calendar.
    </p>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Export your contacts',
      body: 'Takes 30 seconds from any phone. iPhone, Android, Google. If it has contacts, it works.',
      icon: '📤',
    },
    {
      num: '02',
      title: 'Tell us who is who',
      body: 'Family. Close friends. Everyone else. Not everyone needs the same attention and your calendar should know that.',
      icon: '🗂',
    },
    {
      num: '03',
      title: 'Set how often',
      body: "We suggest sensible defaults. Change anything you like. You know your relationships better than we do.",
      icon: '⏰',
    },
    {
      num: '04',
      title: 'Download and import',
      body: 'One file. Drop it into Apple Calendar, Google, or Outlook. Your reminders are ready.',
      icon: '📅',
    },
  ];

  return (
    <section className="mx-auto max-w-3xl py-16">
      <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
        How it works
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.num} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-bold text-gray-300">{s.num}</span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowToExport() {
  const platforms = [
    {
      icon: '📱',
      name: 'iPhone',
      steps: [
        'Download the free app "My Contacts Backup" from the App Store',
        'Open it and tap Backup',
        'Tap the share icon on the .vcf file it creates',
        'Save it to your Files app',
        'Come back here and upload that file',
      ],
    },
    {
      icon: '🤖',
      name: 'Android',
      steps: [
        'Open Contacts',
        'Tap the menu (three dots)',
        'Select Export or Manage contacts',
        'Choose Export to .vcf and save the file',
        'Upload it here',
      ],
    },
    {
      icon: '📧',
      name: 'Google Contacts',
      steps: [
        'Go to contacts.google.com on a computer',
        'Click Export in the left menu',
        'Choose Google CSV or vCard (VCF)',
        'Download the file and upload it here',
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-3xl py-8 pb-16">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
        How to export your contacts
      </p>
      <div className="grid gap-5 sm:grid-cols-3">
        {platforms.map((p) => (
          <div key={p.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 text-2xl">{p.icon}</div>
            <h3 className="mb-3 font-semibold text-gray-900">{p.name}</h3>
            <ol className="space-y-1.5">
              {p.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-500">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="mx-auto max-w-3xl pb-16">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
        See how it works
      </p>

      {YT_VIDEO_ID ? (
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <div className="relative pb-[56.25%]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&cc_load_policy=1`}
              title="How to use Tend"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-3xl">▶️</span>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Video coming soon</p>
            <p className="mt-1 text-sm text-gray-400">
              A short walkthrough for everyone. No tech knowledge needed.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
        <span>Captions available in 100+ languages</span>
        <span className="text-gray-200">|</span>
        <span className="flex gap-1">
          🇬🇧 🇳🇬 🇫🇷 🇩🇪 🇪🇸 🇵🇹 🇯🇵 🇨🇳 🇮🇳 🇦🇷 + more
        </span>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        Click the CC button in the video player and choose your language.
      </p>
    </section>
  );
}

function USPs() {
  const items = [
    {
      icon: '🔒',
      title: 'Your contacts stay on your device. Always.',
      body: 'Nothing is sent anywhere. Not even for a second. Everything is processed in your browser.',
    },
    {
      icon: '📅',
      title: 'Works with every calendar you already use.',
      body: 'Apple. Google. Outlook. No new app to download, no new habit to build.',
    },
    {
      icon: '⚡',
      title: 'No account. No subscription. No catch.',
      body: 'Upload. Set up. Download. Done. The whole thing takes about two minutes.',
    },
    {
      icon: '❤️',
      title: 'Built around how relationships actually work.',
      body: 'Your mum deserves a call every few days. Your old colleague, maybe once a month. Tend knows the difference.',
    },
  ];

  return (
    <section className="mx-auto max-w-3xl py-8 pb-16">
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className="mt-0.5 text-xl shrink-0">{item.icon}</span>
            <div>
              <h3 className="mb-1 font-semibold text-gray-900 text-sm">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KITApp() {
  const [step, setStep] = useState<Step>('upload');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [assignments, setAssignments] = useState<TierAssignments>({});
  const [schedules, setSchedules] = useState<TierSchedules>(DEFAULT_SCHEDULES);

  useEffect(() => {
    if (Object.keys(assignments).length > 0) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assignments)); } catch {}
    }
  }, [assignments]);

  const handleUploadComplete = (parsed: Contact[]) => {
    setContacts(parsed);
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
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600"><HugIcon small /></span>
              <span className="font-[family-name:var(--font-bricolage)] font-extrabold tracking-tight">Tend</span>
            </h1>
            <p className="text-xs text-gray-400">Staying in touch is not hard. Remembering to is.</p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Open source
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero — upload step only */}
        {step === 'upload' && (
          <>
            <div className="mb-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
                <HugIcon />
              </div>
              <h1 className="text-4xl tracking-tight text-gray-900 sm:text-5xl font-[family-name:var(--font-bricolage)] font-extrabold">
                Staying in touch<br />is not hard.
              </h1>
              <p className="mt-3 text-xl font-medium text-violet-600 font-[family-name:var(--font-bricolage)]">Remembering to is.</p>
              <p className="mx-auto mt-5 max-w-md text-gray-500">
                Upload your contacts. Tell us who matters most. Get a calendar that reminds you to reach out, so you never lose someone to the busyness of life.
              </p>
              <div className="mx-auto mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span>100% private</span>
                <span>No account needed</span>
                <span>Free forever</span>
              </div>
              <Counter />
            </div>

            <ProgressBar current={step} />
            <StepUpload onComplete={handleUploadComplete} />

            <HowItWorks />
            <HowToExport />
            <VideoSection />
            <USPs />

            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-gray-700">
                You will stop saying &quot;we should catch up.&quot;
              </p>
              <p className="mt-1 text-lg text-gray-500">And actually catch up.</p>
            </div>
          </>
        )}

        {step !== 'upload' && (
          <>
            <ProgressBar current={step} />

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
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Tend. Open source. No data stored. Made with care.
      </footer>
    </div>
  );
}
