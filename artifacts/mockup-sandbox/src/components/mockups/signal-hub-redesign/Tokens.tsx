import { ArrowUpRight, Check, CircleHelp, Minus, Type } from 'lucide-react';
import { AppShell } from './_shared/AppShell';
import './_group.css';

const colors = [
  { name: 'Ink', token: '--sh-ink', value: '#202633', use: 'Primary text, rules, dark masthead' },
  { name: 'Paper', token: '--sh-paper', value: '#f4f0e8', use: 'Page field' },
  { name: 'Document white', token: '--sh-white', value: '#fffdf8', use: 'Source panels and inputs' },
  { name: 'Muted', token: '--sh-muted', value: '#6f706f', use: 'Secondary labels on paper' },
  { name: 'Rule', token: '--sh-rule', value: '#c9c4bb', use: 'Dividers and outlines' },
  { name: 'Crimson', token: '--sh-red', value: '#a9322a', use: 'Editorial emphasis, corrections' },
  { name: 'Amber', token: '--sh-amber', value: '#896321', use: 'Caution and status notes' },
  { name: 'Blue', token: '--sh-blue', value: '#315c76', use: 'Source links and verified references' },
  { name: 'Soft crimson', token: '--sh-soft-red', value: '#f0e3df', use: 'Correction and alert surface' },
  { name: 'Soft blue', token: '--sh-soft-blue', value: '#e5ebec', use: 'Evidence / source callout' },
];

const typeSamples = [
  { label: 'Display / hero', size: '72 / 0.91', family: 'Fraunces · serif', text: 'Read the rule.' },
  { label: 'Section heading', size: '48 / 1.0', family: 'Fraunces · serif', text: 'The case file, carefully read.' },
  { label: 'Editorial title', size: '30 / 1.12', family: 'Fraunces · serif', text: 'The constitutional record' },
  { label: 'Body / reading', size: '15 / 1.7', family: 'DM Sans · sans-serif', text: 'A source-first reading of legislation, court decisions and public documents.' },
  { label: 'Metadata / label', size: '10 / 1.5', family: 'DM Mono · monospace', text: 'SOURCE / 07 NOV 2022 / SUPREME COURT' },
];

const spacing = [
  { name: 'Tight', value: '4 px', width: '16px', note: 'Icon + label, inline metadata' },
  { name: 'Close', value: '8 px', width: '32px', note: 'Tag gaps, compact controls' },
  { name: 'Reading', value: '16 px', width: '64px', note: 'Paragraph groups, source panels' },
  { name: 'Section', value: '32 px', width: '128px', note: 'Section interiors' },
  { name: 'Breathing room', value: '64 px', width: '220px', note: 'Major page transitions' },
];

function ContrastRow({ label, foreground, background, ratio, note }: { label: string; foreground: string; background: string; ratio: string; note: string }) {
  return (
    <div className="grid gap-3 border-t border-[var(--sh-rule)] py-4 sm:grid-cols-[1fr_220px_90px] sm:items-center">
      <div><p className="sh-mono text-[9px]">{label}</p><p className="mt-1 text-xs text-[var(--sh-muted)]">{note}</p></div>
      <div className="flex min-h-[54px] items-center justify-center border border-[var(--sh-rule)] px-3" style={{ color: foreground, backgroundColor: background }}><span className="text-sm">Signal Hub / Aa 123</span></div>
      <span className="sh-tag sh-tag--blue justify-center">{ratio} : 1</span>
    </div>
  );
}

