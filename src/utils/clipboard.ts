/**
 * Copia texto formatado (Rich Text HTML) e texto puro para a área de transferência.
 * Isso garante que quando o usuário colar no Word, Google Docs ou outro editor rico,
 * as formatações de negrito, itálico e parágrafo sejam preservadas.
 */
export async function copyFormattedText(htmlContent: string, plainText: string): Promise<boolean> {
  // Ajusta entidades HTML básicas para exibição amigável ao colar
  const processedHtml = htmlContent
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([processedHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (error) {
    console.warn('Método principal ClipboardItem falhou. Tentando fallback...', error);
  }

  // Fallback usando seleção DOM e execCommand para máxima compatibilidade em iframes
  try {
    const container = document.createElement('div');
    container.innerHTML = processedHtml;
    
    // Esconde o elemento temporário
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.left = '-9999px';
    
    document.body.appendChild(container);
    
    // Seleciona o conteúdo
    const range = document.createRange();
    range.selectNodeContents(container);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      
      const success = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(container);
      
      if (success) return true;
    }
  } catch (fallbackError) {
    console.error('Fallback de cópia rica falhou:', fallbackError);
  }

  // Último recurso: Copia texto simples usando API básica
  return copyPlainText(plainText);
}

/**
 * Copia texto plano comum para a área de transferência.
 */
export async function copyPlainText(text: string): Promise<boolean> {
  const cleanText = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(cleanText);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard falhou. Tentando fallback textarea...', err);
  }

  // Fallback para ambientes restritos (iframes)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = cleanText;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.error('Falha crítica ao copiar:', e);
    return false;
  }
}
