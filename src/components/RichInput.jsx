import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import { PremiumEmojiPicker } from './PremiumEmojiPicker';
import { premiumEmojiService } from '../services/api'; // 🔥 Adicionado para buscar os emojis
import './RichInput.css';

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // ✨ MÁGICA 1: Carrega o catálogo de emojis para podermos renderizar as imagens reais
  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        // Busca os emojis da sua API (ajuste o método se tiver outro nome na sua api.js)
        const data = await premiumEmojiService.getEmojis();
        setCatalog(data || []);
      } catch (error) {
        console.error("Erro ao buscar catálogo de emojis no RichInput:", error);
      }
    };
    fetchEmojis();
  }, []);

  // ✨ MÁGICA 2: Transforma o texto do banco (com shortcodes) em visual (com imagens)
  const parseTextToVisual = useCallback((text) => {
    if (!text) return "";
    
    // 1. Escapamos o HTML para que o usuário veja <b>Texto</b> literalmente e não o texto formatado escondendo a tag
    let html = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    // 2. Substituímos os shortcodes pelas imagens reais
    if (catalog && catalog.length > 0) {
      catalog.forEach(emoji => {
        const regex = new RegExp(emoji.shortcode, 'g');
        // Assume que a URL da imagem venha na prop 'url' ou 'file_url' da sua API
        const imgUrl = emoji.url || emoji.file_url || '';
        
        const visual = imgUrl 
          ? `<img src="${imgUrl}" alt="${emoji.shortcode}" data-shortcode="${emoji.shortcode}" class="rich-inline-emoji" style="width:22px; height:22px; vertical-align:middle; display:inline-block; margin:0 2px; user-select:none;" />`
          : `<span class="rich-inline-emoji" data-shortcode="${emoji.shortcode}" style="color:#c333ff; background:rgba(195,51,255,0.1); padding:2px 4px; border-radius:4px; font-size:0.9em; user-select:none;">${emoji.fallback || '✨'}</span>`;
        
        html = html.replace(regex, visual);
      });
    }
    return html;
  }, [catalog]);

  // ✨ MÁGICA 3: Transforma o visual (com imagens) de volta para texto puro (para salvar no banco)
  const parseVisualToText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // 1. Encontrar todas as imagens e transformar de volta em shortcode (ex: :fire:)
    const emojis = temp.querySelectorAll('.rich-inline-emoji');
    emojis.forEach(el => {
      const shortcode = el.getAttribute('data-shortcode');
      if (shortcode) {
        el.replaceWith(document.createTextNode(shortcode));
      }
    });

    // 2. Converter quebras de linha que a div cria para \n reais
    let text = temp.innerHTML;
    text = text.replace(/<div><br><\/div>/gi, '\n');
    text = text.replace(/<div>/gi, '\n');
    text = text.replace(/<\/div>/gi, '');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // 3. Desescapar as tags HTML (<, >) para salvar <b> no banco corretamente
    const unescapeDiv = document.createElement('div');
    unescapeDiv.innerHTML = text;
    return unescapeDiv.textContent || unescapeDiv.innerText || "";
  };

  // Sincroniza o valor externo apenas quando o campo não está focado (evita pulo do cursor)
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      const newHtml = parseTextToVisual(value || "");
      if (editorRef.current.innerHTML !== newHtml) {
        editorRef.current.innerHTML = newHtml;
      }
    }
  }, [value, catalog, isFocused, parseTextToVisual]);

  // Lida com a digitação do usuário e avisa o formulário
  const handleInput = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const plainText = parseVisualToText(currentHtml);
    onChange({ target: { value: plainText } });
  };

  // Função original de formatação mantida e adaptada para o novo motor visual
  const applyFormat = (tagStart, tagEnd) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    const newText = `${tagStart}${selectedText}${tagEnd}`;
    
    // insertText insere o texto literal de forma segura no cursor
    document.execCommand('insertText', false, newText);
  };

  // ✨ Insere o emoji premium como IMAGEM na posição exata do cursor
  const handleEmojiSelect = (shortcode) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const emoji = catalog.find(e => e.shortcode === shortcode);
    const imgUrl = emoji?.url || emoji?.file_url || '';

    if (imgUrl) {
      const imgHTML = `<img src="${imgUrl}" alt="${shortcode}" data-shortcode="${shortcode}" class="rich-inline-emoji" style="width:22px; height:22px; vertical-align:middle; display:inline-block; margin:0 2px; user-select:none;" />&nbsp;`;
      document.execCommand('insertHTML', false, imgHTML);
    } else {
      const spanHTML = `<span class="rich-inline-emoji" data-shortcode="${shortcode}" style="color:#c333ff; background:rgba(195,51,255,0.1); padding:2px 4px; border-radius:4px; font-size:0.9em; user-select:none;">${emoji?.fallback || '✨'}</span>&nbsp;`;
      document.execCommand('insertHTML', false, spanHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Digite a URL do link:", "https://");
    if (url) {
      applyFormat(`<a href="${url}">`, '</a>');
    }
  };

  // Estilo inline para garantir que a nova Div se comporte 100% igual à Textarea antiga
  const editorStyle = {
    minHeight: `${rows * 24}px`,
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '12px',
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit',
    width: '100%'
  };

  return (
    <div className="rich-input-container">
      {label && <label className="rich-label">{label}</label>}
      
      <div className="rich-toolbar">
        <button type="button" className="rich-btn" onClick={() => applyFormat('<b>', '</b>')} title="Negrito">
          <Bold size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<i>', '</i>')} title="Itálico">
          <Italic size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<u>', '</u>')} title="Sublinhado">
          <Underline size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<s>', '</s>')} title="Tachado">
          <Strikethrough size={16} />
        </button>
        
        <div className="rich-separator"></div>
        
        <button type="button" className="rich-btn" onClick={() => applyFormat('<span class="tg-spoiler">', '</span>')} title="Spoiler (Oculto)">
          <EyeOff size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<pre>', '</pre>')} title="Bloco de Código (Copiar)">
          <Code size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<blockquote>', '</blockquote>')} title="Citação">
          <Quote size={16} />
        </button>
        
        <div className="rich-separator"></div>

        <button type="button" className="rich-btn" onClick={addLink} title="Link">
          <LinkIcon size={16} />
        </button>

        {/* EMOJI PREMIUM PICKER */}
        <div className="rich-separator"></div>
        <PremiumEmojiPicker onSelect={handleEmojiSelect} compact={true} />
      </div>

      {/* ✨ EVOLUÇÃO AQUI: Substituímos o <textarea> pelo contentEditable (visual-editor) */}
      <div className="rich-textarea-wrapper" style={{ border: '1px solid #333', borderRadius: '0 0 8px 8px', backgroundColor: '#111', color: '#fff' }}>
        <div
          ref={editorRef}
          className="rich-textarea visual-editor"
          style={editorStyle}
          contentEditable={true}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleInput(); // Garante o sync final ao sair
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
      </div>
      
      <div className="rich-helper">
        * Selecione o texto e clique no ícone para formatar. ✨ Use o botão de emoji premium para inserir custom emojis visuais.
      </div>
      <div className="rich-premium-notice">
        ⚠️ <strong>Emojis Premium:</strong> Para que os emojis premium funcionem no Telegram, a conta que <u>criou o bot</u> no @BotFather precisa ter <strong>assinatura Telegram Premium</strong> ativa.
      </div>
    </div>
  );
}