import { Fragment, type ReactNode } from 'react';

/**
 * Renders a record body written in a small, safe subset of Markdown.
 * Blocks are separated by a blank line:
 *
 *   ## Subhead                      section heading
 *   ### Label                       small accent label
 *   ? A question the record answers  question heading (accountability format)
 *   > Quoted text                    pull quote / quoted document text
 *   - item / 1. item                 bullet or numbered list (one item per line)
 *   ::: Box title                    key-facts box; following "- " lines are its items
 *   plain text                       paragraph
 *
 * Inline: **bold** and [link text](https://…). Only http(s) links are rendered
 * as anchors; nothing is injected as HTML.
 */
export function RichBody({ body, dropCap = true }: { body: string; dropCap?: boolean }) {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  let paragraphSeen = false;
  return <>
    {blocks.map((block, index) => {
      const key = `block-${index}`;
      const lines = block.split('\n').map((line) => line.trim());
      if (block.startsWith('### ')) return <h3 key={key}>{inline(block.slice(4))}</h3>;
      if (block.startsWith('## ')) return <h2 key={key}>{inline(block.slice(3))}</h2>;
      if (block.startsWith('? ')) return <p key={key} className="record-question" role="heading" aria-level={2}>{inline(block.slice(2))}</p>;
      if (block.startsWith('::: ')) {
        const [title, ...items] = lines;
        return <aside key={key} className="record-facts"><p>{inline(title.slice(4))}</p>{list(items, `${key}-items`)}</aside>;
      }
      if (lines.every((line) => line.startsWith('> '))) {
        return <blockquote key={key}>{lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{inline(line.slice(2))}</Fragment>)}</blockquote>;
      }
      if (lines.every((line) => /^(- |\d+\. )/.test(line))) return <Fragment key={key}>{list(lines, key)}</Fragment>;
      const isFirstParagraph = !paragraphSeen;
      paragraphSeen = true;
      return <p key={key} className={dropCap && isFirstParagraph ? 'has-dropcap' : undefined}>{lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && ' '}{inline(line)}</Fragment>)}</p>;
    })}
  </>;
}

function list(lines: string[], key: string) {
  const items = lines.filter((line) => /^(- |\d+\. )/.test(line));
  if (items.length === 0) return null;
  const ordered = /^\d+\. /.test(items[0]);
  const content = items.map((line, index) => <li key={index}>{inline(line.replace(/^(- |\d+\. )/, ''))}</li>);
  return ordered ? <ol key={key}>{content}</ol> : <ul key={key}>{content}</ul>;
}

const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    if (match[1] !== undefined) nodes.push(<strong key={start}>{match[1]}</strong>);
    else nodes.push(<a key={start} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>);
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Plain-text version of a rich body (for word counts and descriptions). */
export function plainText(body: string) {
  return body
    .replace(/^(#{2,3} |\? |> |- |\d+\. |::: )/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1');
}
