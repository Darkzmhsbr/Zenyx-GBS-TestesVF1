import React, { useState, useRef } from 'react';
import { Link as LinkIcon, Loader2, Image as ImageIcon, Mic, X, UploadCloud } from 'lucide-react';
import { mediaService } from '../services/api';
import Swal from 'sweetalert2';
import './MediaUploader.css';

export function MediaUploader({ 
  label = "Anexo de Mídia", 
  value, 
  onChange, 
  type = "media"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [acceptType, setAcceptType] = useState("*/*");
  const fileInputRef = useRef(null);

  // Aciona o input invisível dependendo se é Áudio ou Mídia (Foto/Vídeo)
  const handleUploadClick = (mediaType) => {
    if (mediaType === 'audio') {
      // Aceita apenas arquivos de áudio
      setAcceptType("audio/mpeg,audio/ogg,audio/wav,audio/mp4,audio/webm,audio/aac");
    } else {
      // Aceita apenas imagens e vídeos
      setAcceptType("image/*,video/mp4,video/quicktime,video/x-msvideo");
    }
    
    // Pequeno delay para garantir que o React atualizou o "accept" antes de abrir a janela do PC
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 10);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Proteção de 250MB
    const maxSizeMB = 250;
    if (file.size > maxSizeMB * 1024 * 1024) {
      Swal.fire({
        title: 'Arquivo muito grande',
        text: `O limite máximo permitido é de ${maxSizeMB}MB.`,
        icon: 'warning',
        background: '#1a1a1a',
        color: '#fff'
      });
      event.target.value = ''; 
      return;
    }

    setIsUploading(true);
    try {
      // Envia para o Backblaze B2 (O nome real do arquivo vai junto)
      const response = await mediaService.upload(file, type);
      
      if (response && response.url) {
        setShowLinkInput(false); // Fecha o input de URL manual se estiver aberto
        onChange(response.url); // Salva a URL no estado da página
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      Swal.fire({
        title: 'Falha no Upload',
        text: typeof error === 'string' ? error : 'Não foi possível enviar o arquivo.',
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff'
      });
    } finally {
      setIsUploading(false);
      event.target.value = ''; 
    }
  };

  // Limpa o anexo atual
  const handleClear = () => {
    onChange('');
    setShowLinkInput(false);
  };

  // 🧠 FUNÇÃO INTELIGENTE: Pega o link gigante e transforma no nome do arquivo
  const getDisplayFileName = (url) => {
    if (!url) return '';
    
    // Se for uma URL curta que o usuário digitou, mostra ela
    if (url.length < 30 && !url.includes('backblazeb2.com')) return url;

    try {
        const parts = url.split('/');
        let filename = parts[parts.length - 1]; // Pega a última parte (ex: flow_123abc.jpg)
        filename = filename.split('?')[0]; // Remove parâmetros de query se houver
        
        // Verifica a extensão para mostrar ícone visual
        const isAudio = filename.match(/\.(ogg|mp3|wav|m4a)$/i);
        const prefix = isAudio ? 'Audio_' : 'Media_';

        // Pega a extensão real
        const ext = filename.split('.').pop();
        
        // Retorna um nome bonitinho e curto: "Audio_2f8A...ogg"
        const hash = filename.substring(filename.indexOf('_') + 1, filename.indexOf('_') + 6);
        return `${prefix}${hash || 'File'}.${ext}`;
    } catch (e) {
        return "Arquivo Anexado";
    }
  };

  // Descobre se o link atual é áudio para mostrar o ícone correto na caixinha
  const isCurrentlyAudio = value && value.match(/\.(ogg|mp3|wav|m4a|aac)$/i);

  return (
    <div className="media-uploader-wrapper">
      {label && <label className="media-uploader-label">{label}</label>}
      
      {/* ⏳ ESTADO 1: CARREGANDO (GIRANDO) */}
      {isUploading && (
        <div className="media-uploader-loading-box">
          <Loader2 size={24} className="spinner-icon" />
          <span>Enviando arquivo para o servidor...</span>
        </div>
      )}

      {/* ✅ ESTADO 2: ARQUIVO ANEXADO (SUCESSO) */}
      {!isUploading && value && !showLinkInput && (
        <div className="media-uploader-attached-box">
           <div className="attached-file-info">
              <div className={`attached-icon ${isCurrentlyAudio ? 'audio' : 'visual'}`}>
                 {isCurrentlyAudio ? <Mic size={20} /> : <ImageIcon size={20} />}
              </div>
              <div className="attached-details">
                 <span className="attached-name">{getDisplayFileName(value)}</span>
                 <span className="attached-status">Arquivo pronto para envio</span>
              </div>
           </div>
           <button type="button" className="btn-remove-attachment" onClick={handleClear} title="Remover anexo">
              <X size={18} />
           </button>
        </div>
      )}

      {/* 🔲 ESTADO 3: VAZIO - MOSTRA OS 3 BOTÕES DE AÇÃO */}
      {!isUploading && !value && !showLinkInput && (
        <div className="media-uploader-action-buttons">
          <button type="button" className="action-btn visual-btn" onClick={() => handleUploadClick('visual')}>
            <ImageIcon size={18} />
            <span>Foto / Vídeo</span>
          </button>
          
          <button type="button" className="action-btn audio-btn" onClick={() => handleUploadClick('audio')}>
            <Mic size={18} />
            <span>Áudio (Voz)</span>
          </button>
          
          <button type="button" className="action-btn link-btn" onClick={() => setShowLinkInput(true)}>
            <LinkIcon size={18} />
            <span>Colar URL</span>
          </button>
        </div>
      )}

      {/* 🔗 ESTADO 4: INSERIR LINK MANUAL (FALLBACK) */}
      {!isUploading && (showLinkInput || (value && showLinkInput)) && (
        <div className="media-uploader-input-group manual-link-active">
          <div className="media-uploader-icon-container">
            <LinkIcon size={16} color="#a3a3a3" />
          </div>
          <input 
            type="text" 
            className="media-uploader-text-input"
            placeholder="Cole o link (https://...) da imagem, vídeo ou áudio..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" className="btn-cancel-link" onClick={() => { setShowLinkInput(false); if(!value) onChange(''); }} title="Cancelar">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 🕵️‍♂️ Input de arquivo invisível que faz a ponte com o Windows/Mac/Android */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptType}
      />
    </div>
  );
}