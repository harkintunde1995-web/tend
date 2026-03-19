import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Tend',
  description: 'Tend processes your contacts entirely in your browser. Nothing is sent to any server.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b" style={{ borderColor: 'rgba(204,195,216,0.2)' }}>
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-on-secondary-fixed hover:opacity-80 transition-opacity">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed]">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="13" cy="9" r="4.5" fill="white" opacity="0.95" />
                <circle cx="27" cy="9" r="4.5" fill="white" opacity="0.95" />
                <path d="M13 14 C13 14 10 20 11 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M27 14 C27 14 30 20 29 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M13 18 C17 15 24 15 29 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M27 18 C23 15 16 15 11 19" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>Tend</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-3" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Privacy
        </h1>
        <p className="text-[#4a4455] mb-12 text-sm">Last updated March 2026</p>

        <div className="space-y-10 text-[#1c1b1b]">

          <section>
            <p className="text-lg leading-relaxed text-[#4a4455]">
              Tend does one thing with your contacts: reads them, helps you sort them, and turns them into a calendar file. That is it. Nothing gets saved anywhere, nothing gets sent anywhere, and we have no idea who you are.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Your contact file</h2>
            <p className="text-[#4a4455] leading-relaxed">
              When you upload your .vcf file, it is read by JavaScript running in your own browser tab. The file never travels over the internet. We never see it. Once you close or refresh the tab, it is gone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Your assignments and settings</h2>
            <p className="text-[#4a4455] leading-relaxed">
              As you sort contacts into tiers and configure your schedule, that work is held in your browser&apos;s sessionStorage so you do not lose it if you switch tabs mid-session. SessionStorage is local to your device and is wiped when you close the tab. None of it is ever sent to a server.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">The .ics file</h2>
            <p className="text-[#4a4455] leading-relaxed">
              Your calendar file is built entirely in your browser and downloaded straight to your device. Tend never receives a copy. Once it hits your Downloads folder, it has nothing to do with us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">The download counter</h2>
            <p className="text-[#4a4455] leading-relaxed">
              There is one number we do track: how many .ics files have been downloaded in total. Just the count, nothing else. No IP address, no device info, no contact data. It feeds the &quot;X people have already downloaded their calendar&quot; message on the homepage, that is all.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Hosting</h2>
            <p className="text-[#4a4455] leading-relaxed">
              Tend runs on Vercel. Like any web host, Vercel logs basic server data (page requests, IP addresses) as part of running the infrastructure. That is Vercel&apos;s data, not ours. You can read their{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] underline underline-offset-2">privacy policy</a> if you want the details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">You can read the code</h2>
            <p className="text-[#4a4455] leading-relaxed">
              Tend is open source. Every line of code that runs when you use this tool is public at{' '}
              <a href="https://github.com/harkintunde1995-web/tend" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] underline underline-offset-2">github.com/harkintunde1995-web/tend</a>.
              You do not have to take our word for any of this.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Questions</h2>
            <p className="text-[#4a4455] leading-relaxed">
              If something here is unclear or you have a concern, open an issue on{' '}
              <a href="https://github.com/harkintunde1995-web/tend/issues" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] underline underline-offset-2">GitHub</a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t mt-16 py-8 text-center text-sm text-[#4a4455]" style={{ borderColor: 'rgba(204,195,216,0.3)' }}>
        <Link href="/" className="text-[#7c3aed] hover:underline">Back to Tend</Link>
      </footer>
    </div>
  );
}
