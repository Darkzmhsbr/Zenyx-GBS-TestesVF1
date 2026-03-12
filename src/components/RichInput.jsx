import React, { useRef, useState, useEffect, useCallback } from 'react';
import ContentEditable from 'react-contenteditable';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import { PremiumEmojiPicker } from './PremiumEmojiPicker';
import { premiumEmojiService } from '../services/api';
import './RichInput.css';

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  // Busca o catálogo de emojis de forma silenciosa na API para termos as imagens
  useEffect(() => {
    let isMounted = true;
    premiumEmojiService.getCatalog().then(data => {
      if (isMounted && data && data.packs) {
        setCatalog(data.packs.flatMap(p => p.emojis || []));
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // Motor 1: Converte o código do banco em IMAGEM para o usuário ver
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
        const imgUrl = emoji.url || emoji.file_url;
        if (imgUrl) {
          // Renderiza a imagem perfeitamente nivelada no texto
          parsed = parsed.replace(regex, `<img src="${imgUrl}" alt="${emoji.shortcode}" data-shortcode="${emoji.shortcode}" class="rich-emoji-img" draggable="false" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;" />`);
        }
      });
    }
    return parsed;
  }, [catalog]);

  // Sincroniza o valor externo (apenas se o campo não estiver focado, evitando bugs de cursor)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current.getEl()) {
      setHtmlContent(textToHtml(value || ""));
    }
  }, [value, catalog, textToHtml]);

  // Motor 2: Pega a IMAGEM e converte de volta para texto puro para salvar
  const htmlToText = (htmlStr) => {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    
    // Substitui as imagens pelo respectivo código (:emoji:)
    const imgs = temp.querySelectorAll('.rich-emoji-img');
    imgs.forEach(img => {
      const sc = img.getAttribute('data-shortcode');
      if (sc) {
        img.replaceWith(document.createTextNode(sc));
      }
    });

    // Limpa a sujeira que editores visuais criam ao dar Enter
    let txt = temp.innerHTML;
    txt = txt.replace(/<div><br><\/div>/gi, '\n');
    txt = txt.replace(/<div>/gi, '\n');
    txt = txt.replace(/<\/div>/gi, '');
    txt = txt.replace(/<br\s*\/?>/gi, '\n');
    txt = txt.replace(/<p>/gi, '\n');
    txt = txt.replace(/<\/p>/gi, '');

    const unescape = document.createElement('textarea');
    unescape.innerHTML = txt;
    return unescape.value;
  };

  // Quando o usuário digita algo
  const handleChange = (evt) => {
    const newHtml = evt.target.value;
    setHtmlContent(newHtml);
    onChange({ target: { value: htmlToText(newHtml) } });
  };

  // Botões de Formatação (Negrito, Itálico...)
  const applyFormat = (tagStart, tagEnd) => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const selectedText = selection.toString();
    const newText = `${tagStart}${selectedText}${tagEnd}`;
    document.execCommand('insertText', false, newText);
  };

  // ✨ INSERÇÃO DA ARTE DO EMOJI PELO SELETOR
  const handleEmojiSelect = (shortcode) => {
    if (!editorRef.current) return;
    const el = editorRef.current.getEl();
    el.focus();
    
    const emoji = catalog.find(e => e.shortcode === shortcode);
    const imgUrl = emoji?.url || emoji?.file_url;
    
    if (imgUrl) {
      // Injeta a imagem .webp real na posição do cursor
      const imgHtml = `<img src="${imgUrl}" alt="${shortcode}" data-shortcode="${shortcode}" class="rich-emoji-img" draggable="false" style="width:22px;height:22px;vertical-align:middle;margin:0 2px;user-select:all;" />\u200B`;
      document.execCommand('insertHTML', false, imgHtml);
    } else {
      document.execCommand('insertText', false, shortcode);
    }
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

      {/* NOVO EDITOR VISUAL BLINDADO CONTRA BUGS */}
      <div className="rich-textarea-wrapper" style={{ backgroundColor: 'var(--input-bg, #111)', border: '1px solid var(--card-border, #333)', borderRadius: '0 0 8px 8px', position: 'relative' }}>
        <ContentEditable
          ref={editorRef}
          html={htmlContent}
          disabled={false}
          onChange={handleChange}
          tagName="div"
          className="rich-textarea visual-editor"
          style={{
            minHeight: `${rows * 24}px`, maxHeight: '300px', overflowY: 'auto',
            padding: '12px', color: 'var(--foreground, #fff)',
            fontSize: '0.95rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: 'inherit', outline: 'none'
          }}
          data-placeholder={placeholder}
        />
        {!htmlContent && placeholder && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', color: '#666', pointerEvents: 'none', fontSize: '0.95rem' }}>
            {placeholder}
          </div>
        )}
      </div>
      
      <div className="rich-helper">
        * Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis.
      </div>
      <div className="rich-premium-notice">
        ⚠️ <strong>Emojis Premium:</strong> Para que os emojis premium funcionem no Telegram, a conta que <u>criou o bot</u> no @BotFather precisa ter <strong>assinatura Telegram Premium</strong> ativa.
      </div>
    </div>
  );
}