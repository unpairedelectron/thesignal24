import { ArrowLeft, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="signal-page min-h-[100dvh]">
      <div className="signal-container flex min-h-[100dvh] items-center justify-center py-16">
        <section className="w-full max-w-xl border-y border-foreground/20 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-accent text-accent"><Radio size={17} /></span>
            <p className="signal-kicker text-accent">Transmission not found</p>
          </div>
          <h1 className="mt-7 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Off<br /><em className="font-normal text-accent">frequency.</em></h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground">This page is not part of the current signal. Return to the briefing and pick up the thread from there.</p>
          <a href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground">
            <ArrowLeft size={14} /> Return to the briefing
          </a>
        </section>
      </div>
    </main>
  );
}