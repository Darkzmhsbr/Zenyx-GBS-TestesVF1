import React, { useRef, useState, useEffect, useCallback } from 'react';
import ContentEditable from 'react-contenteditable';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff, Eraser, X } from 'lucide-react';
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

// Regex para detectar emojis nativos comuns (simplificada e eficiente)
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/;

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const isFocusedRef = useRef(false); 
  const [catalog, setCatalog] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  // 🔥 Estados do Smart Emoji Suggester
  const [suggestedEmojis, setSuggestedEmojis] = useState([]);
  const [suggestionPos, setSuggestionPos] = useState(null);
  const [activeNativeEmoji, setActiveNativeEmoji] = useState(null);
  const suggestionNodeRef = useRef(null); // Nó de texto onde o emoji nativo está

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

    parsed = parsed.replace(/&lt;a href=(?:&quot;|")(.*?)(?:&quot;|")&gt;/gi, '<a href="$1">');
    parsed = parsed.replace(/&lt;\/a&gt;/gi, '</a>');

    parsed = parsed.replace(/&lt;span class=(?:&quot;|")tg-spoiler(?:&quot;|")&gt;/gi, '<span class="tg-spoiler">');
    parsed = parsed.replace(/&lt;tg-spoiler&gt;/gi, '<span class="tg-spoiler">');
    parsed = parsed.replace(/&lt;\/span&gt;/gi, '</span>');
    parsed = parsed.replace(/&lt;\/tg-spoiler&gt;/gi, '</span>');

    if (catalog && catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        const imgUrl = getEmojiAbsoluteUrl(emoji);

        if (imgUrl) {
          parsed = parsed.replace(regex, `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" fetchpriority="high" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />`);
        }
      });
    }
    return parsed;
  }, [catalog]);

  const htmlToText = (htmlStr) => {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    
    const imgs = Array.from(temp.querySelectorAll('.rich-emoji-img'));
    imgs.forEach(img => {
      const sc = img.getAttribute('data-shortcode');
      if (sc) img.replaceWith(document.createTextNode(sc));
      else img.remove();
    });

    const spans = Array.from(temp.querySelectorAll('span'));
    spans.forEach(span => {
      if (span.className !== 'tg-spoiler') {
        const parent = span.parentNode;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      }
    });

    const fonts = Array.from(temp.querySelectorAll('font'));
    fonts.forEach(font => {
      const parent = font.parentNode;
      while (font.firstChild) parent.insertBefore(font.firstChild, font);
      parent.removeChild(font);
    });

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
    return unescape.value.replace(/\u200B/g, ''); 
  };

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

  // 🧠 LÓGICA SMART: Checa se há um emoji nativo ao lado do cursor
  const checkEmojiForSuggestion = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current || catalog.length === 0) {
      setSuggestedEmojis([]);
      return;
    }

    const range = sel.getRangeAt(0);
    // Se selecionou várias coisas, cancela
    if (!range.collapsed) {
      setSuggestedEmojis([]);
      return;
    }

    const node = range.startContainer;
    const offset = range.startOffset;

    // Se estivermos dentro de um texto, pegamos os 2 caracteres anteriores (emojis as vezes ocupam 2 posições)
    if (node.nodeType === Node.TEXT_NODE && offset > 0) {
      const textBefore = node.nodeValue.substring(Math.max(0, offset - 2), offset);
      
      // Procura por um emoji nativo nos últimos caracteres
      const match = textBefore.match(emojiRegex);
      
      if (match) {
        const foundEmoji = match[0];
        
        // Busca no catálogo por emojis premium que tenham esse fallback
        const matches = catalog.filter(e => e.fallback === foundEmoji);
        
        if (matches.length > 0) {
          // Descobrir a posição (X, Y) do cursor na tela para abrir o balão!
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getEl().getBoundingClientRect();
          
          setSuggestionPos({
            top: rect.bottom - editorRect.top + 5,
            left: Math.max(0, rect.left - editorRect.left - 20)
          });
          setSuggestedEmojis(matches.slice(0, 10)); // Mostrar max 10
          setActiveNativeEmoji(foundEmoji);
          suggestionNodeRef.current = { node, offset };
          return;
        }
      }
    }
    
    // Se não encontrou, fecha o pop-up
    setSuggestedEmojis([]);
  };

  // 🔥 FIX DA CITAÇÃO CONTÍNUA
  const handleQuoteFormat = () => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    if (!sel.rangeCount || sel.isCollapsed) return;

    // Extrai o trecho selecionado em formato HTML
    const range = sel.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    // Substitui as quebras de linha de <div> ou <p> pelo <br> simples dentro de um bloco
    let cleanHtml = tempDiv.innerHTML;
    cleanHtml = cleanHtml.replace(/<div[^>]*>/gi, '<br>').replace(/<\/div>/gi, '');
    cleanHtml = cleanHtml.replace(/<p[^>]*>/gi, '<br>').replace(/<\/p>/gi, '');
    
    // Remove múltiplos <br> no começo por sujeira
    cleanHtml = cleanHtml.replace(/^(<br\s*\/?>)+/i, '');

    // Aplica o Blockquote como um único bloco
    document.execCommand('insertHTML', false, `<blockquote>${cleanHtml}</blockquote><br>`);

    saveSelection();
    const newHtml = el.innerHTML;
    setHtmlContent(newHtml);
    onChange({ target: { value: htmlToText(newHtml) } });
  };

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
      document.execCommand(command, false, null);
    } else if (tagStart && tagEnd) {
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

  // 🚀 Função para aplicar o Emoji Inteligente sugerido
  const applySmartEmoji = (emoji) => {
    if (!suggestionNodeRef.current || !editorRef.current) return;
    
    const { node, offset } = suggestionNodeRef.current;
    
    // Apaga o emoji nativo do texto
    const textBeforeEmoji = node.nodeValue.substring(0, offset - activeNativeEmoji.length);
    const textAfterEmoji = node.nodeValue.substring(offset);
    node.nodeValue = textBeforeEmoji + textAfterEmoji;

    // Coloca o cursor de volta onde estava o emoji nativo
    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(node, textBeforeEmoji.length);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // Insere o emoji premium
    const imgUrl = getEmojiAbsoluteUrl(emoji);
    const imgHtml = `<img src="${imgUrl}" alt="${emoji.fallback}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" fetchpriority="high" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;pointer-events:none;color:transparent;" />\u200B`;
    document.execCommand('insertHTML', false, imgHtml);

    setSuggestedEmojis([]); // Fecha o pop-up
    
    saveSelection();
    const newHtml = editorRef.current.getEl().innerHTML;
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
    setTimeout(checkEmojiForSuggestion, 50);
  };

  // Eventos de teclado para o Smart Suggester
  const handleKeyUp = (e) => {
    saveSelection();
    
    // Se o usuário apertar ESC, fecha as sugestões
    if (e.key === 'Escape') {
      setSuggestedEmojis([]);
      return;
    }
    
    // Checa o caractere
    checkEmojiForSuggestion();
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
        
        {/* 🔥 Botão de Citação Atualizado para não quebrar linhas */}
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={handleQuoteFormat} title="Citação"><Quote size={16} /></button>
        
        <button type="button" className="rich-btn" onMouseDown={preventFocusSteal} onClick={() => handleFormat('removeFormat')} title="Limpar Formatação" style={{ marginLeft: 'auto', color: '#ef4444' }}><Eraser size={16} /></button>
        
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
          onKeyUp={handleKeyUp}   
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

        {/* 🤖 SMART EMOJI SUGGESTER POP-UP */}
        {suggestedEmojis.length > 0 && suggestionPos && (
          <div className="smart-emoji-popover" style={{ top: suggestionPos.top, left: suggestionPos.left }}>
            <div className="sep-header">
              <span>Sugestões Premium</span>
              <button onMouseDown={(e) => { e.preventDefault(); setSuggestedEmojis([]); }}><X size={12}/></button>
            </div>
            <div className="sep-list">
              {suggestedEmojis.map(emoji => (
                <button 
                  key={emoji.id || emoji.emoji_id} 
                  className="sep-emoji-btn"
                  title={emoji.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySmartEmoji(emoji);
                  }}
                >
                  <img src={getEmojiAbsoluteUrl(emoji)} alt={emoji.fallback} />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
      
      <div className="rich-helper">* Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis.</div>
    </div>
  );
}