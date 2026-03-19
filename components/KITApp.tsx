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
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="13" cy="9" r="4.5" fill="white" opacity="0.95" />
      <circle cx="27" cy="9" r="4.5" fill="white" opacity="0.95" />
      <path d="M13 14 C13 14 10 20 11 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M27 14 C27 14 30 20 29 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M13 18 C17 15 24 15 29 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M27 18 C23 15 16 15 11 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function AnimatedHugIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9F67FF" stopOpacity="1">
            <animate attributeName="stop-opacity" values="1;0.45;1" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="1"/>
        </radialGradient>
        <filter id="heroSoftglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>{`
          @keyframes hero-pop-in {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1);  opacity: 1; }
          }
          @keyframes hero-breathe {
            0%,100% { transform: scale(1); }
            50%      { transform: scale(1.04); }
          }
          @keyframes hero-lean-left {
            0%,100% { transform: rotate(0deg) translateX(0); }
            40%,60%  { transform: rotate(6deg) translateX(3px); }
          }
          @keyframes hero-lean-right {
            0%,100% { transform: rotate(0deg) translateX(0); }
            40%,60%  { transform: rotate(-6deg) translateX(-3px); }
          }
          @keyframes hero-arm-squeeze {
            0%,100% { stroke-width: 4;   opacity: 0.9; }
            45%,55%  { stroke-width: 5.5; opacity: 1; }
          }
          .hero-container { animation: hero-pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; transform-origin: 40px 40px; }
          .hero-bg { animation: hero-breathe 4s ease-in-out 0.65s infinite; transform-origin: 40px 40px; }
          .hero-left-fig { animation: hero-lean-left 3s cubic-bezier(0.45,0.05,0.55,0.95) 0.65s infinite; transform-origin: 25px 45px; }
          .hero-right-fig { animation: hero-lean-right 3s cubic-bezier(0.45,0.05,0.55,0.95) 0.65s infinite; transform-origin: 55px 45px; }
          .hero-arm { animation: hero-arm-squeeze 3s cubic-bezier(0.45,0.05,0.55,0.95) 0.65s infinite; }
        `}</style>
      </defs>
      <g className="hero-container">
        <rect className="hero-bg" width="80" height="80" rx="18" fill="url(#heroGlow)"/>
        <g className="hero-left-fig">
          <circle cx="25" cy="23" r="8" fill="white" filter="url(#heroSoftglow)"/>
          <path d="M25 32 C25 32 19 44 21 58" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        </g>
        <g className="hero-right-fig">
          <circle cx="55" cy="23" r="8" fill="white" filter="url(#heroSoftglow)"/>
          <path d="M55 32 C55 32 61 44 59 58" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        </g>
        <path className="hero-arm" d="M25 39 C33 32 48 32 59 40" stroke="white" strokeLinecap="round" fill="none"/>
        <path className="hero-arm" d="M55 39 C47 32 32 32 21 40" stroke="white" strokeLinecap="round" fill="none"/>
      </g>
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
    <p className="mt-3 text-sm text-on-surface-variant">
      {count.toLocaleString()} {count === 1 ? 'person has' : 'people have'} already downloaded their calendar.
    </p>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Export your contacts',
      body: 'Download your contacts from iCloud, Google, or your phone. Takes 30 seconds. Everything stays local.',
    },
    {
      num: '02',
      title: 'Upload to Tend',
      body: 'Drag the file onto the page. We parse the names in your browser — your data never touches a server.',
    },
    {
      num: '03',
      title: 'Sort into tiers',
      body: 'Family. Close friends. Everyone else. Not everyone needs the same attention, and your calendar should know that.',
    },
    {
      num: '04',
      title: 'Download and import',
      body: 'One .ics file. Drop it into Apple Calendar, Google, or Outlook. Your reminders are live.',
    },
  ];

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-14">
        <h2 className="font-[family-name:var(--font-bricolage)] font-extrabold text-4xl text-on-secondary-fixed mb-3">
          How it works
        </h2>
        <div className="w-16 h-1 bg-primary-container rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {steps.map((s) => (
          <div
            key={s.num}
            className="group p-10 rounded-card bg-surface-container-lowest transition-all duration-300 cursor-default"
            style={{ boxShadow: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 50px -12px rgba(26,26,46,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <span className="font-[family-name:var(--font-bricolage)] font-extrabold text-6xl text-primary-fixed opacity-40 group-hover:opacity-100 transition-opacity duration-300 select-none">
              {s.num}
            </span>
            <h3 className="text-xl font-bold mt-4 mb-2 text-on-secondary-fixed">{s.title}</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowToExport() {
  const platforms = [
    {
      icon: 'phone_iphone',
      name: 'iPhone',
      steps: [
        'Download "My Contacts Backup" free from the App Store',
        'Open it and tap Backup',
        'Tap the share icon → Save to Files app',
        'Come back here and upload that file',
      ],
    },
    {
      icon: 'android',
      name: 'Android',
      steps: [
        'Open Contacts app',
        'Tap menu → Fix & Manage → Export to file',
        'Save the .vcf to your device',
        'Upload it here',
      ],
    },
    {
      icon: 'contact_page',
      name: 'Google Contacts',
      steps: [
        'Go to contacts.google.com',
        'Click Export in the left sidebar',
        'Choose vCard (VCF) format',
        'Download and upload here',
      ],
    },
  ];

  return (
    <section className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[family-name:var(--font-bricolage)] font-extrabold text-4xl text-on-secondary-fixed mb-2">
            How to export
          </h2>
          <p className="text-on-surface-variant">Choose your platform for a quick guide.</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {platforms.map((p) => (
            <div key={p.name} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-on-secondary-fixed">{p.icon}</span>
              </div>
              <h4 className="font-bold text-on-secondary-fixed mb-4">{p.name}</h4>
              <ol className="space-y-2 text-left">
                {p.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
        See how it works
      </p>
      {YT_VIDEO_ID ? (
        <div className="overflow-hidden rounded-card-lg" style={{ boxShadow: '0 20px 50px -12px rgba(26,26,46,0.08)' }}>
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-card-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '28px' }}>play_circle</span>
          </div>
          <div>
            <p className="font-semibold text-on-secondary-fixed">Video coming soon</p>
            <p className="mt-1 text-sm text-on-surface-variant">A short walkthrough. No tech knowledge needed.</p>
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-on-surface-variant">
        <span>Captions in 100+ languages</span>
        <span className="text-outline-variant">·</span>
        <span className="flex gap-1">🇬🇧 🇳🇬 🇫🇷 🇩🇪 🇪🇸 🇵🇹 🇯🇵 🇨🇳 🇮🇳 🇦🇷 + more</span>
      </div>
    </section>
  );
}

function USPs() {
  const items = [
    {
      icon: 'shield_person',
      title: 'Your contacts stay on your device. Always.',
      body: 'Nothing is sent anywhere. Not even for a second. Everything runs in your browser.',
    },
    {
      icon: 'calendar_month',
      title: 'Works with every calendar you already use.',
      body: 'Apple. Google. Outlook. No new app to download, no new habit to build.',
    },
    {
      icon: 'no_accounts',
      title: 'No account. No subscription. No catch.',
      body: 'Upload. Sort. Download. Done. The whole thing takes about two minutes.',
    },
    {
      icon: 'groups',
      title: 'Built around how relationships actually work.',
      body: "Your mum deserves a call every few days. Your old colleague, maybe once a month. Tend knows the difference.",
    },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="p-7 bg-surface-container-low rounded-card">
            <span
              className="material-symbols-outlined text-primary-container mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              {item.icon}
            </span>
            <h3 className="mb-2 font-bold text-on-secondary-fixed text-sm leading-snug">{item.title}</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b" style={{ borderColor: 'rgba(204,195,216,0.2)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl text-on-secondary-fixed flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container">
              <HugIcon small />
            </span>
            <span className="font-[family-name:var(--font-bricolage)] font-extrabold tracking-tight">Tend</span>
          </h1>
          <a
            href="https://github.com/harkintunde1995-web/tend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-container border-b border-primary-container/40 hover:border-primary-container transition-colors pb-0.5"
          >
            Open source
          </a>
        </div>
      </header>

      <main className="pt-20">
        {step === 'upload' && (
          <>
            {/* Hero */}
            <section className="radial-bloom px-6 pt-20 pb-16 text-center">
              <div className="mx-auto max-w-3xl">
                <div className="mx-auto mb-7 inline-flex" style={{ filter: 'drop-shadow(0 8px 32px rgba(124,58,237,0.35))' }}>
                  <AnimatedHugIcon />
                </div>
                <h1 className="font-[family-name:var(--font-bricolage)] font-extrabold text-5xl sm:text-6xl lg:text-7xl text-on-secondary-fixed leading-[0.95] tracking-tight mb-5">
                  Remember the people<br />who matter.
                </h1>
                <p className="text-xl font-medium text-primary-container font-[family-name:var(--font-bricolage)] mb-8">
                  Staying in touch starts with remembering to.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {[
                    { icon: 'lock', label: '100% private' },
                    { icon: 'person_off', label: 'No account needed' },
                    { icon: 'volunteer_activism', label: 'Free forever' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-low rounded-full">
                      <span
                        className="material-symbols-outlined text-on-surface-variant"
                        style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                      >
                        {icon}
                      </span>
                      <span className="text-sm font-medium text-on-surface-variant">{label}</span>
                    </div>
                  ))}
                </div>
                <Counter />
              </div>
            </section>

            {/* Progress + Upload */}
            <div className="px-6 pb-16 max-w-3xl mx-auto">
              <ProgressBar current={step} />
              <StepUpload onComplete={handleUploadComplete} />
            </div>

            <HowItWorks />
            <HowToExport />
            <VideoSection />
            <USPs />

            {/* Closing CTA */}
            <section className="py-28 px-6 text-center max-w-3xl mx-auto">
              <h2 className="font-[family-name:var(--font-bricolage)] font-extrabold text-4xl sm:text-5xl text-on-secondary-fixed leading-tight mb-2">
                You will stop saying &quot;we should catch up.&quot;
              </h2>
              <p className="font-[family-name:var(--font-bricolage)] font-extrabold text-4xl sm:text-5xl text-primary-container">
                And actually catch up.
              </p>
            </section>
          </>
        )}

        {step !== 'upload' && (
          <div className="mx-auto max-w-3xl px-4 py-10">
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
          </div>
        )}
      </main>

      <footer className="border-t py-10 bg-surface-container-low" style={{ borderColor: 'rgba(204,195,216,0.3)' }}>
        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary-container">
              <HugIcon small />
            </span>
            <span className="font-[family-name:var(--font-bricolage)] font-extrabold text-on-secondary-fixed">Tend</span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">
            Open source. No data stored. Made with care.
          </p>
          <div className="flex gap-6 text-sm text-on-surface-variant">
            <a href="https://github.com/harkintunde1995-web/tend" target="_blank" rel="noopener noreferrer" className="hover:text-on-secondary-fixed transition-colors">GitHub</a>
            <a href="/privacy" className="hover:text-on-secondary-fixed transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
