import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGIONS, regionSlug, STATE_PROFILES } from '../src/lib/states';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, '../dist/public');
const origin = (process.env.VITE_SITE_URL || 'https://thesignal24.com').replace(/\/$/, '');
const template = await readFile(path.join(outputDir, 'index.html'), 'utf8');

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function escapeJsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}

function renderArticleBody(markdown: string) {
  const inline = (value: string) => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  const blocks = markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block) => {
    if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
    let lines = block.split('\n');
    if (lines[0].startsWith(':::')) {
      const heading = lines[0].replace(/^:::\s*/, '').replace(/^\[[^\]]+\]\s*/, '').trim();
      lines = lines.slice(1);
      const section = heading ? `<h2>${inline(heading)}</h2>` : '';
      if (!lines.length) return section;
      const body = lines.every((line) => line.startsWith('- '))
        ? `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`
        : `<p>${lines.map((line) => inline(line.replace(/^[?>]\s*/, ''))).join('<br />')}</p>`;
      return `<section>${section}${body}</section>`;
    }
    if (lines.every((line) => line.startsWith('- '))) {
      return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    }
    return lines.map((line) => line.startsWith('? ')
      ? `<blockquote>${inline(line.slice(2))}</blockquote>`
      : line.startsWith('> ')
        ? `<blockquote>${inline(line.slice(2))}</blockquote>`
        : `<p>${inline(line)}</p>`).join('\n');
  }).join('\n');
}

