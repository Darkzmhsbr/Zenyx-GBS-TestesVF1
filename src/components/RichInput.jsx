import React, { useRef, useState, useEffect, useCallback } from 'react';
import ContentEditable from 'react-contenteditable';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import { PremiumEmojiPicker } from './PremiumEmojiPicker';
import { premiumEmojiService } from '../services/api';
import './RichInput.css';

const getEmojiAbsoluteUrl = (emoji) => {
  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
  let rawUrl = emoji.file_url || emoji.url;
  if (!rawUrl && emoji.emoji_id) {
    const pName = emoji.pack_name || 'Outros';
    rawUrl = `/api/emojis/thumb/${encodeURIComponent(pName)}/${emoji.emoji_id}.webp`;
  }
  if (!rawUrl) return null;
  return rawUrl.startsWith('http') ? rawUrl : `${API_BASE}${rawUrl}`;
};

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    let isMounted = true;
    premiumEmojiService.getCatalog().then(data => {
      if (isMounted && data && data.packs) {
        setCatalog(data.packs.flatMap(p => p.emojis.map(e => ({...e, pack_name: p.name})) || []));
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  const textToHtml = useCallback((text) => {
    if (!text) return "";
    let parsed = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    
    if (catalog && catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        const imgUrl = getEmojiAbsoluteUrl(emoji);
        if (imgUrl) {
          parsed = parsed.replace(regex, `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />`);
        }
      });
    }
    return parsed;
  }, [catalog]);

  // ✨ O "ASPIRADOR DE PÓ" (A Solução do Erro 400)
  const htmlToText = (htmlStr) => {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    
    // 1. Resgata as imagens e transforma no shortcode limpo
    const imgs = temp.querySelectorAll('.rich-emoji-img');
    imgs.forEach(img => {
      const sc = img.getAttribute('data-shortcode');
      if (sc) img.replaceWith(document.createTextNode(sc));
    });

    // 2. DESTRÓI OS SPANS INVISÍVEIS DO CHROME!
    // Apenas ignora o <span class="tg-spoiler"> que é oficial do Telegram
    const spans = temp.querySelectorAll('span');
    spans.forEach(span => {
      if (!span.classList.contains('tg-spoiler')) {
        const fragment = document.createDocumentFragment();
        while (span.firstChild) {
          fragment.appendChild(span.firstChild);
        }
        span.replaceWith(fragment); // Desmonta a tag, preservando o texto dentro!
      }
    });

    // 3. Remove tags <font> criadas ao colar
    const fonts = temp.querySelectorAll('font');
    fonts.forEach(font => {
      const fragment = document.createDocumentFragment();
      while (font.firstChild) {
        fragment.appendChild(font.firstChild);
      }
      font.replaceWith(fragment);
    });

    // 4. Limpa todos os estilos inline (ex: style="color: var(...)") de TUDO
    const allEls = temp.querySelectorAll('*');
    allEls.forEach(el => {
      el.removeAttribute('style');
      if (el.tagName.toLowerCase() !== 'span' || !el.classList.contains('tg-spoiler')) {
        el.removeAttribute('class');
      }
    });
    
    let txt = temp.innerHTML;
    txt = txt.replace(/<div><br><\/div>/gi, '\n')
             .replace(/<div>/gi, '\n')
             .replace(/<\/div>/gi, '')
             .replace(/<br\s*\/?>/gi, '\n')
             .replace(/<p>/gi, '\n')
             .replace(/<\/p>/gi, '');
             
    const unescape = document.createElement('textarea');
    unescape.innerHTML = txt;
    
    // Remove também espaços com largura zero que ajudam o cursor mas atrapalham a API
    return unescape.value.replace(/\u200B/g, ''); 
  };

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current.getEl()) {
      const currentText = htmlToText(htmlContent);
      if (currentText !== (value || "")) {
        setHtmlContent(textToHtml(value || ""));
      }
    }
  }, [value, catalog, textToHtml, htmlContent]);

  const handleChange = (evt) => {
    const newHtml = evt.target.value;
    setHtmlContent(newHtml);
    onChange({ target: { value: htmlToText(newHtml) } });
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.getEl().contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const applyFormat = (tagStart, tagEnd) => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    
    if (range.collapsed) return;

    const frag = range.extractContents();
    range.insertNode(document.createTextNode(tagEnd));
    range.insertNode(frag);
    range.insertNode(document.createTextNode(tagStart));

    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    saveSelection();

    const newHtml = el.innerHTML;
    setHtmlContent(newHtml);
    onChange({ target: { value: htmlToText(newHtml) } });
  };

  const handleEmojiSelect = (shortcode, emojiObj) => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();
    
    const sel = window.getSelection();
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    
    const emoji = emojiObj || catalog.find(e => e.shortcode === shortcode);
    
    if (emoji) {
      const imgUrl = getEmojiAbsoluteUrl(emoji);
      const imgHtml = `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />\u200B`;
      document.execCommand('insertHTML', false, imgHtml);
    } else {
      document.execCommand('insertText', false, shortcode);
    }
    
    saveSelection();
    const newHtml = el.innerHTML;
    setHtmlContent(newHtml);
    onChange({ target: { value: htmlToText(newHtml) } });
  };

  const addLink = () => {
    const url = prompt("Digite a URL do link:", "https://");
    if (url) applyFormat(`<a href="${url}">`, '</a>');
  };

  const preventFocusSteal = (e) => e.preventDefault();

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="rich-input-container">
      {label && <label className="rich-label">{label}</label>}
      
      <div className="rich-toolbar">
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<b>', '</b>')} title="Negrito"><Bold size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<i>', '</i>')} title="Itálico"><Italic size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<u>', '</u>')} title="Sublinhado"><Underline size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<s>', '</s>')} title="Tachado"><Strikethrough size={16} /></button>
        <div className="rich-separator"></div>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<span class="tg-spoiler">', '</span>')} title="Spoiler (Oculto)"><EyeOff size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<pre>', '</pre>')} title="Bloco de Código (Copiar)"><Code size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => applyFormat('<blockquote>', '</blockquote>')} title="Citação"><Quote size={16} /></button>
        <div className="rich-separator"></div>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={addLink} title="Link"><LinkIcon size={16} /></button>
        <div className="rich-separator"></div>
        <PremiumEmojiPicker onSelect={handleEmojiSelect} compact={true} />
      </div>

      <div className="rich-textarea-wrapper" style={{ backgroundColor: 'var(--input-bg, #111)', border: '1px solid var(--card-border, #333)', borderRadius: '0 0 8px 8px', position: 'relative' }}>
        <ContentEditable
          ref={editorRef}
          html={htmlContent}
          disabled={false}
          onChange={handleChange}
          onMouseUp={saveSelection} 
          onKeyUp={saveSelection}   
          onBlur={saveSelection}    
          onPaste={handlePaste}
          tagName="div"
          className="rich-textarea visual-editor"
          style={{ minHeight: `${rows * 24}px`, maxHeight: '300px', overflowY: 'auto', padding: '12px', color: 'var(--foreground, #fff)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', outline: 'none' }}
          data-placeholder={placeholder}
        />
        {!htmlContent && placeholder && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', color: '#666', pointerEvents: 'none', fontSize: '0.95rem' }}>
            {placeholder}
          </div>
        )}
      </div>
      
      <div className="rich-helper">* Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis.</div>
    </div>
  );
}