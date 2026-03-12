import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import { PremiumEmojiPicker } from './PremiumEmojiPicker';
import { premiumEmojiService } from '../services/api';
import './RichInput.css';

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const isInternalChange = useRef(false); // 🔥 Trava mágica que impede o cursor de pular

  // 1. Carrega o catálogo de Emojis Premium para pegar as imagens
  useEffect(() => {
    let isMounted = true;
    const fetchEmojis = async () => {
      try {
        const data = await premiumEmojiService.getCatalog();
        if (isMounted && data && data.packs) {
          const allEmojis = data.packs.flatMap(p => p.emojis || []);
          setCatalog(allEmojis);
        }
      } catch (e) {
        console.error("Erro ao carregar emojis:", e);
      }
    };
    fetchEmojis();
    return () => { isMounted = false; };
  }, []);

  // 2. Analisador DOM: Converte a parte visual (com imagens) em Texto Limpo para o Banco de Dados
  const parseVisualToText = useCallback((element) => {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.nodeValue.replace(/\u200B/g, ''); // Limpa os espaços invisíveis
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IMG' && node.classList.contains('rich-inline-emoji')) {
          text += node.getAttribute('data-shortcode'); // Salva o código :emoji:
        } else if (node.tagName === 'BR') {
          text += '\n'; // Traduz quebra de linha visual para quebra real
        } else if (node.tagName === 'DIV' || node.tagName === 'P') {
          // Garante a quebra de linha do Enter sem vazar <div>
          if (element.firstChild !== node && text.length > 0 && !text.endsWith('\n')) {
            text += '\n';
          }
          text += parseVisualToText(node);
        } else {
          text += parseVisualToText(node);
        }
      }
    }
    return text;
  }, []);

  // 3. Converte Texto do Banco de Dados para Visual (Imagens) na Tela
  const parseTextToVisual = useCallback((text) => {
    if (!text) return "";
    let html = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>"); // Traduz o \n invisível para quebra visual

    if (catalog && catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        const imgUrl = emoji.url || emoji.file_url;
        if (imgUrl) {
          html = html.replace(regex, `<img src="${imgUrl}" data-shortcode="${emoji.shortcode}" class="rich-inline-emoji" alt="${emoji.shortcode}" draggable="false" />`);
        }
      });
    }
    return html;
  }, [catalog]);

  // 4. Sincroniza o conteúdo apenas quando o formulário é carregado de fora (impede bug do cursor)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const newHtml = parseTextToVisual(value || "");
      if (editorRef.current.innerHTML !== newHtml) {
        editorRef.current.innerHTML = newHtml;
      }
    }
    isInternalChange.current = false;
  }, [value, catalog, parseTextToVisual]);

  // 5. Lida com a digitação em tempo real
  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const plainText = parseVisualToText(editorRef.current);
    onChange({ target: { value: plainText } });
  };

  // 6. Botões de Formatação Originais
  const applyFormat = (tagStart, tagEnd) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const selectedText = selection.toString();
    const newText = `${tagStart}${selectedText}${tagEnd}`;
    document.execCommand('insertText', false, newText);
    handleInput();
  };

  // 7. ✨ A mágica da inserção do Emoji como IMAGEM dentro do texto
  const handleEmojiSelect = (shortcode) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const emoji = catalog.find(e => e.shortcode === shortcode);
    const imgUrl = emoji?.url || emoji?.file_url;
    
    if (imgUrl) {
      // O caractere \u200B é um espaço de largura zero que ajuda o cursor a passar pela imagem sem travar
      const imgHTML = `<img src="${imgUrl}" data-shortcode="${shortcode}" class="rich-inline-emoji" alt="${shortcode}" draggable="false" />\u200B`;
      document.execCommand('insertHTML', false, imgHTML);
    } else {
      document.execCommand('insertText', false, shortcode);
    }
    handleInput();
  };

  const addLink = () => {
    const url = prompt("Digite a URL do link:", "https://");
    if (url) {
      applyFormat(`<a href="${url}">`, '</a>');
    }
  };

  return (
    <div className="rich-input-container">
      {label && <label className="rich-label">{label}</label>}
      
      <div className="rich-toolbar">
        <button type="button" className="rich-btn" onClick={() => applyFormat('<b>', '</b>')} title="Negrito"><Bold size={16} /></button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<i>', '</i>')} title="Itálico"><Italic size={16} /></button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<u>', '</u>')} title="Sublinhado"><Underline size={16} /></button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<s>', '</s>')} title="Tachado"><Strikethrough size={16} /></button>
        
        <div className="rich-separator"></div>
        
        <button type="button" className="rich-btn" onClick={() => applyFormat('<span class="tg-spoiler">', '</span>')} title="Spoiler (Oculto)"><EyeOff size={16} /></button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<pre>', '</pre>')} title="Bloco de Código (Copiar)"><Code size={16} /></button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<blockquote>', '</blockquote>')} title="Citação"><Quote size={16} /></button>
        
        <div className="rich-separator"></div>

        <button type="button" className="rich-btn" onClick={addLink} title="Link"><LinkIcon size={16} /></button>

        <div className="rich-separator"></div>
        {/* ✨ Nosso seletor de emojis aqui */}
        <PremiumEmojiPicker onSelect={handleEmojiSelect} compact={true} />
      </div>

      {/* A Nova Área de Edição Visual */}
      <div
        ref={editorRef}
        className="rich-textarea visual-editor"
        style={{
          minHeight: `${rows * 24}px`,
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: 'var(--input-bg, #111)',
          color: 'var(--foreground, #fff)',
          border: '1px solid var(--card-border, #333)',
          borderTop: '1px solid #2a2a2a',
          borderRadius: '0 0 8px 8px',
          fontSize: '0.95rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'inherit',
          outline: 'none',
          width: '100%'
        }}
        contentEditable={true}
        onInput={handleInput}
        onBlur={handleInput}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <div className="rich-helper">
        * Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis visuais.
      </div>
      <div className="rich-premium-notice">
        ⚠️ <strong>Emojis Premium:</strong> Para que os emojis premium funcionem no Telegram, a conta que <u>criou o bot</u> no @BotFather precisa ter <strong>assinatura Telegram Premium</strong> ativa.
      </div>
    </div>
  );
}