function htmlDocument({
  path: routePath,
  lang,
  title,
  description,
  content,
  structuredData,
  translated = true,
}: {
  path: string;
  lang: 'en' | 'hi';
  title: string;
  description: string;
  content: string;
  structuredData: Record<string, unknown>;
  translated?: boolean;
}) {
  const canonical = `${origin}${routePath}`;
  const htmlLang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const enPath = routePath.startsWith('/hi') ? routePath.slice(3) || '/' : routePath;
  const hiPath = `/hi${enPath === '/' ? '' : enPath}`;
  let document = template
    .replace('<html lang="en-IN">', `<html lang="${htmlLang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta http-equiv="content-language" content="[^"]*"\s*\/>/, `<meta http-equiv="content-language" content="${htmlLang}" />`)
    .replace(/<meta property="og:locale" content="[^"]*"\s*\/>/, `<meta property="og:locale" content="${lang === 'hi' ? 'hi_IN' : 'en_IN'}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace('</head>', `  <link rel="canonical" href="${escapeHtml(canonical)}" />\n${translated ? `  <link rel="alternate" hreflang="en-IN" href="${escapeHtml(`${origin}${enPath}`)}" />\n  <link rel="alternate" hreflang="hi-IN" href="${escapeHtml(`${origin}${hiPath}`)}" />\n  <link rel="alternate" hreflang="x-default" href="${escapeHtml(`${origin}${enPath}`)}" />\n` : ''}  <script type="application/ld+json">${escapeJsonLd(structuredData)}</script>\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  return document;
}

function writeRoute(routePath: string, html: string) {
  const routeDir = path.join(outputDir, routePath.replace(/^\/|\/$/g, ''));
  return mkdir(routeDir, { recursive: true }).then(() => writeFile(path.join(routeDir, 'index.html'), html, 'utf8'));
}

function staticHome(lang: 'en' | 'hi') {
  const isHindi = lang === 'hi';
  const routePath = isHindi ? '/hi' : '/';
  const title = isHindi ? 'द सिग्नल 24 — सत्ता, दस्तावेज़ों के साथ' : 'The Signal 24 — Power, on the record';
  const description = isHindi
    ? 'आरक्षण और प्रतिनिधित्व पर भारत की सरकारों, अदालतों और एजेंसियों को उनके अपने रिकॉर्ड पर परखता जनहित न्यूज़रूम।'
    : 'A public-interest newsroom holding India’s governments, courts and agencies to their own records on reservation and representation.';
  const intro = isHindi
    ? 'द सिग्नल 24 आरक्षण और प्रतिनिधित्व पर भारत की सरकारों, अदालतों और एजेंसियों को उनके अपने दस्तावेज़ों पर परखता है। हर प्रकाशित दावे के साथ उसका स्रोत और सत्यापन स्थिति दी जाती है।'
    : 'The Signal 24 holds India’s governments, courts and agencies to their own records on reservation and representation. Published claims carry their sources and verification status.';
  const sections = isHindi
    ? [['राज्य और केंद्रशासित प्रदेश', '/hi/states'], ['नीति रजिस्टर', '/hi/policies'], ['अभिलेखागार', '/hi/archive'], ['तरीक़ा और मानक', '/hi/methodology']]
    : [['States and Union Territories', '/states'], ['Policy ledger', '/policies'], ['Archive', '/archive'], ['Methodology and standards', '/methodology']];
  const content = `<main lang="${isHindi ? 'hi' : 'en'}" style="max-width:52rem;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;line-height:1.7;color:#202b35"><p>${escapeHtml(isHindi ? 'जनहित न्यूज़रूम · अंग्रेज़ी और हिंदी' : 'Public-interest newsroom · English and Hindi')}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(intro)}</p><nav aria-label="${isHindi ? 'मुख्य अनुभाग' : 'Main sections'}"><ul>${sections.map(([label, href]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('')}</ul></nav><p><a href="${isHindi ? '/' : '/hi'}">${isHindi ? 'English edition' : 'हिंदी संस्करण'}</a></p></main>`;
  return { routePath, title, description, content };
}

const jobs: Promise<unknown>[] = [];
for (const lang of ['en', 'hi'] as const) {
  const home = staticHome(lang);
  jobs.push(writeRoute(home.routePath, htmlDocument({
    path: home.routePath,
    title: home.title,
    description: home.description,
    content: home.content,
    lang,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Signal 24',
      url: `${origin}${home.routePath}`,
      inLanguage: lang === 'hi' ? 'hi-IN' : 'en-IN',
      description: home.description,
    },
  })));

  const statesPath = lang === 'hi' ? '/hi/states' : '/states';
  const statesTitle = lang === 'hi' ? 'राज्य और केंद्रशासित प्रदेश — द सिग्नल 24' : 'States and Union Territories — The Signal 24';
  const statesDescription = lang === 'hi'
    ? 'भारत के सभी 28 राज्य और 8 केंद्रशासित प्रदेश: आरक्षण क़ानून, अदालतों और स्रोत-आधारित रिकॉर्ड की स्थिति।'
    : 'Coverage of all 28 Indian states and 8 Union Territories: reservation laws, court cases and source-linked records.';
  const regionLinks = REGIONS.map((region) => {
    const name = lang === 'hi' ? region.hi : region.name;
    return `<li><a href="${lang === 'hi' ? '/hi' : ''}/state/${regionSlug(region.name)}">${escapeHtml(name)}</a><span> — ${escapeHtml(STATE_PROFILES[region.name]?.status[lang] ?? (lang === 'hi' ? 'रिकॉर्ड की स्थिति' : 'Record status'))}</span></li>`;
  }).join('');
  jobs.push(writeRoute(statesPath, htmlDocument({
    path: statesPath,
    lang,
    title: statesTitle,
    description: statesDescription,
    content: `<main lang="${lang}" style="max-width:60rem;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;line-height:1.7;color:#202b35"><nav><a href="${lang === 'hi' ? '/hi' : '/'}">${lang === 'hi' ? 'मुखपृष्ठ' : 'Home'}</a></nav><h1>${escapeHtml(statesTitle)}</h1><p>${escapeHtml(statesDescription)}</p><ul>${regionLinks}</ul></main>`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: statesTitle,
      description: statesDescription,
      url: `${origin}${statesPath}`,
      inLanguage: lang === 'hi' ? 'hi-IN' : 'en-IN',
    },
  })));

  for (const region of REGIONS) {
    const profile = STATE_PROFILES[region.name];
    const slug = regionSlug(region.name);
    const routePath = `${lang === 'hi' ? '/hi' : ''}/state/${slug}`;
    const name = lang === 'hi' ? region.hi : region.name;
    const title = `${name} — ${lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}`;
    const description = profile?.summary[lang] ?? (lang === 'hi'
      ? `${name} पर आरक्षण क़ानून, अदालतों के मामले और उपलब्ध सार्वजनिक रिकॉर्ड।`
      : `Reservation laws, court cases and public records for ${name}.`);
    const facts = (profile?.facts ?? []).map((fact) => `<li><time datetime="${escapeHtml(fact.when)}">${escapeHtml(fact.when)}</time><p>${escapeHtml(fact.text[lang])}</p>${fact.source ? `<p><a href="${escapeHtml(fact.source.url)}" rel="noopener noreferrer">${lang === 'hi' ? 'स्रोत' : 'Source'}: ${escapeHtml(fact.source.label)}</a></p>` : ''}${fact.review ? `<p>${lang === 'hi' ? 'स्थिति जाँची' : 'Status checked'} ${escapeHtml(fact.review.checkedOn)} · ${escapeHtml(fact.review.nextCheck[lang])}</p>` : ''}</li>`).join('');
    const questions = (profile?.questions ?? []).map((question) => `<li>${escapeHtml(question[lang])}</li>`).join('');
    const kind = region.kind === 'ut' ? (lang === 'hi' ? 'केंद्रशासित प्रदेश' : 'Union Territory') : (lang === 'hi' ? 'राज्य' : 'State');
    const content = `<main lang="${lang}" style="max-width:60rem;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;line-height:1.7;color:#202b35"><nav aria-label="${lang === 'hi' ? 'ब्रेडक्रंब' : 'Breadcrumb'}"><a href="${lang === 'hi' ? '/hi' : ''}/states">${lang === 'hi' ? 'सभी राज्य' : 'All states'}</a> / ${escapeHtml(kind)}</nav><article><h1>${escapeHtml(name)}</h1>${profile ? `<p><strong>${escapeHtml(profile.status[lang])}</strong></p><p>${escapeHtml(profile.summary[lang])}</p><h2>${lang === 'hi' ? 'तारीख़वार स्थिति' : 'Where it stands, in dates'}</h2><ol>${facts}</ol><h2>${lang === 'hi' ? 'अभी खुले सवाल' : 'Open questions'}</h2><ol>${questions}</ol>` : `<p>${lang === 'hi' ? 'इस राज्य पर स्रोत-आधारित रिकॉर्ड अभी प्रकाशित नहीं हुआ है।' : 'A sourced profile is not yet available for this state.'}</p>`}<h2>${lang === 'hi' ? 'आगे जाँचें' : 'What to check next'}</h2><p>${lang === 'hi' ? 'राज्य के राजपत्र, पिछड़ा वर्ग आयोग की रिपोर्ट और सरकारी सेवाओं में जाति-वार प्रतिनिधित्व के रिकॉर्ड देखें।' : 'Check the state gazette, backward classes commission reports and caste-wise representation in public services.'}</p></article></main>`;
    jobs.push(writeRoute(routePath, htmlDocument({
      path: routePath,
      lang,
      title,
      description,
      content,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${origin}${routePath}`,
        inLanguage: lang === 'hi' ? 'hi-IN' : 'en-IN',
        about: { '@type': 'Place', name: region.name, containedInPlace: { '@type': 'Country', name: 'India' } },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: lang === 'hi' ? 'राज्य' : 'States', item: `${origin}${lang === 'hi' ? '/hi/states' : '/states'}` },
            { '@type': 'ListItem', position: 2, name, item: `${origin}${routePath}` },
          ],
        },
      },
    })));
  }
}

await Promise.all(jobs);
const apiBase = (process.env.PRERENDER_API_URL || 'http://127.0.0.1:8080/api').replace(/\/$/, '');
const archiveResponse = await fetch(`${apiBase}/archive?limit=100`);
if (!archiveResponse.ok) {
  throw new Error(`Story prerender requires a reachable public archive API; ${archiveResponse.status} from ${apiBase}/archive.`);
}
const archive = await archiveResponse.json() as { stories?: Array<{
  canonicalPath: string;
  title: string;
  dek: string;
  body: string;
  source: string;
  sourceUrl: string;
  publishedOn: string;
  articlePublishedAt: string | null;
  workflowStatus: string;
  indexable: boolean;
  verificationStatus: string;
  hi?: { title?: string; dek?: string; body?: string; eyebrow?: string } | null;
}> };
const stories = (archive.stories ?? []).filter((story) => story.workflowStatus === 'published' && story.indexable && story.canonicalPath.startsWith('/'));
for (const story of stories) {
  const editions = [
    { lang: 'en' as const, path: story.canonicalPath, title: story.title, description: story.dek, body: story.body },
    ...(story.hi?.title && story.hi.dek && story.hi.body
      ? [{ lang: 'hi' as const, path: `/hi${story.canonicalPath}`, title: story.hi.title, description: story.hi.dek, body: story.hi.body }]
      : []),
  ];
  for (const edition of editions) {
    const publicationDate = story.articlePublishedAt ?? story.publishedOn;
    const imageUrl = `${origin}/images/og-default.jpg`;
    const articleContent = `<main lang="${edition.lang}" style="max-width:60rem;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;line-height:1.75;color:#202b35"><article><header><p>${edition.lang === 'hi' ? 'द सिग्नल 24 / स्रोत-आधारित रिकॉर्ड' : 'The Signal 24 / source-linked record'}</p><h1>${escapeHtml(edition.title)}</h1><p>${escapeHtml(edition.description)}</p><p>${escapeHtml(publicationDate)} · ${escapeHtml(story.verificationStatus)}</p></header><div>${renderArticleBody(edition.body)}</div><p><a href="${escapeHtml(story.sourceUrl)}" rel="noopener noreferrer">${edition.lang === 'hi' ? 'मूल स्रोत खोलें' : 'Open the original source'}: ${escapeHtml(story.source)}</a></p></article></main>`;
    jobs.push(writeRoute(edition.path, htmlDocument({
      path: edition.path,
      lang: edition.lang,
      title: `${edition.title} — ${edition.lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}`,
      description: edition.description,
      content: articleContent,
      translated: editions.length > 1,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: edition.title,
        description: edition.description,
        url: `${origin}${edition.path}`,
        image: imageUrl,
        datePublished: publicationDate,
        dateModified: publicationDate,
        inLanguage: edition.lang === 'hi' ? 'hi-IN' : 'en-IN',
        isAccessibleForFree: true,
        citation: story.sourceUrl,
        publisher: { '@type': 'Organization', name: 'The Signal 24', url: origin },
      },
    })));
  }
}
const policyResponse = await fetch(`${apiBase}/policies?limit=100`);
if (!policyResponse.ok) {
  throw new Error(`Story prerender requires policy records too; ${policyResponse.status} from ${apiBase}/policies.`);
}
const policyPayload = await policyResponse.json() as { records?: Array<{
  canonicalPath: string;
  title: string;
  summary: string;
  authority: string;
  previousFramework: string;
  newFramework: string;
  legalBasis: string;
  courtStatus: string;
  effectiveDate: string | null;
  publishedOn: string;
  hi?: {
    title?: string;
    summary?: string;
    authority?: string;
    previousFramework?: string;
    newFramework?: string;
    legalBasis?: string;
    courtStatus?: string;
  } | null;
  sources?: Array<{ title?: string; url?: string }>;
}> };
for (const record of policyPayload.records ?? []) {
  const editions = [
    { lang: 'en' as const, path: record.canonicalPath, title: record.title, summary: record.summary, authority: record.authority, previous: record.previousFramework, next: record.newFramework, basis: record.legalBasis, status: record.courtStatus },
    ...(record.hi?.title && record.hi.summary
      ? [{ lang: 'hi' as const, path: `/hi${record.canonicalPath}`, title: record.hi.title, summary: record.hi.summary, authority: record.hi.authority ?? record.authority, previous: record.hi.previousFramework ?? record.previousFramework, next: record.hi.newFramework ?? record.newFramework, basis: record.hi.legalBasis ?? record.legalBasis, status: record.hi.courtStatus ?? record.courtStatus }]
      : []),
  ];
  for (const edition of editions) {
    const sources = (record.sources ?? []).filter((source) => source.url?.startsWith('https://')).map((source) => `<li><a href="${escapeHtml(source.url!)}" rel="noopener noreferrer">${escapeHtml(source.title ?? source.url!)}</a></li>`).join('');
    const title = `${edition.title} — ${edition.lang === 'hi' ? 'द सिग्नल 24' : 'The Signal 24'}`;
    const content = `<main lang="${edition.lang}" style="max-width:60rem;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;line-height:1.75;color:#202b35"><article><header><p>${edition.lang === 'hi' ? 'नीति रजिस्टर / स्रोत-आधारित रिकॉर्ड' : 'Policy ledger / source-linked record'}</p><h1>${escapeHtml(edition.title)}</h1><p>${escapeHtml(edition.summary)}</p></header><h2>${edition.lang === 'hi' ? 'प्राधिकारी' : 'Authority'}</h2><p>${escapeHtml(edition.authority)}</p><h2>${edition.lang === 'hi' ? 'पहले का ढाँचा' : 'Previous framework'}</h2><p>${escapeHtml(edition.previous)}</p><h2>${edition.lang === 'hi' ? 'नया ढाँचा' : 'New framework'}</h2><p>${escapeHtml(edition.next)}</p><h2>${edition.lang === 'hi' ? 'क़ानूनी आधार और अदालत की स्थिति' : 'Legal basis and court status'}</h2><p>${escapeHtml(edition.basis)}</p><p>${escapeHtml(edition.status)}</p><h2>${edition.lang === 'hi' ? 'स्रोत' : 'Sources'}</h2><ul>${sources}</ul></article></main>`;
    jobs.push(writeRoute(edition.path, htmlDocument({
      path: edition.path,
      lang: edition.lang,
      title,
      description: edition.summary,
      content,
      translated: editions.length > 1,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description: edition.summary,
        url: `${origin}${edition.path}`,
        inLanguage: edition.lang === 'hi' ? 'hi-IN' : 'en-IN',
        datePublished: record.publishedOn,
        dateModified: record.publishedOn,
      },
    })));
  }
}
await Promise.all(jobs);
console.log(`Prerendered ${jobs.length} pages, including ${stories.length} published stories and ${policyPayload.records?.length ?? 0} policy records.`);
