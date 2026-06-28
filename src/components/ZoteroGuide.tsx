import { useState } from 'react';
import { BookOpen, HelpCircle, ChevronDown, ChevronUp, Copy, Check, FileDown, Wand2, ClipboardPaste } from 'lucide-react';

export default function ZoteroGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="zotero-guide-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 transition-all duration-300">
      <button
        id="btn-toggle-zotero-guide"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">
              Como integrar com o Zotero?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Descubra 3 formas fáceis de sincronizar suas referências com o gerenciador acadêmico.
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>

      {isOpen && (
        <div id="zotero-guide-content" className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
          {/* Método 1 */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                <FileDown className="w-4 h-4" />
                <span className="font-semibold text-xs uppercase tracking-wider">Método 1</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Importar Arquivo .bib</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Baixe o lote completo de referências em arquivo BibTeX usando o botão <b>&quot;Exportar BibTeX&quot;</b>. No Zotero, vá em <b>Arquivo &gt; Importar</b>, escolha o arquivo baixado e clique em avançar.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
              💡 Preserva toda a estrutura dos dados perfeitamente.
            </div>
          </div>

          {/* Método 2 */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                <ClipboardPaste className="w-4 h-4" />
                <span className="font-semibold text-xs uppercase tracking-wider">Método 2</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Colar Área de Transferência</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copie o código BibTeX individual de qualquer item em nossa lista. No Zotero, basta clicar no menu principal <b>Arquivo &gt; Importar da Área de Transferência</b> (ou usar o atalho Ctrl+Shift+Alt+I).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
              ⚡ O jeito mais rápido para referências individuais.
            </div>
          </div>

          {/* Método 3 */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                <Wand2 className="w-4 h-4" />
                <span className="font-semibold text-xs uppercase tracking-wider">Método 3</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Adicionar por DOI</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se você tiver apenas o DOI do artigo, copie-o e no Zotero clique no ícone da varinha mágica <b>&quot;Adicionar item por identificador&quot;</b> na barra de ferramentas. Cole o DOI e aperte Enter.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
              🔍 Requer conexão ativa com a internet no Zotero.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
