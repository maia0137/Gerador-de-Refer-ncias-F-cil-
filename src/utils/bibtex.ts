import { ReferenceItem, Author } from '../types';

// Helper to escape LaTeX characters
function escapeBibTeX(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/_/g, '\\_');
}

// Format authors for BibTeX: "Lastname, Firstname and Lastname, Firstname"
function formatAuthorsBibTeX(authors: Author[]): string {
  if (!authors || authors.length === 0) return 'Unknown';
  return authors
    .map((a) => {
      if (a.isOrganization) {
        return `{${a.lastName}}`; // Double braces preserve organization names in BibTeX
      }
      return `${a.lastName}, ${a.firstName}`;
    })
    .join(' and ');
}

// Generate unique BibTeX citation key
export function generateBibTeXKey(item: ReferenceItem): string {
  const authorPart =
    item.authors && item.authors.length > 0
      ? item.authors[0].lastName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // remove accents
          .replace(/[^a-z0-9]/g, '')
      : 'unknown';

  const yearPart = item.year || '0000';

  const titlePart = item.title
    ? item.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)[0]
        .replace(/[^a-z0-9]/g, '')
    : 'title';

  return `${authorPart}${yearPart}${titlePart}`;
}

export function convertToBibTeX(item: ReferenceItem): string {
  const key = generateBibTeXKey(item);
  const authorStr = escapeBibTeX(formatAuthorsBibTeX(item.authors));
  const titleStr = escapeBibTeX(item.title);
  const yearStr = escapeBibTeX(item.year);
  const urlStr = escapeBibTeX(item.url);
  const doiStr = escapeBibTeX(item.doi);

  let fields: string[] = [
    `  author    = {${authorStr}}`,
    `  title     = {${titleStr}}`,
    `  year      = {${yearStr}}`,
  ];

  if (urlStr) {
    fields.push(`  url       = {${urlStr}}`);
  }
  if (doiStr) {
    fields.push(`  doi       = {${doiStr}}`);
  }

  let entryType = 'misc';

  switch (item.type) {
    case 'LIVRO':
      entryType = 'book';
      if (item.publisher) fields.push(`  publisher = {${escapeBibTeX(item.publisher)}}`);
      if (item.city) fields.push(`  address   = {${escapeBibTeX(item.city)}}`);
      if (item.edition) fields.push(`  edition   = {${escapeBibTeX(item.edition)}}`);
      break;

    case 'CAPITULO':
      entryType = 'incollection';
      if (item.bookTitle) fields.push(`  booktitle = {${escapeBibTeX(item.bookTitle)}}`);
      if (item.publisher) fields.push(`  publisher = {${escapeBibTeX(item.publisher)}}`);
      if (item.city) fields.push(`  address   = {${escapeBibTeX(item.city)}}`);
      if (item.edition) fields.push(`  edition   = {${escapeBibTeX(item.edition)}}`);
      if (item.pages) fields.push(`  pages     = {${escapeBibTeX(item.pages)}}`);
      if (item.bookAuthors && item.bookAuthors.length > 0) {
        fields.push(`  editor    = {${escapeBibTeX(formatAuthorsBibTeX(item.bookAuthors))}}`);
      }
      break;

    case 'ARTIGO_PERIODICO':
      entryType = 'article';
      if (item.journal) fields.push(`  journal   = {${escapeBibTeX(item.journal)}}`);
      if (item.volume) fields.push(`  volume    = {${escapeBibTeX(item.volume)}}`);
      if (item.issue) fields.push(`  number    = {${escapeBibTeX(item.issue)}}`);
      if (item.pages) fields.push(`  pages     = {${escapeBibTeX(item.pages)}}`);
      break;

    case 'REVISTA':
      entryType = 'article';
      if (item.magazineName) fields.push(`  journal   = {${escapeBibTeX(item.magazineName)}}`);
      if (item.volume) fields.push(`  volume    = {${escapeBibTeX(item.volume)}}`);
      if (item.issue) fields.push(`  number    = {${escapeBibTeX(item.issue)}}`);
      if (item.pages) fields.push(`  pages     = {${escapeBibTeX(item.pages)}}`);
      if (item.month) fields.push(`  month     = {${escapeBibTeX(item.month)}}`);
      break;

    case 'NOTICIA_JORNAL':
      entryType = 'article';
      if (item.newspaperName) fields.push(`  journal   = {${escapeBibTeX(item.newspaperName)}}`);
      if (item.pages) fields.push(`  pages     = {${escapeBibTeX(item.pages)}}`);
      if (item.date) fields.push(`  date      = {${escapeBibTeX(item.date)}}`);
      break;

    case 'WEBSITE':
      entryType = 'misc';
      fields.push(`  howpublished = {Web Page}`);
      if (item.siteName) fields.push(`  note      = {Site: ${escapeBibTeX(item.siteName)}}`);
      if (item.accessDate) fields.push(`  urldate   = {${escapeBibTeX(item.accessDate)}}`);
      break;

    case 'VIDEO_YOUTUBE':
      entryType = 'misc';
      fields.push(`  howpublished = {Online Video}`);
      if (item.channel) fields.push(`  publisher = {${escapeBibTeX(item.channel)}}`);
      if (item.duration) fields.push(`  note      = {Duration: ${escapeBibTeX(item.duration)}}`);
      break;

    case 'FILME_SERIE':
      entryType = 'misc';
      fields.push(`  howpublished = {Motion Picture}`);
      if (item.director) fields.push(`  director  = {${escapeBibTeX(item.director)}}`);
      if (item.distributor) fields.push(`  publisher = {${escapeBibTeX(item.distributor)}}`);
      break;

    case 'REDE_SOCIAL':
      entryType = 'misc';
      fields.push(`  howpublished = {Social Media Post}`);
      if (item.platformName) fields.push(`  note      = {Platform: ${escapeBibTeX(item.platformName)}}`);
      break;
  }

  return `@${entryType}{${key},\n${fields.join(',\n')}\n}`;
}

export function generateAllBibTeX(items: ReferenceItem[]): string {
  return items.map(convertToBibTeX).join('\n\n');
}
