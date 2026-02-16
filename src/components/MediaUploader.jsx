import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-react';
import { mediaService } from '../services/api';
import Swal from 'sweetalert2';
import './MediaUploader.css';

export function MediaUploader({ 
  label = "URL da Mídia (Foto, Vídeo ou Áudio)", 
  value, 
  onChange, 
  type = "media",
  placeholder = "Cole o link ou faça o upload..."
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Aciona o clique no input de arquivo invisível
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Quando o usuário escolhe um arquivo
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Proteção: Limite de tamanho (50MB) para evitar travamentos
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      Swal.fire({
        title: 'Arquivo muito grande',
        text: `O limite máximo permitido é de ${maxSizeMB}MB.`,
        icon: 'warning',
        background: '#1a1a1a',
        color: '#fff'
      });
      event.target.value = ''; // Reseta
      return;
    }

    setIsUploading(true);
    try {
      // 🚀 Chama o serviço da API para mandar pro Backblaze
      const response = await mediaService.upload(file, type);
      
      if (response && response.url) {
        // 🔥 MÁGICA: Preenche o campo automaticamente com o link do Backblaze!
        onChange(response.url);
        
        // Alerta elegante de sucesso no canto da tela
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1a1a1a',
          color: '#fff'
        });
        Toast.fire({
          icon: 'success',
          title: 'Upload concluído com sucesso!'
        });
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
      event.target.value = ''; // Libera o input para se o usuário quiser enviar outra coisa depois
    }
  };

  return (
    <div className="media-uploader-wrapper">
      {label && <label className="media-uploader-label">{label}</label>}
      
      <div className="media-uploader-input-group">
        <div className="media-uploader-icon-container">
          <LinkIcon size={16} color="#a3a3a3" />
        </div>
        
        <input 
          type="text" 
          className="media-uploader-text-input"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isUploading}
        />
        
        <button 
          type="button" 
          className={`media-uploader-btn ${isUploading ? 'uploading' : ''}`}
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="spinner-icon" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      {/* 🕵️‍♂️ Input de arquivo invisível que faz o trabalho sujo */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,video/mp4,video/quicktime,video/x-msvideo,audio/mpeg,audio/ogg,audio/wav"
      />
    </div>
  );
}