export type WorkType =
  | 'LIVRO'
  | 'CAPITULO'
  | 'ARTIGO_PERIODICO'
  | 'REVISTA'
  | 'NOTICIA_JORNAL'
  | 'WEBSITE'
  | 'VIDEO_YOUTUBE'
  | 'FILME_SERIE'
  | 'REDE_SOCIAL';

export interface Author {
  firstName: string;
  lastName: string;
  isOrganization?: boolean; // Para autores corporativos/institucionais
}

export interface ReferenceItem {
  id: string;
  type: WorkType;
  authors: Author[];
  title: string;
  year: string;
  url: string;
  doi: string;

  // Campos específicos
  publisher?: string;
  city?: string;
  edition?: string;
  bookTitle?: string;
  bookAuthors?: Author[];
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  magazineName?: string;
  month?: string;
  newspaperName?: string;
  date?: string; // data completa YYYY-MM-DD
  siteName?: string;
  accessDate?: string; // data completa YYYY-MM-DD
  publishDate?: string; // data completa YYYY-MM-DD ou YYYY
  channel?: string;
  platform?: string;
  duration?: string;
  director?: string;
  distributor?: string;
  country?: string;
  format?: string;
  platformName?: string;
  username?: string;
}

export type CitationStyle = 'ABNT' | 'APA';

export interface FormattedResult {
  bibliographyHtml: string; // Com tags <i> ou <b> para Word
  bibliographyMarkdown: string; // Para Obsidian
  citationIndirectNarrative: string; // Ex: Silva (2020) / Silva et al. (2020)
  citationIndirectParenthetical: string; // Ex: (Silva, 2020) / (Silva et al., 2020)
  citationDirectShortNarrative: string; // Ex: Silva (2020, p. 12) "..."
  citationDirectShortParenthetical: string; // Ex: "..." (Silva, 2020, p. 12)
  citationDirectLong: string; // Recuado sem aspas
}
