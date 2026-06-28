import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Bookmark, 
  FileText, 
  Layers, 
  Newspaper, 
  Globe, 
  Youtube, 
  Film, 
  Share2, 
  Plus, 
  Trash2, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Undo
} from 'lucide-react';
import { ReferenceItem, WorkType, Author } from '../types';
import { fetchDoiMetadata } from '../utils/doiFetcher';

interface ReferenceFormProps {
  onSave: (item: ReferenceItem) => void;
  editingItem: ReferenceItem | null;
  onCancelEdit: () => void;
}

const WORK_TYPES_CONFIG: { type: WorkType; label: string; icon: any }[] = [
  { type: 'LIVRO', label: 'Livro', icon: Book },
  { type: 'CAPITULO', label: 'Capítulo de Livro', icon: Bookmark },
  { type: 'ARTIGO_PERIODICO', label: 'Artigo Científico', icon: FileText },
  { type: 'REVISTA', label: 'Revista / Magazine', icon: Layers },
  { type: 'NOTICIA_JORNAL', label: 'Notícia de Jornal', icon: Newspaper },
  { type: 'WEBSITE', label: 'Website / Blog', icon: Globe },
  { type: 'VIDEO_YOUTUBE', label: 'Vídeo (YouTube/etc)', icon: Youtube },
  { type: 'FILME_SERIE', label: 'Filme / Série', icon: Film },
  { type: 'REDE_SOCIAL', label: 'Rede Social', icon: Share2 },
];

