import { useState, useEffect } from 'react';
import { ReferenceItem, CitationStyle } from './types';
import ReferenceForm from './components/ReferenceForm';
import BatchList from './components/BatchList';
import ZoteroGuide from './components/ZoteroGuide';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  Wifi, 
  WifiOff, 
  GraduationCap, 
  BookmarkCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const DEFAULT_ITEMS: ReferenceItem[] = [
  {
    id: 'example-1-book',
    type: 'LIVRO',
    title: 'Metodologia do trabalho científico',
    authors: [{ firstName: 'Antônio Joaquim', lastName: 'Severino' }],
    year: '2017',
    city: 'São Paulo',
    publisher: 'Cortez',
    edition: '24',
    url: '',
    doi: ''
  },
  {
    id: 'example-2-journal',
    type: 'ARTIGO_PERIODICO',
    title: 'O impacto da inteligência artificial na pesquisa científica',
    authors: [
      { firstName: 'Carlos', lastName: 'Almeida' },
      { firstName: 'Ana', lastName: 'Silva' }
    ],
    year: '2025',
    journal: 'Revista Brasileira de Ciência e Tecnologia',
    volume: '14',
    issue: '2',
    pages: '45-58',
    city: 'Curitiba',
    doi: '10.1000/rbct.2025.v14i2',
    url: 'https://doi.org/10.1000/rbct.2025.v14i2'
  },
  {
    id: 'example-3-video',
    type: 'VIDEO_YOUTUBE',
    title: 'Como organizar referências bibliográficas de forma automatizada',
    authors: [{ firstName: 'Felipe', lastName: 'Nunes' }],
    year: '2024',
    channel: 'Academia Tech',
    duration: '12 min',
    date: '2024-03-15',
    accessDate: '2026-06-27',
    url: 'https://youtube.com/watch?v=ref-organizer',
    doi: ''
  }
];

export default function App() {
  const [items, setItems] = useState<ReferenceItem[]>([]);
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);
  const [activeStyle, setActiveStyle] = useState<CitationStyle>('ABNT');
  const [isOnline, setIsOnline] = useState(true);

  // Monitora conectividade para informar o usuário se a busca por DOI está ativa
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carrega do localStorage no início
  useEffect(() => {
    const saved = localStorage.getItem('scientific_references_list');
    const savedStyle = localStorage.getItem('scientific_references_style');
    
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }

    if (savedStyle === 'ABNT' || savedStyle === 'APA') {
      setActiveStyle(savedStyle);
    }
  }, []);

  // Salva no localStorage sempre que mudar
  const saveItems = (newItems: ReferenceItem[]) => {
    setItems(newItems);
    localStorage.setItem('scientific_references_list', JSON.stringify(newItems));
  };

  const saveStyle = (style: CitationStyle) => {
    setActiveStyle(style);
    localStorage.setItem('scientific_references_style', style);
  };

  const handleSaveReference = (savedItem: ReferenceItem) => {
    if (editingItem) {
      // Atualiza item existente
      const updated = items.map(item => item.id === savedItem.id ? savedItem : item);
      saveItems(updated);
      setEditingItem(null);
    } else {
      // Insere novo
      saveItems([savedItem, ...items]);
    }
  };

  const handleEditReference = (item: ReferenceItem) => {
    setEditingItem(item);
    // Rola para o topo no formulário para facilitar visualização
    const formElement = document.getElementById('reference-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteReference = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
  };

  const handleClearAll = () => {
    saveItems([]);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Cabeçalho Superior / Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span>ReferênciaFácil</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md border border-slate-200">
                  v2.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Gerador Acadêmico de Referências e Citações
              </p>
            </div>
          </div>

          {/* Indicador de Status Online / Offline */}
          <div className="flex items-center space-x-4">
            <div 
              id="online-status-badge"
              className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online (DOI ativo)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Modo Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner / Informações de Versão */}
      <div className="bg-white border-b border-slate-100 py-6 md:py-8 mb-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Normas ABNT & APA Rigorosamente Atualizadas
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Gere referências bibliográficas perfeitas em lote. Sincronizado com as diretrizes vigentes até <b>2026</b>, incluindo a nova <b>NBR 10520:2023 da ABNT</b> para citações em caixa mista, além das diretrizes da <b>APA 7ª Edição</b>. Copie diretamente para Word/Google Docs com formatação rica preservada.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-start md:self-center bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl text-indigo-700">
            <BookmarkCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold">100% Compatível com Obsidian e Zotero</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Formulário de Referências (Esquerda) */}
          <div className="lg:col-span-5 space-y-6">
            <ReferenceForm 
              onSave={handleSaveReference} 
              editingItem={editingItem}
              onCancelEdit={() => setEditingItem(null)}
            />
          </div>

          {/* Lista e Sincronização (Direita) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Guia de Integração com o Zotero */}
            <ZoteroGuide />

            {/* Gerenciador de Referências em Lote */}
            <BatchList 
              items={items}
              onEdit={handleEditReference}
              onDelete={handleDeleteReference}
              onClearAll={handleClearAll}
              activeStyle={activeStyle}
              setActiveStyle={saveStyle}
            />
          </div>

        </div>
      </main>

      {/* Rodapé */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-6 border-t border-slate-200/60 text-center flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
        <div>
          © 2026 ReferênciaFácil. Desenvolvido sob rígido rigor técnico científico internacional.
        </div>
        <div className="flex items-center space-x-3 font-semibold">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">✔ ABNT NBR 6023:2018</span>
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">✔ ABNT NBR 10520:2023</span>
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">✔ APA 7th Edition</span>
        </div>
      </footer>
    </div>
  );
}
