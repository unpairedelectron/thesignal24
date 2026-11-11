// Share on WhatsApp, where most news in India travels. A plain link to wa.me, so it
// works on phones (opens the app) and desktops (opens WhatsApp Web), with no script.
import { useT } from '@/lib/i18n';
import { absoluteSiteUrl } from '@/lib/seo';
import { WHATSAPP_CHANNEL_URL } from '@/lib/social';

export function whatsAppShareUrl(title: string, summary: string | null | undefined, path: string) {
  const text = [title, summary ? summary.slice(0, 220).trim() + (summary.length > 220 ? '…' : '') : '', absoluteSiteUrl(path)].filter(Boolean).join('\n\n');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function WhatsAppGlyph() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.48 15.04L2 22l5.1-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.03.9.92-2.95-.2-.31a8.2 8.2 0 1 1 6.79 3.69Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.25 3.75c1.58.68 2.2.74 2.99.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg>;
}

/** "Share on WhatsApp" for a page: title, a short summary and the page's own link. */
export function WhatsAppShare({ title, summary, path, testId }: { title: string; summary?: string | null; path: string; testId?: string }) {
  const t = useT();
  return <a className="share-button is-whatsapp" href={whatsAppShareUrl(title, summary, path)} target="_blank" rel="noopener noreferrer" data-testid={testId ?? 'link-share-whatsapp'}><WhatsAppGlyph /> {t('Share on WhatsApp', 'व्हाट्सऐप पर भेजें')}</a>;
}

/** Follow the WhatsApp Channel, shown only once the channel exists (see lib/social.ts). */
export function WhatsAppFollow({ className }: { className?: string }) {
  const t = useT();
  if (!WHATSAPP_CHANNEL_URL) return null;
  return <a className={className ?? 'share-button is-whatsapp'} href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp-channel"><WhatsAppGlyph /> {t('Follow on WhatsApp', 'व्हाट्सऐप पर फ़ॉलो करें')}</a>;
}
