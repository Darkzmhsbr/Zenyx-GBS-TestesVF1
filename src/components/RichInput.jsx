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
  const isFocusedRef = useRef(false); // ⚓ Controle real de foco
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
    
    // ✨ RESTAURA AS TAGS PARA VISUALIZAÇÃO WYSIWYG ✨
    const tags = ['b', 'i', 'u', 's', 'pre', 'code', 'blockquote'];
    tags.forEach(tag => {
      parsed = parsed.replace(new RegExp(`&lt;${tag}&gt;`, 'gi'), `<${tag}>`)
                     .replace(new RegExp(`&lt;/${tag}&gt;`, 'gi'), `</${tag}>`);
    });

    // Restaurar Links visuais
    parsed = parsed.replace(/&lt;a href=(?:&quot;|")(.*?)(?:&quot;|")&gt;/gi, '<a href="$1">');
    parsed = parsed.replace(/&lt;\/a&gt;/gi, '</a>');

    // Restaurar Spoiler visual
    parsed = parsed.replace(/&lt;span class=(?:&quot;|")tg-spoiler(?:&quot;|")&gt;/gi, '<span class="tg-spoiler">');
    parsed = parsed.replace(/&lt;tg-spoiler&gt;/gi, '<span class="tg-spoiler">');
    parsed = parsed.replace(/&lt;\/span&gt;/gi, '</span>');
    parsed = parsed.replace(/&lt;\/tg-spoiler&gt;/gi, '</span>');

    if (catalog && catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        const imgUrl = getEmojiAbsoluteUrl(emoji);

        if (imgUrl) {
          // fetchpriority="high" ajuda a imagem a carregar super rápido
          parsed = parsed.replace(regex, `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" fetchpriority="high" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />`);
        }
      });
    }
    return parsed;
  }, [catalog]);

  // ✨ O ASPIRADOR DE PÓ DE BUGS (Adeus Erro 400 do Telegram)
  const htmlToText = (htmlStr) => {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    
    // 1. Salva as imagens e transforma em texto
    const imgs = Array.from(temp.querySelectorAll('.rich-emoji-img'));
    imgs.forEach(img => {
      const sc = img.getAttribute('data-shortcode');
      if (sc) img.replaceWith(document.createTextNode(sc));
      else img.remove();
    });

    // 2. Destrói TODOS os Spans invisíveis do Chrome, mantendo só o spoiler
    const spans = Array.from(temp.querySelectorAll('span'));
    spans.forEach(span => {
      if (span.className !== 'tg-spoiler') {
        const parent = span.parentNode;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      }
    });

    // 3. Destrói tags de fonte
    const fonts = Array.from(temp.querySelectorAll('font'));
    fonts.forEach(font => {
      const parent = font.parentNode;
      while (font.firstChild) parent.insertBefore(font.firstChild, font);
      parent.removeChild(font);
    });

    // 4. ✨ Padroniza as tags visuais de volta para as exigidas pelo Telegram
    const allEls = Array.from(temp.querySelectorAll('*'));
    allEls.forEach(el => {
      el.removeAttribute('style');
      if (el.tagName.toLowerCase() !== 'span' || el.className !== 'tg-spoiler') {
        if (el.tagName.toLowerCase() !== 'a') el.removeAttribute('class');
      }
      
      const tag = el.tagName.toLowerCase();
      if (tag === 'strong') {
        const b = document.createElement('b');
        b.innerHTML = el.innerHTML;
        el.replaceWith(b);
      } else if (tag === 'em') {
        const i = document.createElement('i');
        i.innerHTML = el.innerHTML;
        el.replaceWith(i);
      } else if (tag === 'strike' || tag === 'del') {
        const s = document.createElement('s');
        s.innerHTML = el.innerHTML;
        el.replaceWith(s);
      } else if (tag === 'ins') {
        const u = document.createElement('u');
        u.innerHTML = el.innerHTML;
        el.replaceWith(u);
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
    return unescape.value.replace(/\u200B/g, ''); // Tira espaços invisíveis
  };

  // 🔥 FIX DO CÓDIGO APARECENDO: Só converte quando você NÃO estiver digitando
  useEffect(() => {
    if (!isFocusedRef.current) {
      setHtmlContent(textToHtml(value || ""));
    }
  }, [value, catalog, textToHtml]);

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

  // 🔥 FIX DA FORMATAÇÃO VISUAL (WYSIWYG)
  const handleFormat = (command, tagStart = null, tagEnd = null) => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    if (command) {
      // Formatações nativas (Negrito, Itálico, Sublinhado, Tachado)
      document.execCommand(command, false, null);
    } else if (tagStart && tagEnd) {
      // Formatações customizadas (Spoiler, Código, Quote)
      if (!sel.rangeCount || sel.isCollapsed) return;
      const text = sel.toString();
      document.execCommand('insertHTML', false, tagStart + text + tagEnd);
    }

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
      const imgHtml = `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" fetchpriority="high" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />\u200B`;
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
    if (url) {
      handleFormat(null, `<a href="${url}">`, '</a>');
    }
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
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat('bold')} title="Negrito"><Bold size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat('italic')} title="Itálico"><Italic size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat('underline')} title="Sublinhado"><Underline size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat('strikeThrough')} title="Tachado"><Strikethrough size={16} /></button>
        <div className="rich-separator"></div>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat(null, '<span class="tg-spoiler">', '</span>')} title="Spoiler (Oculto)"><EyeOff size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat(null, '<pre>', '</pre>')} title="Bloco de Código (Copiar)"><Code size={16} /></button>
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat(null, '<blockquote>', '</blockquote>')} title="Citação"><Quote size={16} /></button>
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
          onFocus={() => { isFocusedRef.current = true; }} 
          onBlur={() => { isFocusedRef.current = false; saveSelection(); }}
          onMouseUp={saveSelection} 
          onKeyUp={saveSelection}   
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