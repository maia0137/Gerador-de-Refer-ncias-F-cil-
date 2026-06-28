import { ReferenceItem, FormattedResult, Author } from '../types';

// Função para formatar os autores no padrão APA 7
export function formatAuthorsAPA(authors: Author[]): string {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatSingle = (a: Author) => {
    if (a.isOrganization) return a.lastName;
    
    // Extrai as iniciais do primeiro nome
    const nameParts = a.firstName.trim().split(/\s+/);
    const initials = nameParts
      .map((part) => {
        // Ignora partículas menores como "de", "da", "do" se vierem no meio
        if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(part.toLowerCase())) {
          return '';
        }
        return part.charAt(0).toUpperCase() + '.';
      })
      .filter(Boolean)
      .join(' ');

    return `${a.lastName}, ${initials}`;
  };

  if (authors.length === 1) {
    return formatSingle(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatSingle(authors[0])} & ${formatSingle(authors[1])}`;
  }

  if (authors.length <= 20) {
    const formatted = authors.map(formatSingle);
    const last = formatted.pop();
    return `${formatted.join(', ')}, & ${last}`;
  }

  // Mais de 20 autores: primeiros 19, reticências, e o último
  const first19 = authors.slice(0, 19).map(formatSingle);
  const lastAuthor = formatSingle(authors[authors.length - 1]);
  return `${first19.join(', ')}, ... ${lastAuthor}`;
}

// Formatação de autores para citação APA (Narrativa e Parentética)
export function formatCitationAuthorAPA(authors: Author[]): string {
  if (!authors || authors.length === 0) return 'Unknown Author';

  const formatSingle = (a: Author) => a.lastName;

  if (authors.length === 1) {
    return formatSingle(authors[0]);
  }

  if (authors.length === 2) {
    // Retorna com '&' para parentética, mas no chamador faremos a diferenciação para narrativa
    return `${formatSingle(authors[0])} & ${formatSingle(authors[1])}`;
  }

  // 3 ou mais autores: Silva et al.
  return `${formatSingle(authors[0])} et al.`;
}

// Formatador de data completo para APA: (YYYY, Month DD) ou (YYYY)
export function formatDateAPA(dateStr: string | undefined, yearOnly: boolean = false): string {
  if (!dateStr) return 'n.d.'; // no date
  
  const parts = dateStr.split('-');
  if (parts.length < 3) return parts[0] || 'n.d.';
  
  const year = parts[0];
  if (yearOnly) return year;

  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  // Meses em inglês para APA
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[monthIndex] || '';

  return `${year}, ${monthName} ${day}`;
}

// FORMATADOR PRINCIPAL APA
export function formatAPA(item: ReferenceItem): FormattedResult {
  const authorText = formatAuthorsAPA(item.authors);
  const citationAuthor = formatCitationAuthorAPA(item.authors);
  const year = item.year || 'n.d.';

  let bibHtml = '';
  let bibMd = '';

  const cleanTitle = item.title.trim();

  // Helper para formatar o DOI em APA (sempre como URL completa)
  const formatDoiAPA = (doi: string) => {
    if (!doi) return '';
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '');
    return ` https://doi.org/${cleanDoi}`;
  };

  const doiSuffix = formatDoiAPA(item.doi);

  // Helper para URL em APA (sem "Disponível em" ou "Acesso em" a menos que exija recuperação especial)
  const urlSuffix = item.url ? ` ${item.url}` : '';

  switch (item.type) {
    case 'LIVRO': {
      const publisher = item.publisher || 'Publisher unknown';
      const editionStr = item.edition ? ` (${item.edition} ed.).` : '';

      bibHtml = `${authorText} (${year}). <i>${cleanTitle}</i>${editionStr}. ${publisher}.${doiSuffix || urlSuffix}`;
      bibMd = `${authorText} (${year}). _${cleanTitle}_${editionStr}. ${publisher}.${doiSuffix || urlSuffix}`;
      break;
    }

    case 'CAPITULO': {
      const bookTitle = item.bookTitle || 'Book Title';
      const publisher = item.publisher || 'Publisher unknown';
      const pagesStr = item.pages ? ` (pp. ${item.pages})` : '';
      const editionStr = item.edition ? `, ${item.edition} ed.` : '';

      let bookAuthorText = '';
      if (item.bookAuthors && item.bookAuthors.length > 0) {
        // No APA, iniciais do editor vem ANTES do sobrenome em "In F. M. Editor (Ed.)"
        bookAuthorText = item.bookAuthors.map(a => {
          if (a.isOrganization) return a.lastName;
          const initials = a.firstName.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + '.').join(' ');
          return `${initials} ${a.lastName}`;
        }).join(', ') + ' (Ed.)';
      }

      const inPrefix = bookAuthorText ? `In ${bookAuthorText}, ` : 'In ';

      bibHtml = `${authorText} (${year}). ${cleanTitle}. ${inPrefix}<i>${bookTitle}</i>${editionStr}${pagesStr}. ${publisher}.${doiSuffix || urlSuffix}`;
      bibMd = `${authorText} (${year}). ${cleanTitle}. ${inPrefix}_${bookTitle}_${editionStr}${pagesStr}. ${publisher}.${doiSuffix || urlSuffix}`;
      break;
    }

    case 'ARTIGO_PERIODICO': {
      const journal = item.journal || 'Journal name unknown';
      const volStr = item.volume ? ` <i>${item.volume}</i>` : '';
      const numStr = item.issue ? `(${item.issue})` : '';
      const pagesStr = item.pages ? `, ${item.pages}` : '';

      bibHtml = `${authorText} (${year}). ${cleanTitle}. <i>${journal}</i>,${volStr}${numStr}${pagesStr}.${doiSuffix || urlSuffix}`;
      bibMd = `${authorText} (${year}). ${cleanTitle}. _${journal}_,${volStr}${numStr}${pagesStr}.${doiSuffix || urlSuffix}`;
      break;
    }

    case 'REVISTA': {
      const magazine = item.magazineName || 'Magazine name unknown';
      const formattedDate = formatDateAPA(item.date || item.publishDate || item.year);
      const volStr = item.volume ? ` <i>${item.volume}</i>` : '';
      const numStr = item.issue ? `(${item.issue})` : '';
      const pagesStr = item.pages ? `, ${item.pages}` : '';

      bibHtml = `${authorText} (${formattedDate}). ${cleanTitle}. <i>${magazine}</i>,${volStr}${numStr}${pagesStr}.${urlSuffix}`;
      bibMd = `${authorText} (${formattedDate}). ${cleanTitle}. _${magazine}_,${volStr}${numStr}${pagesStr}.${urlSuffix}`;
      break;
    }

    case 'NOTICIA_JORNAL': {
      const newspaper = item.newspaperName || 'Newspaper name';
      const formattedDate = formatDateAPA(item.date);
      const pagesStr = item.pages ? `, p. ${item.pages}` : '';

      bibHtml = `${authorText} (${formattedDate}). ${cleanTitle}. <i>${newspaper}</i>${pagesStr}.${urlSuffix}`;
      bibMd = `${authorText} (${formattedDate}). ${cleanTitle}. _${newspaper}_${pagesStr}.${urlSuffix}`;
      break;
    }

    case 'WEBSITE': {
      const site = item.siteName || '';
      const formattedDate = formatDateAPA(item.publishDate || item.date);
      const siteSuffix = site ? ` ${site}.` : '';

      // APA prefere que o título seja em itálico para trabalhos independentes como posts de blog/páginas inteiras
      bibHtml = `${authorText} (${formattedDate}). <i>${cleanTitle}</i>.${siteSuffix}${urlSuffix}`;
      bibMd = `${authorText} (${formattedDate}). _${cleanTitle}_.${siteSuffix}${urlSuffix}`;
      break;
    }

    case 'VIDEO_YOUTUBE': {
      const channel = item.channel || 'Channel Name';
      const formattedDate = formatDateAPA(item.date);

      bibHtml = `${authorText}. (${formattedDate}). <i>${cleanTitle}</i> [Video]. ${channel}.${urlSuffix}`;
      bibMd = `${authorText}. (${formattedDate}). _${cleanTitle}_ [Video]. ${channel}.${urlSuffix}`;
      break;
    }

    case 'FILME_SERIE': {
      // Diretor é formatado como Nolan, C. (Director).
      const director = item.director ? `${item.director} (Director)` : 'Director Unknown';
      const distributor = item.distributor || 'Studio/Distributor';
      const formatType = item.format || 'Film';

      bibHtml = `${director}. (${year}). <i>${cleanTitle}</i> [${formatType}]. ${distributor}.${urlSuffix}`;
      bibMd = `${director}. (${year}). _${cleanTitle}_ [${formatType}]. ${distributor}.${urlSuffix}`;
      break;
    }

    case 'REDE_SOCIAL': {
      const platform = item.platformName || 'Social Media';
      const handle = item.username ? ` [${item.username}]` : '';
      const formattedDate = formatDateAPA(item.date);

      bibHtml = `${authorText}${handle}. (${formattedDate}). <i>${cleanTitle}</i> [Post]. ${platform}.${urlSuffix}`;
      bibMd = `${authorText}${handle}. (${formattedDate}). _${cleanTitle}_ [Post]. ${platform}.${urlSuffix}`;
      break;
    }

    default:
      bibHtml = `${authorText} (${year}). <i>${cleanTitle}</i>.`;
      bibMd = `${authorText} (${year}). _${cleanTitle}_.`;
  }

  // CITAÇÕES APA 7
  const p = item.pages ? ` p. ${item.pages.split('-')[0].trim()}` : ' p. xx';

  // Diferenciação para narrativa vs parentética em 2 autores (and vs &)
  let narrativeAuthor = citationAuthor;
  let parentheticalAuthor = citationAuthor;

  if (item.authors.length === 2) {
    const single0 = item.authors[0].lastName;
    const single1 = item.authors[1].lastName;
    narrativeAuthor = `${single0} and ${single1}`;
    parentheticalAuthor = `${single0} & ${single1}`;
  }

  const citationIndirectNarrative = `${narrativeAuthor} (${year})`;
  const citationIndirectParenthetical = `(${parentheticalAuthor}, ${year})`;

  const citationDirectShortNarrative = `According to ${narrativeAuthor} (${year},${p}), "insert citation text here"`;
  const citationDirectShortParenthetical = `"insert citation text here" (${parentheticalAuthor}, ${year},${p})`;

  const citationDirectLong = `    This is a long direct quotation consisting of 40 or more words, which should be styled as a free-standing block of typewritten lines with a left-margin indent of 0.5 inches (or 1.27 cm), double-spaced (or single-spaced for tight layouts), without quotation marks.\n\n    (${parentheticalAuthor}, ${year},${p})`;

  return {
    bibliographyHtml: bibHtml,
    bibliographyMarkdown: bibMd,
    citationIndirectNarrative,
    citationIndirectParenthetical,
    citationDirectShortNarrative,
    citationDirectShortParenthetical,
    citationDirectLong,
  };
}
