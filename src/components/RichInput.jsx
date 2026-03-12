import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import { PremiumEmojiPicker } from './PremiumEmojiPicker';
import { premiumEmojiService } from '../services/api';
import './RichInput.css';

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const [catalog, setCatalog] = useState([]);

  // 1. Busca os emojis no banco silenciosamente para termos as URLs das imagens
  useEffect(() => {
    let isMounted = true;
    premiumEmojiService.getCatalog().then(data => {
      if (isMounted && data && data.packs) {
        setCatalog(data.packs.flatMap(p => p.emojis || []));
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // 2. Converte Shortcode para Imagem (Para exibir na tela)
  const textToHtml = useCallback((text) => {
    if (!text) return "";
    let html = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    
    if (catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        const imgUrl = emoji.url || emoji.file_url;
        if (imgUrl) {
          html = html.replace(regex, `<img src="${imgUrl}" alt="${emoji.shortcode}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" />`);
        }
      });
    }
    return html;
  }, [catalog]);

  // 3. Converte Imagem de volta para Shortcode (Para salvar limpo no banco)
  const htmlToText = (element) => {
    let text = "";
    for (let node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.nodeValue.replace(/\u200B/g, ''); // Remove espaço invisível anti-bug
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'IMG' && node.classList.contains('rich-emoji-img')) {
          text += node.getAttribute('data-shortcode');
        } else if (node.tagName === 'BR') {
          text += '\n';
        } else if (node.tagName === 'DIV' || node.tagName === 'P') {
          if (text.length > 0 && !text.endsWith('\n')) text += '\n';
          text += htmlToText(node);
        } else {
          text += htmlToText(node);
        }
      }
    }
    return text;
  };

  // 4. A TRAVA DE SEGURANÇA (Evita o pulo do cursor)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = textToHtml(value || "");
    }
  }, [value, catalog, textToHtml]);

  // 5. Emite a mudança limpa para as páginas (como CanalFree, OrderBump, etc.)
  const emitChange = () => {
    if (!editorRef.current) return;
    const text = htmlToText(editorRef.current);
    onChange({ target: { value: text } });
  };

  // 6. Formatação HTML Padrão
  const applyFormat = (tagStart, tagEnd) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const selectedText = selection.toString();
    const newText = `${tagStart}${selectedText}${tagEnd}`;
    document.execCommand('insertText', false, newText);
    emitChange();
  };

  // 7. INSERE O EMOJI COMO IMAGEM E SALVA
  const handleEmojiSelect = (shortcode) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const emoji = catalog.find(e => e.shortcode === shortcode);
    const imgUrl = emoji?.url || emoji?.file_url;
    
    if (imgUrl) {
      // \u200B é um espaço invisível que garante que o cursor não trave na imagem
      const imgHtml = `<img src="${imgUrl}" alt="${shortcode}" data-shortcode="${shortcode}" class="rich-emoji-img" draggable="false" />\u200B`;
      document.execCommand('insertHTML', false, imgHtml);
    } else {
      document.execCommand('insertText', false, shortcode);
    }
    emitChange();
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
        <PremiumEmojiPicker onSelect={handleEmojiSelect} compact={true} />
      </div>

      <div
        ref={editorRef}
        className="rich-textarea visual-editor"
        style={{
          minHeight: `${rows * 24}px`, maxHeight: '300px', overflowY: 'auto',
          padding: '12px', backgroundColor: 'var(--input-bg, #111)', color: 'var(--foreground, #fff)',
          border: '1px solid var(--card-border, #333)', borderTop: '1px solid #2a2a2a',
          borderRadius: '0 0 8px 8px', fontSize: '0.95rem', whiteSpace: 'pre-wrap',
          wordBreak: 'break-word', fontFamily: 'inherit', outline: 'none'
        }}
        contentEditable={true}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <div className="rich-helper">
        * Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis.
      </div>
      <div className="rich-premium-notice">
        ⚠️ <strong>Emojis Premium:</strong> Para que os emojis premium funcionem no Telegram, a conta que <u>criou o bot</u> no @BotFather precisa ter <strong>assinatura Telegram Premium</strong> ativa.
      </div>
    </div>
  );
}