import { ReferenceItem, FormattedResult, Author } from '../types';

// Função para formatar os autores no padrão ABNT
export function formatAuthorsABNT(authors: Author[]): string {
  if (!authors || authors.length === 0) return 'AUTOR DESCONHECIDO';

  if (authors.length === 1) {
    const a = authors[0];
    if (a.isOrganization) {
      return a.lastName.toUpperCase() + '.';
    }
    return `${a.lastName.toUpperCase()}, ${a.firstName}.`;
  }

  if (authors.length <= 3) {
    return (
      authors
        .map((a) => {
          if (a.isOrganization) return a.lastName.toUpperCase();
          return `${a.lastName.toUpperCase()}, ${a.firstName}`;
        })
        .join('; ') + '.'
    );
  }

  // Mais de 3 autores: primeiro autor seguido de et al.
  const first = authors[0];
  if (first.isOrganization) {
    return `${first.lastName.toUpperCase()} et al.`;
  }
  return `${first.lastName.toUpperCase()}, ${first.firstName} et al.`;
}

// Formatação do sobrenome principal para citações ABNT (Nova NBR 10520:2023 - Caixa Mista!)
export function formatCitationAuthorABNT(authors: Author[]): string {
  if (!authors || authors.length === 0) return 'Autor Desconhecido';

  const formatSingle = (a: Author) => {
    if (a.isOrganization) {
      // Iniciais maiúsculas para orgs
      return a.lastName;
    }
    // Apenas primeira letra maiúscula (caixa mista) segundo a norma NBR 10520:2023
    return a.lastName.charAt(0).toUpperCase() + a.lastName.slice(1).toLowerCase();
  };

  if (authors.length === 1) {
    return formatSingle(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatSingle(authors[0])} e ${formatSingle(authors[1])}`;
  }

  if (authors.length === 3) {
    return `${formatSingle(authors[0])}, ${formatSingle(authors[1])} e ${formatSingle(authors[2])}`;
  }

  // Mais de 3 autores
  return `${formatSingle(authors[0])} et al.`;
}

// Abreviações de meses em português segundo ABNT
export function getMonthAbbreviation(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return '';
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = [
    'jan.',
    'fev.',
    'mar.',
    'abr.',
    'maio',
    'jun.',
    'jul.',
    'ago.',
    'set.',
    'out.',
    'nov.',
    'dez.',
  ];
  return months[monthIndex] || '';
}

export function formatDateABNT(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr; // Fallback
  const day = parseInt(parts[2], 10);
  const year = parts[0];
  const month = getMonthAbbreviation(dateStr);
  return `${day} ${month} ${year}`;
}

// FORMATADOR PRINCIPAL ABNT
export function formatABNT(item: ReferenceItem): FormattedResult {
  const authorText = formatAuthorsABNT(item.authors);
  const citationAuthor = formatCitationAuthorABNT(item.authors);
  const year = item.year || 'ano desconhecido';

  let bibHtml = '';
  let bibMd = '';

  const cleanTitle = item.title.trim();
  const titleParts = cleanTitle.split(':');
  const mainTitle = titleParts[0].trim();
  const subTitle = titleParts.slice(1).join(':').trim();

  // URL e data de acesso para ABNT
  let urlAccessHtml = '';
  let urlAccessMd = '';
  if (item.url) {
    urlAccessHtml = ` Disponível em: &lt;${item.url}&gt;.`;
    urlAccessMd = ` Disponível em: <${item.url}>.`;
    if (item.accessDate) {
      const formattedAccess = formatDateABNT(item.accessDate);
      urlAccessHtml += ` Acesso em: ${formattedAccess}.`;
      urlAccessMd += ` Acesso em: ${formattedAccess}.`;
    }
  }

  // DOI para ABNT
  const doiSuffixHtml = item.doi ? ` DOI: https://doi.org/${item.doi}.` : '';
  const doiSuffixMd = item.doi ? ` DOI: https://doi.org/${item.doi}.` : '';

  switch (item.type) {
    case 'LIVRO': {
      const city = item.city || 'Local desconhecido';
      const publisher = item.publisher || 'Editora desconhecida';
      const editionStr = item.edition ? ` ${item.edition}. ed.` : '';

      bibHtml = `${authorText} <b>${mainTitle}</b>${subTitle ? `: ${subTitle}` : ''}.${editionStr} ${city}: ${publisher}, ${year}.${doiSuffixHtml}${urlAccessHtml}`;
      bibMd = `${authorText} **${mainTitle}**${subTitle ? `: ${subTitle}` : ''}.${editionStr} ${city}: ${publisher}, ${year}.${doiSuffixMd}${urlAccessMd}`;
      break;
    }

    case 'CAPITULO': {
      const bookTitleRaw = item.bookTitle || 'Título do Livro';
      const bookTitleParts = bookTitleRaw.split(':');
      const bookMainTitle = bookTitleParts[0].trim();
      const bookSubTitle = bookTitleParts.slice(1).join(':').trim();

      const city = item.city || 'Local desconhecido';
      const publisher = item.publisher || 'Editora desconhecida';
      const editionStr = item.edition ? ` ${item.edition}. ed.` : '';
      const pagesStr = item.pages ? ` p. ${item.pages}.` : '';

      let bookAuthorText = 'Vários Autores';
      if (item.bookAuthors && item.bookAuthors.length > 0) {
        bookAuthorText = formatAuthorsABNT(item.bookAuthors);
      } else {
        // Fallback para autores do próprio capítulo se não especificado
        bookAuthorText = authorText;
      }

      bibHtml = `${authorText} ${cleanTitle}. <i>In</i>: ${bookAuthorText} <b>${bookMainTitle}</b>${bookSubTitle ? `: ${bookSubTitle}` : ''}.${editionStr} ${city}: ${publisher}, ${year}.${pagesStr}${doiSuffixHtml}${urlAccessHtml}`;
      bibMd = `${authorText} ${cleanTitle}. _In_: ${bookAuthorText} **${bookMainTitle}**${bookSubTitle ? `: ${bookSubTitle}` : ''}.${editionStr} ${city}: ${publisher}, ${year}.${pagesStr}${doiSuffixMd}${urlAccessMd}`;
      break;
    }

    case 'ARTIGO_PERIODICO': {
      const journal = item.journal || 'Revista Desconhecida';
      const city = item.city || 'Local de publicação não identificado';
      const volStr = item.volume ? ` v. ${item.volume},` : '';
      const numStr = item.issue ? ` n. ${item.issue},` : '';
      const pagesStr = item.pages ? ` p. ${item.pages},` : '';

      bibHtml = `${authorText} ${cleanTitle}. <b>${journal}</b>, ${city},${volStr}${numStr}${pagesStr} ${year}.${doiSuffixHtml}${urlAccessHtml}`;
      bibMd = `${authorText} ${cleanTitle}. **${journal}**, ${city},${volStr}${numStr}${pagesStr} ${year}.${doiSuffixMd}${urlAccessMd}`;
      break;
    }

    case 'REVISTA': {
      const magazine = item.magazineName || 'Revista Desconhecida';
      const city = item.city || 'Local desconhecido';
      const volStr = item.volume ? ` v. ${item.volume},` : '';
      const numStr = item.issue ? ` n. ${item.issue},` : '';
      const pagesStr = item.pages ? ` p. ${item.pages},` : '';
      const monthStr = item.month ? ` ${item.month}` : getMonthAbbreviation(item.date);
      const fullDateStr = monthStr ? `${monthStr}. ${year}` : year;

      bibHtml = `${authorText} ${cleanTitle}. <b>${magazine}</b>, ${city},${volStr}${numStr}${pagesStr} ${fullDateStr}.${urlAccessHtml}`;
      bibMd = `${authorText} ${cleanTitle}. **${magazine}**, ${city},${volStr}${numStr}${pagesStr} ${fullDateStr}.${urlAccessMd}`;
      break;
    }

    case 'NOTICIA_JORNAL': {
      const newspaper = item.newspaperName || 'Jornal Desconhecido';
      const city = item.city || 'Local desconhecido';
      const formattedDate = item.date ? formatDateABNT(item.date) : year;
      const pagesStr = item.pages ? ` p. ${item.pages}.` : '';

      bibHtml = `${authorText} ${cleanTitle}. <b>${newspaper}</b>, ${city}, ${formattedDate}.${pagesStr}${urlAccessHtml}`;
      bibMd = `${authorText} ${cleanTitle}. **${newspaper}**, ${city}, ${formattedDate}.${pagesStr}${urlAccessMd}`;
      break;
    }

    case 'WEBSITE': {
      const site = item.siteName || 'Website';
      const pubDate = item.publishDate ? formatDateABNT(item.publishDate) : year;

      bibHtml = `${authorText} <b>${cleanTitle}</b>. ${site}, ${pubDate}.${urlAccessHtml}`;
      bibMd = `${authorText} **${cleanTitle}**. ${site}, ${pubDate}.${urlAccessMd}`;
      break;
    }

    case 'VIDEO_YOUTUBE': {
      const channel = item.channel || 'Canal Desconhecido';
      const pubDate = item.date ? formatDateABNT(item.date) : year;
      const durationStr = item.duration ? ` Vídeo (${item.duration}).` : ' Vídeo.';

      bibHtml = `${authorText} <b>${cleanTitle}</b>. ${channel}, ${pubDate}.${durationStr}${urlAccessHtml}`;
      bibMd = `${authorText} **${cleanTitle}**. ${channel}, ${pubDate}.${durationStr}${urlAccessMd}`;
      break;
    }

    case 'FILME_SERIE': {
      // Filmes no padrão ABNT começam pelo título em caixa alta
      const formatType = item.format || 'Filme';
      const director = item.director || 'Diretor Desconhecido';
      const country = item.country || 'País desconhecido';
      const distributor = item.distributor || 'Distribuidora desconhecida';
      const durationStr = item.duration ? ` (${item.duration}).` : '.';

      bibHtml = `<b>${cleanTitle.toUpperCase()}</b>. Direção: ${director}. ${country}: ${distributor}, ${year}. 1 ${formatType.toLowerCase()}${durationStr}${urlAccessHtml}`;
      bibMd = `**${cleanTitle.toUpperCase()}**. Direção: ${director}. ${country}: ${distributor}, ${year}. 1 ${formatType.toLowerCase()}${durationStr}${urlAccessMd}`;
      break;
    }

    case 'REDE_SOCIAL': {
      const platform = item.platformName || 'Rede Social';
      const handle = item.username ? ` [${item.username}]` : '';
      const formattedDate = item.date ? formatDateABNT(item.date) : year;

      bibHtml = `${authorText} <b>${cleanTitle}</b>${handle}. ${platform}, ${formattedDate}.${urlAccessHtml}`;
      bibMd = `${authorText} **${cleanTitle}**${handle}. ${platform}, ${formattedDate}.${urlAccessMd}`;
      break;
    }

    default:
      bibHtml = `${authorText} <b>${cleanTitle}</b>. ${year}.`;
      bibMd = `${authorText} **${cleanTitle}**. ${year}.`;
  }

  // GERAÇÃO DAS CITAÇÕES (De acordo com a NBR 10520:2023 - Caixa Mista!)
  const p = item.pages ? ` p. ${item.pages.split('-')[0].trim()}` : ' p. X';

  const citationIndirectNarrative = `${citationAuthor} (${year})`;
  const citationIndirectParenthetical = `(${citationAuthor}, ${year})`;
  
  const citationDirectShortNarrative = `Segundo ${citationAuthor} (${year},${p}), "inserir texto da citação aqui"`;
  const citationDirectShortParenthetical = `"inserir texto da citação aqui" (${citationAuthor}, ${year},${p})`;

  const citationDirectLong = `    Este é um parágrafo longo simulando uma citação direta longa com mais de três linhas, que deve ser formatado com um recuo de 4 cm em relação à margem esquerda, tamanho de fonte reduzido e espaçamento simples, sem o uso de aspas. O texto deve ser posicionado de forma isolada do corpo de seu texto principal.\n\n    (${citationAuthor}, ${year},${p})`;

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