export function Tokens() {
  return (
    <AppShell active="About">
      <div id="top" className="sh-container pb-16">
        <header className="grid gap-8 border-b-2 border-[var(--sh-ink)] pb-10 pt-12 sm:pb-14 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <p className="sh-kicker">Signal Hub / Visual language</p>
            <h1 className="sh-serif mt-4 max-w-4xl text-5xl leading-[.9] sm:text-7xl lg:text-[82px]">Warm paper.<br /><em className="font-normal text-[var(--sh-red)]">Clear evidence.</em></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4e5051]">A restrained set of type, color and spacing roles built for public-interest reading: calm enough to study, distinct enough to show what kind of information is in view.</p>
          </div>
          <div className="border-l-2 border-[var(--sh-red)] pl-4">
            <p className="sh-mono text-[9px] text-[var(--sh-red)]">Design direction</p>
            <p className="sh-serif mt-2 text-2xl leading-tight">Document-led editorial<br />with an archive’s restraint.</p>
          </div>
        </header>

        <section className="py-10 sm:py-14">
          <div className="grid gap-4 border-y border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_280px] sm:items-end">
            <div><p className="sh-kicker">01 / Typography</p><h2 className="sh-serif mt-2 text-4xl sm:text-5xl">Three voices, one record.</h2></div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">Fraunces carries editorial emphasis; DM Sans holds the reading line; DM Mono identifies dates, labels and source metadata.</p>
          </div>
          <div className="mt-5 border-t-2 border-[var(--sh-ink)]">
            {typeSamples.map((sample) => <div key={sample.label} className="grid gap-2 border-b border-[var(--sh-rule)] py-5 sm:grid-cols-[180px_minmax(0,1fr)_155px] sm:items-center sm:gap-6">
              <div><p className="sh-mono text-[9px] text-[var(--sh-red)]">{sample.label}</p><p className="mt-1 text-[10px] text-[var(--sh-muted)]">{sample.family}</p></div>
              <p className={sample.family.startsWith('Fraunces') ? 'sh-serif text-3xl leading-tight sm:text-4xl' : sample.family.startsWith('DM Mono') ? 'sh-mono text-[10px]' : 'max-w-2xl text-[15px] leading-relaxed'}>{sample.text}</p>
              <span className="sh-mono text-[9px] text-[var(--sh-muted)]">{sample.size}</span>
            </div>)}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="border-l-2 border-[var(--sh-red)] bg-[var(--sh-soft-red)] p-5">
              <p className="sh-kicker">Display italic / emphasis only</p><p className="sh-serif mt-3 text-3xl leading-tight">The headline is not the decision.</p><p className="mt-3 text-xs leading-relaxed text-[var(--sh-muted)]">Use the serif italic for a phrase of emphasis, not for whole paragraphs or functional labels.</p>
            </div>
            <div className="flex items-center gap-3 border border-[var(--sh-rule)] p-5">
              <Type size={19} className="text-[var(--sh-blue)]" /><div><p className="sh-kicker">Reading measure</p><p className="mt-1 text-sm leading-relaxed">Body copy remains comfortable at 15 px with a generous line height and a restrained column width.</p></div>
            </div>
          </div>
        </section>

        <section id="colors" data-token-colors className="py-8 sm:py-12">
          <div className="grid gap-4 border-y border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_280px] sm:items-end">
            <div><p className="sh-kicker">02 / Color roles</p><h2 className="sh-serif mt-2 text-4xl sm:text-5xl">A palette with a reason.</h2></div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">Warm paper and charcoal are the ground. Crimson, amber and blue carry small, distinct editorial meanings.</p>
          </div>
          <div className="mt-5 grid gap-0 border-t-2 border-[var(--sh-ink)] sm:grid-cols-2 lg:grid-cols-5">
            {colors.map((color) => <article key={color.token} className="border-b border-r border-[var(--sh-rule)] bg-[var(--sh-white)]">
              <div className="h-16 border-b border-[var(--sh-rule)]" style={{ backgroundColor: `var(${color.token})` }} />
              <div className="p-3">
                <p className="sh-mono text-[9px]">{color.name}</p><p className="sh-mono mt-1 text-[8px] text-[var(--sh-muted)]">{color.value}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--sh-muted)]">{color.use}</p>
              </div>
            </article>)}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 border border-[var(--sh-rule)] bg-[var(--sh-paper)] p-4"><span className="h-8 w-8 shrink-0 border border-[var(--sh-rule)] bg-[var(--sh-white)]" /><p className="text-xs leading-relaxed"><strong>Paper → document white</strong><br /><span className="text-[var(--sh-muted)]">Surface shift, not a card grid.</span></p></div>
            <div className="flex items-center gap-3 border border-[var(--sh-rule)] bg-[var(--sh-soft-red)] p-4"><span className="h-8 w-1 shrink-0 bg-[var(--sh-red)]" /><p className="text-xs leading-relaxed"><strong>Crimson → correction / emphasis</strong><br /><span className="text-[var(--sh-muted)]">A signal, never decoration everywhere.</span></p></div>
            <div className="flex items-center gap-3 border border-[var(--sh-rule)] bg-[var(--sh-soft-blue)] p-4"><span className="h-8 w-1 shrink-0 bg-[var(--sh-blue)]" /><p className="text-xs leading-relaxed"><strong>Blue → source / reference</strong><br /><span className="text-[var(--sh-muted)]">Links and evidence cues.</span></p></div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="grid gap-4 border-y border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_280px] sm:items-end">
            <div><p className="sh-kicker">03 / Accessible contrast</p><h2 className="sh-serif mt-2 text-4xl sm:text-5xl">Legible by design.</h2></div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">Ratios shown are calculated from the shared palette values. WCAG AA text contrast minimum is 4.5:1 for normal text.</p>
          </div>
          <div className="mt-5 border-t-2 border-[var(--sh-ink)]">
            <ContrastRow label="Ink on paper" foreground="#202633" background="#f4f0e8" ratio="13.33" note="Core reading text / AAA for normal text" />
            <ContrastRow label="Muted on document white" foreground="#6f706f" background="#fffdf8" ratio="4.89" note="Secondary text / AA for normal text" />
            <ContrastRow label="Crimson on paper" foreground="#a9322a" background="#f4f0e8" ratio="5.82" note="Editorial accent / AA for normal text" />
            <ContrastRow label="Amber on paper" foreground="#896321" background="#f4f0e8" ratio="4.77" note="Caution labels / AA for normal text" />
            <ContrastRow label="Blue on paper" foreground="#315c76" background="#f4f0e8" ratio="6.32" note="Links / AA for normal text" />
          </div>
          <div className="mt-4 flex items-start gap-3 border-l-2 border-[var(--sh-amber)] bg-[#f0eadb] p-4">
            <CircleHelp size={16} className="mt-0.5 shrink-0 text-[var(--sh-amber)]" /><p className="text-xs leading-relaxed">Contrast describes these tested pairings, not every possible use. Do not place small text directly on the soft tints without checking the actual combination.</p>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="grid gap-4 border-y border-[var(--sh-rule)] py-5 sm:grid-cols-[1fr_280px] sm:items-end">
            <div><p className="sh-kicker">04 / Spacing & borders</p><h2 className="sh-serif mt-2 text-4xl sm:text-5xl">Room to inspect.</h2></div>
            <p className="text-sm leading-relaxed text-[var(--sh-muted)]">A practical spacing rhythm for information hierarchy; these are layout measurements, not added CSS variables.</p>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="border-t-2 border-[var(--sh-ink)]">
              {spacing.map((step) => <div key={step.name} className="grid grid-cols-[120px_1fr_150px] items-center gap-3 border-b border-[var(--sh-rule)] py-3">
                <span className="sh-mono text-[9px]">{step.name}</span><span className="h-2 max-w-full bg-[var(--sh-red)]" style={{ width: step.width }} /><span className="text-[10px] text-[var(--sh-muted)]">{step.value} · {step.note}</span>
              </div>)}
            </div>
            <div className="border border-[var(--sh-rule)] bg-[var(--sh-white)] p-5">
              <p className="sh-kicker">Border roles</p>
              <div className="mt-4 space-y-4">
                <div><div className="h-[2px] bg-[var(--sh-ink)]" /><p className="sh-mono mt-2 text-[8px] text-[var(--sh-muted)]">2 px / section or source anchor</p></div>
                <div><div className="h-px bg-[var(--sh-rule)]" /><p className="sh-mono mt-2 text-[8px] text-[var(--sh-muted)]">1 px / quiet division</p></div>
                <div className="flex items-center gap-2"><Minus size={14} className="text-[var(--sh-red)]" /><p className="sh-mono text-[8px] text-[var(--sh-muted)]">Accent rule / status cue</p></div>
              </div>
              <p className="mt-5 border-t border-[var(--sh-rule)] pt-4 text-xs leading-relaxed text-[var(--sh-muted)]">Square corners, fine rules and clear spacing keep hierarchy document-like, not dashboard-like.</p>
            </div>
          </div>
        </section>

        <section className="mt-4 border-y-2 border-[var(--sh-ink)] py-7">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div><p className="sh-kicker">Shared CSS tokens / reference</p><p className="sh-serif mt-2 max-w-2xl text-3xl leading-tight">Palette, type and focus treatments are defined in the shared Signal Hub stylesheet.</p></div>
            <div className="flex flex-wrap gap-2">
              <a href="#top" className="sh-button">Back to top <ArrowUpRight size={12} /></a>
              <a href="#colors" className="sh-button sh-button--outline">Color roles <Check size={12} /></a>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default Tokens;