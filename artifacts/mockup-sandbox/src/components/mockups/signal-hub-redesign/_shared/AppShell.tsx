import { FormEvent, ReactNode, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import '../_group.css';

const previewRoot = '/__mockup/preview/signal-hub-redesign/';

const navItems = [
  { label: 'Investigations', page: 'Home' },
  { label: 'Latest', page: 'SearchResults' },
  { label: 'Explainers', page: 'Article' },
  { label: 'Data', page: 'DataExplorer' },
  { label: 'Archive', page: 'Archive' },
  { label: 'About', page: 'About' },
];

type AppShellProps = {
  children: ReactNode;
  active?: string;
};

export function AppShell({ children, active }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = `${previewRoot}SearchResults?q=${encodeURIComponent(query)}`;
    window.location.href = destination;
  }

  const links = navItems.map(({ label, page }) => (
    <a
      key={label}
      href={`${previewRoot}${page}`}
      aria-current={active === label ? 'page' : undefined}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </a>
  ));

  return (
    <div className="signal-hub">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <div className="sh-topline">
        <div className="sh-container flex min-h-[31px] items-center justify-between gap-4">
          <p className="sh-mono flex items-center gap-2 text-[9px] text-[#f4f0e8]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c7483d]" />
            A public-interest source desk
          </p>
          <p className="sh-mono hidden text-[9px] text-[#c4c1bd] sm:block">
            India / policy, law &amp; public life
          </p>
        </div>
      </div>

      <header className="sh-header">
        <div className="sh-container sh-header-inner">
          <a className="sh-brand" href={`${previewRoot}Home`} aria-label="Signal Hub home">
            <span className="sh-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5.5 12h3l1.6-3.2 3.2 6.4 1.6-3.2h3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </span>
            <span className="sh-brand-name">
              SIGNAL <span className="text-[var(--sh-red)]">HUB</span>
            </span>
          </a>

          <nav aria-label="Primary navigation" className="sh-nav">
            {links}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="sh-icon-button"
            >
              {searchOpen ? <X size={17} strokeWidth={1.6} /> : <Search size={17} strokeWidth={1.6} />}
            </button>
            <a className="sh-button sh-follow-link !min-h-[36px] !px-3" href={`${previewRoot}About#newsletter`}>
              Follow the evidence
            </a>
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="sh-icon-button sh-menu-button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            role="search"
            onSubmit={submitSearch}
            className="sh-search-panel"
          >
            <div className="sh-container flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="sh-kicker mb-1 block">Search Signal Hub</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Investigations, documents, dates, topics…"
                  className="sh-input"
                />
              </label>
              <button className="sh-button" type="submit">
                Search archive
              </button>
            </div>
          </form>
        )}

        {menuOpen && (
          <nav aria-label="Mobile navigation" className="sh-mobile-nav">
            <div className="sh-container py-2">{links}</div>
          </nav>
        )}
      </header>

      <main id="main">{children}</main>

      <footer className="sh-footer mt-20">
        <div className="sh-container grid gap-8 py-9 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <a href={`${previewRoot}Home`} className="sh-brand">
              <span className="sh-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5.5 12h3l1.6-3.2 3.2 6.4 1.6-3.2h3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </span>
              <span className="sh-brand-name">
                SIGNAL <span className="text-[var(--sh-red)]">HUB</span>
              </span>
            </a>
            <p className="mt-3 max-w-xl text-sm text-[var(--sh-muted)]">
              Follow the evidence. Signal Hub separates documented facts,
              analysis and opinion.
            </p>
          </div>
          <div className="sh-mono flex flex-wrap gap-x-5 gap-y-2 text-[9px] text-[var(--sh-muted)]">
            <a href={`${previewRoot}Archive`}>Archive</a>
            <a href={`${previewRoot}About`}>Methodology</a>
            <span>Preview / September 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}