import { ReferenceItem, Author } from '../types';

export interface DoiMetadata {
  title: string;
  authors: Author[];
  year: string;
  journal: string;
  publisher: string;
  volume: string;
  issue: string;
  pages: string;
  url: string;
  doi: string;
  type: 'ARTIGO_PERIODICO' | 'LIVRO';
}

export async function fetchDoiMetadata(doiInput: string): Promise<DoiMetadata> {
  // Limpa o DOI (remove espaços, prefixos comuns de URL)
  let doi = doiInput.trim();
  doi = doi.replace(/^https?:\/\/doi\.org\//i, '');
  doi = doi.replace(/^doi:/i, '');
  doi = doi.trim();

  if (!doi) {
    throw new Error('Por favor, informe um DOI válido.');
  }

  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('DOI não encontrado na base de dados do Crossref. Verifique se o número está correto.');
      }
      throw new Error(`Erro na busca (${response.status}). Verifique sua conexão.`);
    }

    const data = await response.json();
    const msg = data.message;

    if (!msg) {
      throw new Error('Estrutura de dados inválida retornada pela API.');
    }

    // Processa títulos (geralmente vêm como array)
    const title = msg.title?.[0] || '';

    // Processa autores
    const authors: Author[] = [];
    if (msg.author && Array.isArray(msg.author)) {
      msg.author.forEach((auth: any) => {
        // Crossref costuma fornecer family (sobrenome) e given (nome)
        const lastName = auth.family || '';
        const firstName = auth.given || '';
        if (lastName || firstName) {
          authors.push({
            firstName: firstName,
            lastName: lastName,
          });
        }
      });
    }

    // Processa data de publicação
    let year = '';
    const dateParts = msg.published?.['date-parts']?.[0] || msg.created?.['date-parts']?.[0];
    if (dateParts && dateParts[0]) {
      year = dateParts[0].toString();
    }

    // Processa tipo de trabalho
    // Crossref types: 'journal-article', 'book', 'book-chapter', etc.
    const crossrefType = msg.type || '';
    const type: 'ARTIGO_PERIODICO' | 'LIVRO' = 
      crossrefType.includes('book') ? 'LIVRO' : 'ARTIGO_PERIODICO';

    const journal = msg['container-title']?.[0] || '';
    const publisher = msg.publisher || '';
    const volume = msg.volume || '';
    const issue = msg.issue || '';
    const pages = msg.page || '';
    const resourceUrl = msg.URL || `https://doi.org/${doi}`;

    return {
      title,
      authors,
      year,
      journal,
      publisher,
      volume,
      issue,
      pages,
      url: resourceUrl,
      doi: msg.DOI || doi,
      type,
    };
  } catch (error: any) {
    console.error('Erro ao buscar DOI:', error);
    throw new Error(error.message || 'Falha ao conectar com o serviço do Crossref. Verifique sua conexão à internet.');
  }
}
