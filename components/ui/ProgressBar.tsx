'use client';
import { Check } from 'lucide-react';
import { Step } from '@/lib/types';

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'categorise', label: 'Categorise' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'download', label: 'Download' },
];

const ORDER: Record<Step, number> = {
  upload: 0,
  categorise: 1,
  schedule: 2,
  download: 3,
};

export function ProgressBar({ current }: { current: Step }) {
  const currentIdx = ORDER[current];

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={step.id} className="flex items-center">
              {/* connector line */}
              {i > 0 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 ${
                    i <= currentIdx ? 'bg-violet-500' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                    done
                      ? 'border-violet-500 bg-violet-500 text-white'
                      : active
                      ? 'border-violet-500 bg-white text-violet-600'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    active ? 'text-violet-600' : done ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
