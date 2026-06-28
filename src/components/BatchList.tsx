import { useState } from 'react';
import { 
  ReferenceItem, 
  CitationStyle, 
  FormattedResult 
} from '../types';
import { formatABNT, formatCitationAuthorABNT } from '../utils/formatterABNT';
import { formatAPA as formatAPAFunction, formatCitationAuthorAPA } from '../utils/formatterAPA';
import { convertToBibTeX, generateAllBibTeX, generateBibTeXKey } from '../utils/bibtex';
import { copyFormattedText as copyRichText, copyPlainText as copyPlain } from '../utils/clipboard';
import { 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  FileCode, 
  Download, 
  Search, 
  X, 
  FileDown, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCheck,
  Code
} from 'lucide-react';

interface BatchListProps {
  items: ReferenceItem[];
  onEdit: (item: ReferenceItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeStyle: CitationStyle;
  setActiveStyle: (style: CitationStyle) => void;
}

export default function BatchList({
  items,
  onEdit,
  onDelete,
  onClearAll,
  activeStyle,
  setActiveStyle,
}: BatchListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [expandedBibtex, setExpandedBibtex] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, 'rich' | 'md' | 'bib' | 'cit_ind_n' | 'cit_ind_p' | 'cit_dir_s_n' | 'cit_dir_s_p' | 'cit_dir_l' | null>>({});
  const [batchCopied, setBatchCopied] = useState<'rich' | 'md' | null>(null);

  // Helper de feedback visual para cópia
  const triggerCopyFeedback = (id: string, type: 'rich' | 'md' | 'bib' | 'cit_ind_n' | 'cit_ind_p' | 'cit_dir_s_n' | 'cit_dir_s_p' | 'cit_dir_l') => {
    setCopiedStates((prev) => ({ ...prev, [id]: type }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: null }));
    }, 2000);
  };

  const getFormattedData = (item: ReferenceItem): FormattedResult => {
    return activeStyle === 'ABNT' ? formatABNT(item) : formatAPAFunction(item);
  };

  // Filtragem da lista
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesAuthors = item.authors.some(
      (a) => a.lastName.toLowerCase().includes(q) || (a.firstName && a.firstName.toLowerCase().includes(q))
    );
    const matchesJournal = item.journal && item.journal.toLowerCase().includes(q);
    const matchesPublisher = item.publisher && item.publisher.toLowerCase().includes(q);
    return matchesTitle || matchesAuthors || matchesJournal || matchesPublisher;
  });

  // Alternar visualização expandida de citações
  const toggleCitations = (id: string) => {
    setExpandedCitations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Alternar visualização expandida de Bibtex
  const toggleBibtex = (id: string) => {
    setExpandedBibtex((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Cópia de item individual rico (Word/Google Docs)
  const handleCopyRich = async (item: ReferenceItem) => {
    const data = getFormattedData(item);
    // Para plainText, removemos tags HTML básicas
    const plainText = data.bibliographyMarkdown.replace(/\*\*/g, '').replace(/_/g, '');
    const success = await copyRichText(data.bibliographyHtml, plainText);
    if (success) triggerCopyFeedback(item.id, 'rich');
  };

  // Cópia de item individual Markdown (Obsidian)
  const handleCopyMarkdown = async (item: ReferenceItem) => {
    const data = getFormattedData(item);
    const success = await copyPlain(data.bibliographyMarkdown);
    if (success) triggerCopyFeedback(item.id, 'md');
  };

  // Cópia de BibTeX individual
  const handleCopyBibtex = async (item: ReferenceItem) => {
    const bibCode = convertToBibTeX(item);
    const success = await copyPlain(bibCode);
    if (success) triggerCopyFeedback(item.id, 'bib');
  };

  // Cópia de citação específica
  const handleCopyCitation = async (id: string, text: string, type: 'cit_ind_n' | 'cit_ind_p' | 'cit_dir_s_n' | 'cit_dir_s_p' | 'cit_dir_l') => {
    const success = await copyPlain(text);
    if (success) triggerCopyFeedback(id, type);
  };

  // Copiar todas em Rich Text
  const handleCopyAllRich = async () => {
    if (items.length === 0) return;
    const itemsFormatted = items.map((item) => getFormattedData(item));
    
    // Constrói HTML agregando parágrafos
    const htmlAggregated = itemsFormatted
      .map((f) => `<p style="margin-bottom: 12px; line-height: 1.5;">${f.bibliographyHtml}</p>`)
      .join('\n');
    
    const plainTextAggregated = itemsFormatted
      .map((f) => f.bibliographyMarkdown.replace(/\*\*/g, '').replace(/_/g, ''))
      .join('\n\n');

    const success = await copyRichText(htmlAggregated, plainTextAggregated);
    if (success) {
      setBatchCopied('rich');
      setTimeout(() => setBatchCopied(null), 2000);
    }
  };

  // Copiar todas em Markdown
  const handleCopyAllMarkdown = async () => {
    if (items.length === 0) return;
    const itemsFormatted = items.map((item) => getFormattedData(item));
    const mdAggregated = itemsFormatted.map((f) => f.bibliographyMarkdown).join('\n\n');

    const success = await copyPlain(mdAggregated);
    if (success) {
      setBatchCopied('md');
      setTimeout(() => setBatchCopied(null), 2000);
    }
  };

  // Exportar arquivo BibTeX (.bib)
  const handleExportBibTeXFile = () => {
    if (items.length === 0) return;
    const bibCode = generateAllBibTeX(items);
    const blob = new Blob([bibCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `referencias_${activeStyle.toLowerCase()}_${new Date().toISOString().slice(0,10)}.bib`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="batch-list-card" className="space-y-6">
      {/* Barra superior de controles e Toggles */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle de Norma Ativa */}
        <div className="flex flex-col space-y-1.5 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Norma Ativa de Formatação
          </span>
          <div id="style-selector" className="flex bg-slate-100 p-1 rounded-xl w-full md:w-64">
            <button
              id="btn-style-abnt"
              onClick={() => setActiveStyle('ABNT')}
              className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all duration-200 ${
                activeStyle === 'ABNT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ABNT NBR 6023 / 10520
            </button>
            <button
              id="btn-style-apa"
              onClick={() => setActiveStyle('APA')}
              className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all duration-200 ${
                activeStyle === 'APA'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              APA 7ª Edição
            </button>
          </div>
        </div>

        {/* Estatísticas e Ações em lote */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <button
              id="btn-batch-copy-rich"
              onClick={handleCopyAllRich}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
            >
              {batchCopied === 'rich' ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Lote Copiado (Word)!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Tudo (Rich Text)</span>
                </>
              )}
            </button>

            <button
              id="btn-batch-copy-md"
              onClick={handleCopyAllMarkdown}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              {batchCopied === 'md' ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Lote Copiado (MD)!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Tudo (MD)</span>
                </>
              )}
            </button>

            <button
              id="btn-batch-export-bib"
              onClick={handleExportBibTeXFile}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              title="Baixar arquivo de referências .bib"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar BibTeX (.bib)</span>
            </button>

            <button
              id="btn-batch-clear-all"
              onClick={() => {
                if(confirm('Tem certeza que deseja apagar todas as referências da lista?')) {
                  onClearAll();
                }
              }}
              className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
              title="Limpar toda a lista"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Caixa de Busca */}
      {items.length > 0 && (
        <div id="search-container" className="relative">
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar referências geradas por título, autor, revista ou editora..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="p-1 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Lista Principal */}
      <div id="reference-cards-list" className="space-y-4">
        {items.length === 0 ? (
          <div id="empty-state-card" className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-3xs">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Nenhuma referência adicionada ainda</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Preencha o formulário ao lado de forma manual ou informe o DOI para gerar suas primeiras referências e citações científicas perfeitas!
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div id="no-search-results-card" className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500">
            Nenhum resultado encontrado para o filtro digitado.
          </div>
        ) : (
          filteredItems.map((item) => {
            const data = getFormattedData(item);
            const citationAuthor = activeStyle === 'ABNT' 
              ? formatCitationAuthorABNT(item.authors) 
              : formatCitationAuthorAPA(item.authors);
            const year = item.year || 's.d.';
            const isCitationsOpen = !!expandedCitations[item.id];
            const isBibtexOpen = !!expandedBibtex[item.id];
            const copied = copiedStates[item.id];
            const bibCode = convertToBibTeX(item);

            return (
              <div
                id={`ref-card-${item.id}`}
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4 relative hover:shadow-md transition-shadow duration-200"
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 tracking-wider">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Chave: {generateBibTeXKey(item)}
                    </span>
                  </div>

                  {/* Ações de Edição e Exclusão */}
                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-edit-ref-${item.id}`}
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Editar referência"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-ref-${item.id}`}
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir referência"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Referência Formatada */}
                <div className="bg-slate-50/40 border border-slate-100 p-4 rounded-xl relative group">
                  <div className="text-xs md:text-sm text-slate-800 leading-relaxed font-sans select-all pr-12">
                    {/* Renderiza HTML com segurança */}
                    <span dangerouslySetInnerHTML={{ __html: data.bibliographyHtml }} />
                  </div>

                  {/* Botões rápidos de cópia no canto */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white shadow-sm p-1 rounded-lg border border-slate-100">
                    <button
                      id={`btn-copy-rich-${item.id}`}
                      onClick={() => handleCopyRich(item)}
                      className={`p-1.5 rounded-md transition-all ${
                        copied === 'rich' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Copiar formatado (Rich Text para Word)"
                    >
                      {copied === 'rich' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      id={`btn-copy-md-${item.id}`}
                      onClick={() => handleCopyMarkdown(item)}
                      className={`p-1.5 rounded-md transition-all ${
                        copied === 'md' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Copiar em Markdown (para Obsidian)"
                    >
                      {copied === 'md' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <div className="relative">
                          <Copy className="w-3.5 h-3.5" />
                          <span className="absolute -bottom-1 -right-1 text-[7px] font-bold bg-slate-200 px-0.5 rounded">M</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Barra de Expansores (Citações / BibTeX) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id={`btn-toggle-citations-${item.id}`}
                    onClick={() => toggleCitations(item.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1 transition-colors ${
                      isCitationsOpen
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-white border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>Ver Citações</span>
                    {isCitationsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <button
                    id={`btn-toggle-bibtex-${item.id}`}
                    onClick={() => toggleBibtex(item.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1 transition-colors ${
                      isBibtexOpen
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-white border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Código BibTeX</span>
                    {isBibtexOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Sub-painel: Citações detalhadas */}
                {isCitationsOpen && (
                  <div
                    id={`citations-panel-${item.id}`}
                    className="bg-slate-50/50 rounded-xl p-4 md:p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
                  >
                    <div className="md:col-span-2 flex items-center justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                        <Quote className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Citações Formatadas (Conforme {activeStyle})</span>
                      </span>
                      {activeStyle === 'ABNT' && (
                        <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                          Nova NBR 10520:2023 (Caixa Mista)
                        </span>
                      )}
                    </div>

                    {/* Citação Indireta Narrativa */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Indireta (Narrativa)
                        </span>
                        <p className="text-xs font-mono text-slate-700 select-all pr-2">
                          {data.citationIndirectNarrative}
                        </p>
                      </div>
                      <button
                        id={`btn-copy-cit-ind-n-${item.id}`}
                        onClick={() => handleCopyCitation(item.id, data.citationIndirectNarrative, 'cit_ind_n')}
                        className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                          copied === 'cit_ind_n' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {copied === 'cit_ind_n' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Citação Indireta Parentética */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Indireta (Parentética)
                        </span>
                        <p className="text-xs font-mono text-slate-700 select-all pr-2">
                          {data.citationIndirectParenthetical}
                        </p>
                      </div>
                      <button
                        id={`btn-copy-cit-ind-p-${item.id}`}
                        onClick={() => handleCopyCitation(item.id, data.citationIndirectParenthetical, 'cit_ind_p')}
                        className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                          copied === 'cit_ind_p' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {copied === 'cit_ind_p' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Citação Direta Curta Narrativa */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Direta Curta (Narrativa)
                        </span>
                        <p className="text-xs text-slate-600 pr-2">
                          {data.citationDirectShortNarrative}
                        </p>
                      </div>
                      <button
                        id={`btn-copy-cit-dir-s-n-${item.id}`}
                        onClick={() => handleCopyCitation(item.id, data.citationDirectShortNarrative, 'cit_dir_s_n')}
                        className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                          copied === 'cit_dir_s_n' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {copied === 'cit_dir_s_n' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Citação Direta Curta Parentética */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Direta Curta (Parentética)
                        </span>
                        <p className="text-xs text-slate-600 pr-2">
                          {data.citationDirectShortParenthetical}
                        </p>
                      </div>
                      <button
                        id={`btn-copy-cit-dir-s-p-${item.id}`}
                        onClick={() => handleCopyCitation(item.id, data.citationDirectShortParenthetical, 'cit_dir_s_p')}
                        className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                          copied === 'cit_dir_s_p' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {copied === 'cit_dir_s_p' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Citação Direta Longa */}
                    <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Citação Direta Longa (mais de 3 linhas / 40 palavras)
                        </span>
                        <button
                          id={`btn-copy-cit-dir-l-${item.id}`}
                          onClick={() => handleCopyCitation(item.id, data.citationDirectLong, 'cit_dir_l')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 ${
                            copied === 'cit_dir_l' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {copied === 'cit_dir_l' ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Parágrafo Recuado</span>
                            </>
                          )}
                        </button>
                      </div>
                      {/* Visualização estilizada da citação recuada */}
                      <div className="pl-4 border-l-4 border-indigo-200 text-slate-600 text-[11px] leading-relaxed italic bg-slate-50/50 p-3 rounded-r-lg font-sans">
                        Este é um parágrafo longo simulando uma citação direta longa com mais de três linhas, que deve ser formatado com um recuo de 4 cm (ou 0.5 polegadas) em relação à margem esquerda, tamanho de fonte reduzido e espaçamento simples, sem o uso de aspas. O texto deve ser posicionado de forma isolada do corpo de seu texto principal.
                        <span className="block mt-2 font-bold text-slate-700 not-italic font-mono">
                          {activeStyle === 'ABNT' ? `(${citationAuthor}, ${year}, p. X)` : `(${citationAuthor}, ${year}, p. xx)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-painel: BibTeX Code */}
                {isBibtexOpen && (
                  <div
                    id={`bibtex-panel-${item.id}`}
                    className="bg-slate-900 rounded-xl p-4 space-y-3 animate-fade-in border border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                      <span className="flex items-center space-x-1.5 font-semibold text-[10px] uppercase tracking-wider text-indigo-400">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Código BibTeX de Exportação</span>
                      </span>
                      <button
                        id={`btn-copy-bib-code-${item.id}`}
                        onClick={() => handleCopyBibtex(item)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 ${
                          copied === 'bib' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {copied === 'bib' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Bloco</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin select-all py-1">
                      {bibCode}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
