# Tend

**Remember the people who matter.**

Tend helps you stay in touch with the people you care about — not by adding another app to your life, but by putting reminders where you already live: your calendar.

Live at **[usetend.vercel.app](https://usetend.vercel.app)**

---

## What it does

1. **Export your contacts** from iPhone, Android, or Google Contacts as a `.vcf` file
2. **Upload to Tend** — everything is parsed locally in your browser
3. **Sort into tiers** — Family, Close Friends, Everyone Else
4. **Download a `.ics` file** — import into Apple Calendar, Google Calendar, or Outlook

Your contacts never leave your device. Nothing is sent to a server.

---

## Why it's open source

Tend processes your contact list — that's sensitive. Open sourcing it means anyone can verify that the privacy promise is real. No tracking, no data collection, no accounts.

---

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com) with a custom Material Design 3 token system
- [TypeScript](https://www.typescriptlang.org)
- All contact parsing runs client-side via a custom VCF parser
- Calendar generation uses the iCalendar (`.ics`) spec

---

## Running locally

```bash
git clone https://github.com/harkintunde1995-web/tend.git
cd tend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/          → Next.js app router (layout, page, API routes)
components/   → UI components
  steps/      → StepUpload, StepCategorise, StepSchedule, StepDownload
  ui/         → Shared UI (ProgressBar, etc.)
lib/          → Core logic
  vcf-parser  → Parses .vcf contact exports
  ics-builder → Generates .ics calendar files
  types       → Shared TypeScript types
```

---

## Contributing

Pull requests are welcome. If you find a bug or have an idea, open an issue.

---

## License

MIT