export default function ReferenceForm({ onSave, editingItem, onCancelEdit }: ReferenceFormProps) {
  const [type, setType] = useState<WorkType>('ARTIGO_PERIODICO');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [authors, setAuthors] = useState<Author[]>([{ firstName: '', lastName: '', isOrganization: false }]);

  // Campos específicos
  const [publisher, setPublisher] = useState('');
  const [city, setCity] = useState('');
  const [edition, setEdition] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [magazineName, setMagazineName] = useState('');
  const [month, setMonth] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [date, setDate] = useState('');
  const [siteName, setSiteName] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [accessDate, setAccessDate] = useState('');
  const [channel, setChannel] = useState('');
  const [duration, setDuration] = useState('');
  const [director, setDirector] = useState('');
  const [distributor, setDistributor] = useState('');
  const [country, setCountry] = useState('');
  const [format, setFormat] = useState('Filme');
  const [platformName, setPlatformName] = useState('');
  const [username, setUsername] = useState('');

  // DOI search state
  const [doiQuery, setDoiQuery] = useState('');
  const [isSearchingDoi, setIsSearchingDoi] = useState(false);
  const [doiError, setDoiError] = useState<string | null>(null);
  const [doiSuccess, setDoiSuccess] = useState(false);

  // Define data de acesso padrão como hoje
  const getTodayDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (!editingItem) {
      // Quando trocar de tipo de obra, define valores padrão para datas de acesso se vazios
      if (['WEBSITE', 'VIDEO_YOUTUBE', 'REDE_SOCIAL'].includes(type) && !accessDate) {
        setAccessDate(getTodayDateStr());
      }
    }
  }, [type, editingItem]);

  // Carrega dados se estiver editando
  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setTitle(editingItem.title);
      setYear(editingItem.year);
      setUrl(editingItem.url);
      setDoi(editingItem.doi);
      setAuthors(editingItem.authors.length > 0 ? editingItem.authors : [{ firstName: '', lastName: '', isOrganization: false }]);
      
      setPublisher(editingItem.publisher || '');
      setCity(editingItem.city || '');
      setEdition(editingItem.edition || '');
      setBookTitle(editingItem.bookTitle || '');
      setJournal(editingItem.journal || '');
      setVolume(editingItem.volume || '');
      setIssue(editingItem.issue || '');
      setPages(editingItem.pages || '');
      setMagazineName(editingItem.magazineName || '');
      setMonth(editingItem.month || '');
      setNewspaperName(editingItem.newspaperName || '');
      setDate(editingItem.date || '');
      setSiteName(editingItem.siteName || '');
      setPublishDate(editingItem.publishDate || '');
      setAccessDate(editingItem.accessDate || '');
      setChannel(editingItem.channel || '');
      setDuration(editingItem.duration || '');
      setDirector(editingItem.director || '');
      setDistributor(editingItem.distributor || '');
      setCountry(editingItem.country || '');
      setFormat(editingItem.format || 'Filme');
      setPlatformName(editingItem.platformName || '');
      setUsername(editingItem.username || '');
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setTitle('');
    setYear('');
    setUrl('');
    setDoi('');
    setAuthors([{ firstName: '', lastName: '', isOrganization: false }]);
    setPublisher('');
    setCity('');
    setEdition('');
    setBookTitle('');
    setJournal('');
    setVolume('');
    setIssue('');
    setPages('');
    setMagazineName('');
    setMonth('');
    setNewspaperName('');
    setDate('');
    setSiteName('');
    setPublishDate('');
    setAccessDate(getTodayDateStr());
    setChannel('');
    setDuration('');
    setDirector('');
    setDistributor('');
    setCountry('');
    setFormat('Filme');
    setPlatformName('');
    setUsername('');
    setDoiQuery('');
    setDoiError(null);
    setDoiSuccess(false);
  };

  // Busca de DOI automática
  const handleDoiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doiQuery.trim()) return;

    setIsSearchingDoi(true);
    setDoiError(null);
    setDoiSuccess(false);

    try {
      const meta = await fetchDoiMetadata(doiQuery);
      
      // Auto preenchimento dos campos obtidos
      setType(meta.type);
      setTitle(meta.title);
      setYear(meta.year);
      setDoi(meta.doi);
      setUrl(meta.url);
      
      if (meta.authors && meta.authors.length > 0) {
        setAuthors(meta.authors);
      } else {
        setAuthors([{ firstName: '', lastName: '', isOrganization: false }]);
      }

      if (meta.type === 'ARTIGO_PERIODICO') {
        setJournal(meta.journal);
        setVolume(meta.volume);
        setIssue(meta.issue);
        setPages(meta.pages);
      } else if (meta.type === 'LIVRO') {
        setPublisher(meta.publisher);
      }

      setDoiSuccess(true);
      setTimeout(() => setDoiSuccess(false), 5000);
    } catch (err: any) {
      setDoiError(err.message || 'Falha ao buscar metadados do DOI.');
    } finally {
      setIsSearchingDoi(false);
    }
  };

  // Funções para gerenciar lista de autores
  const handleAddAuthor = () => {
    setAuthors([...authors, { firstName: '', lastName: '', isOrganization: false }]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length === 1) {
      setAuthors([{ firstName: '', lastName: '', isOrganization: false }]);
    } else {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: any) => {
    const updated = authors.map((auth, i) => {
      if (i === index) {
        return { ...auth, [field]: value };
      }
      return auth;
    });
    setAuthors(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!title.trim()) {
      alert('Por favor, insira o título da obra.');
      return;
    }

    const filteredAuthors = authors.filter(auth => 
      auth.lastName.trim() !== '' || (auth.isOrganization && auth.lastName.trim() !== '')
    );

    const finalAuthors = filteredAuthors.length > 0 ? filteredAuthors : [{ firstName: 'S/A', lastName: 'SEM AUTOR', isOrganization: false }];

    const item: ReferenceItem = {
      id: editingItem?.id || crypto.randomUUID(),
      type,
      authors: finalAuthors,
      title: title.trim(),
      year: year.trim() || 's.d.', // sem data
      url: url.trim(),
      doi: doi.trim(),
      publisher: publisher.trim(),
      city: city.trim(),
      edition: edition.trim(),
      bookTitle: bookTitle.trim(),
      journal: journal.trim(),
      volume: volume.trim(),
      issue: issue.trim(),
      pages: pages.trim(),
      magazineName: magazineName.trim(),
      month: month.trim(),
      newspaperName: newspaperName.trim(),
      date: date.trim(),
      siteName: siteName.trim(),
      publishDate: publishDate.trim(),
      accessDate: accessDate.trim(),
      channel: channel.trim(),
      duration: duration.trim(),
      director: director.trim(),
      distributor: distributor.trim(),
      country: country.trim(),
      format: format.trim(),
      platformName: platformName.trim(),
      username: username.trim()
    };

    onSave(item);
    resetForm();
  };

  return (
    <div id="reference-form-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <span>{editingItem ? 'Editar Obra' : 'Nova Referência'}</span>
          {editingItem && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              Editando
            </span>
          )}
        </h2>
        {editingItem && (
          <button
            id="btn-cancel-edit"
            onClick={onCancelEdit}
            className="text-xs flex items-center space-x-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      {/* Seção de Importação via DOI (Apenas para novas ou se desejado) */}
      {!editingItem && (
        <form id="doi-search-form" onSubmit={handleDoiSearch} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Importação Rápida via DOI (Crossref)</span>
            </label>
            <span className="text-[10px] text-slate-400">Funciona Online</span>
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                id="doi-search-input"
                type="text"
                value={doiQuery}
                onChange={(e) => setDoiQuery(e.target.value)}
                placeholder="Ex: 10.1145/3313831.3376590 ou URL completa"
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              id="btn-doi-search-submit"
              type="submit"
              disabled={isSearchingDoi}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSearchingDoi ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Buscar</span>
              )}
            </button>
          </div>

          {doiError && (
            <div id="doi-error-msg" className="flex items-start space-x-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{doiError}</span>
            </div>
          )}

          {doiSuccess && (
            <div id="doi-success-msg" className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Dados importados com sucesso e aplicados ao formulário!</span>
            </div>
          )}
        </form>
      )}

      {/* Seleção de Tipo de Obra */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          Selecione o Tipo de Obra
        </label>
        <div id="work-type-selector" className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2">
          {WORK_TYPES_CONFIG.map((cfg) => {
            const IconComponent = cfg.icon;
            const isSelected = type === cfg.type;
            return (
              <button
                id={`btn-worktype-${cfg.type}`}
                key={cfg.type}
                type="button"
                onClick={() => setType(cfg.type)}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center space-y-1.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-medium text-center truncate w-full">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form id="metadata-form" onSubmit={handleSubmit} className="space-y-5 pt-3">
        {/* Seção Autores */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/60 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Autores / Criadores
            </label>
            <button
              id="btn-add-author"
              type="button"
              onClick={handleAddAuthor}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Autor</span>
            </button>
          </div>

          <div id="authors-list-container" className="space-y-3">
            {authors.map((auth, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-white border border-slate-100 p-3 rounded-lg shadow-2xs relative">
                {/* Checkbox para Corporativo/Org */}
                <div className="flex items-center space-x-1.5 sm:mb-0 mr-2 shrink-0">
                  <input
                    id={`author-is-org-${index}`}
                    type="checkbox"
                    checked={!!auth.isOrganization}
                    onChange={(e) => handleAuthorChange(index, 'isOrganization', e.target.checked)}
                    className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor={`author-is-org-${index}`} className="text-[11px] font-medium text-slate-500 cursor-pointer">
                    Corporativo/Inst.
                  </label>
                </div>

                {auth.isOrganization ? (
                  <div className="flex-1 w-full">
                    <input
                      id={`author-org-name-${index}`}
                      type="text"
                      required
                      placeholder="Nome da Instituição (Ex: Ministério da Saúde, Google)"
                      value={auth.lastName}
                      onChange={(e) => handleAuthorChange(index, 'lastName', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="flex flex-1 w-full space-x-2">
                    <input
                      id={`author-firstname-${index}`}
                      type="text"
                      placeholder="Nome (Ex: Maria de)"
                      value={auth.firstName}
                      onChange={(e) => handleAuthorChange(index, 'firstName', e.target.value)}
                      className="w-1/2 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      id={`author-lastname-${index}`}
                      type="text"
                      required
                      placeholder="Sobrenome (Ex: Souza)"
                      value={auth.lastName}
                      onChange={(e) => handleAuthorChange(index, 'lastName', e.target.value)}
                      className="w-1/2 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <button
                  id={`btn-remove-author-${index}`}
                  type="button"
                  onClick={() => handleRemoveAuthor(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                  title="Remover autor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Título Principal */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Título Principal</label>
            <input
              id="input-title"
              type="text"
              required
              placeholder="Ex: Como referenciar: manual prático de escrita acadêmica"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Se houver subtítulo, insira após dois pontos &quot;:&quot;</span>
          </div>
        </div>

        {/* Linha com Ano, URL, DOI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Ano de Publicação</label>
            <input
              id="input-year"
              type="text"
              placeholder="Ex: 2026"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">URL / Link</label>
            <input
              id="input-url"
              type="url"
              placeholder="Ex: https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">DOI (Opcional)</label>
            <input
              id="input-doi"
              type="text"
              placeholder="Ex: 10.1000/xyz123"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* CAMPOS DINÂMICOS CONFORME O TIPO SELECIONADO */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Informações Detalhadas</h3>
          
          {/* LIVRO */}
          {type === 'LIVRO' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Local (Cidade)</label>
                <input
                  id="input-city"
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Editora</label>
                <input
                  id="input-publisher"
                  type="text"
                  placeholder="Ex: Editora Atlas"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Edição (Apenas número)</label>
                <input
                  id="input-edition"
                  type="text"
                  placeholder="Ex: 3"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* CAPITULO */}
          {type === 'CAPITULO' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Título do Livro Integrador</label>
                  <input
                    id="input-booktitle"
                    type="text"
                    placeholder="Ex: Tratado de Metodologia Acadêmica"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Páginas do Capítulo (Ex: 15-30)</label>
                  <input
                    id="input-pages"
                    type="text"
                    placeholder="Ex: 45-62"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Local (Cidade)</label>
                  <input
                    id="input-bookcity"
                    type="text"
                    placeholder="Ex: Rio de Janeiro"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Editora</label>
                  <input
                    id="input-bookpublisher"
                    type="text"
                    placeholder="Ex: Synergia"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Edição (Apenas número)</label>
                  <input
                    id="input-bookedition"
                    type="text"
                    placeholder="Ex: 2"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ARTIGO_PERIODICO */}
          {type === 'ARTIGO_PERIODICO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nome do Periódico / Revista Científica</label>
                <input
                  id="input-journal"
                  type="text"
                  placeholder="Ex: Revista Brasileira de Ciência"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Vol.</label>
                  <input
                    id="input-volume"
                    type="text"
                    placeholder="Ex: 12"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nº / Fasc.</label>
                  <input
                    id="input-issue"
                    type="text"
                    placeholder="Ex: 3"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Págs.</label>
                  <input
                    id="input-journalpages"
                    type="text"
                    placeholder="Ex: 100-115"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* REVISTA */}
          {type === 'REVISTA' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nome da Revista</label>
                <input
                  id="input-magazinename"
                  type="text"
                  placeholder="Ex: Veja, Época"
                  value={magazineName}
                  onChange={(e) => setMagazineName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Vol.</label>
                  <input
                    id="input-magvolume"
                    type="text"
                    placeholder="15"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nº.</label>
                  <input
                    id="input-magissue"
                    type="text"
                    placeholder="122"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Págs.</label>
                  <input
                    id="input-magpages"
                    type="text"
                    placeholder="25-28"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Mês (Ex: jun.)</label>
                <input
                  id="input-magmonth"
                  type="text"
                  placeholder="Ex: jul., nov. ou deixe em branco"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* NOTICIA_JORNAL */}
          {type === 'NOTICIA_JORNAL' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Nome do Jornal</label>
                <input
                  id="input-newspapername"
                  type="text"
                  placeholder="Ex: Folha de S.Paulo, O Globo"
                  value={newspaperName}
                  onChange={(e) => setNewspaperName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data de Publicação</label>
                <input
                  id="input-newsdate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Caderno / Pág.</label>
                <input
                  id="input-newspages"
                  type="text"
                  placeholder="Ex: Opinião, p. A4"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* WEBSITE */}
          {type === 'WEBSITE' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nome do Site / Portal</label>
                <input
                  id="input-sitename"
                  type="text"
                  placeholder="Ex: G1, Medium, Wikipedia"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data de Publicação (Site)</label>
                <input
                  id="input-sitepublishdate"
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data de Acesso (Sua Leitura)</label>
                <input
                  id="input-siteaccessdate"
                  type="date"
                  required
                  value={accessDate}
                  onChange={(e) => setAccessDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* VIDEO_YOUTUBE */}
          {type === 'VIDEO_YOUTUBE' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Nome do Canal / Criador</label>
                <input
                  id="input-videochannel"
                  type="text"
                  placeholder="Ex: Canal Nerdologia, TEDx"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Duração (Ex: 15 min)</label>
                <input
                  id="input-videoduration"
                  type="text"
                  placeholder="Ex: 15 min, 1h 22m"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data de Acesso</label>
                <input
                  id="input-videoaccessdate"
                  type="date"
                  required
                  value={accessDate}
                  onChange={(e) => setAccessDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* FILME_SERIE */}
          {type === 'FILME_SERIE' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Diretor / Produtor Principal</label>
                <input
                  id="input-moviedirector"
                  type="text"
                  placeholder="Ex: Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Distribuidora / Estúdio</label>
                <input
                  id="input-moviedistributor"
                  type="text"
                  placeholder="Ex: Warner Bros. Pictures"
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">País / Local de Origem</label>
                <input
                  id="input-moviecountry"
                  type="text"
                  placeholder="Ex: Estados Unidos"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Formato / Suporte</label>
                <select
                  id="select-movieformat"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Filme">Filme</option>
                  <option value="Série">Série de TV</option>
                  <option value="Documentário">Documentário</option>
                  <option value="Podcast">Podcast</option>
                </select>
              </div>
            </div>
          )}

          {/* REDE_SOCIAL */}
          {type === 'REDE_SOCIAL' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Rede Social (Plataforma)</label>
                <input
                  id="input-socialplatform"
                  type="text"
                  placeholder="Ex: Instagram, X (Twitter), LinkedIn"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nome de Usuário (@handle)</label>
                <input
                  id="input-socialusername"
                  type="text"
                  placeholder="Ex: @josesilva"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data do Post</label>
                <input
                  id="input-socialdate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Data de Acesso</label>
                <input
                  id="input-socialaccessdate"
                  type="date"
                  required
                  value={accessDate}
                  onChange={(e) => setAccessDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        <button
          id="btn-save-reference"
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>{editingItem ? 'Salvar Alterações' : 'Adicionar à Lista'}</span>
        </button>
      </form>
    </div>
  );
}
