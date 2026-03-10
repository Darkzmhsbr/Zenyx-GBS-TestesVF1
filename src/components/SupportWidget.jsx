import React, { useState } from 'react';
import { X, MessageCircle, Headphones } from 'lucide-react';
import './SupportWidget.css';

/**
 * 💬 SupportWidget - Botão flutuante de suporte via Telegram
 * Posicionado no canto inferior direito da tela.
 * Ao clicar, expande um mini card com CTA para o suporte.
 */
export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const SUPPORT_LINK = 'https://t.me/DiihNvx';

  const handleOpenSupport = () => {
    const message = encodeURIComponent('Olá, estou com dificuldades para configurar meu bot na Zenyx VIPs e preciso de ajuda! 🤖');
    window.open(`${SUPPORT_LINK}?text=${message}`, '_blank');
  };

  return (
    <div className="support-widget-container">
      {/* 💬 Card expandido */}
      {isOpen && (
        <div className="support-widget-card">
          <button className="support-widget-card-close" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>

          <div className="support-widget-card-header">
            <div className="support-widget-avatar">
              <Headphones size={22} />
            </div>
            <div className="support-widget-header-text">
              <span className="support-widget-title">Suporte Zenyx</span>
              <span className="support-widget-status">
                <span className="support-widget-status-dot" />
                Online agora
              </span>
            </div>
          </div>

          <p className="support-widget-message">
            Está com dificuldades para configurar seu Bot? Nossa equipe está pronta para te ajudar!
          </p>

          <button className="support-widget-cta" onClick={handleOpenSupport}>
            {/* Telegram Icon */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>Contatar Suporte</span>
          </button>
        </div>
      )}

      {/* 🔵 FAB Button */}
      <button 
        className={`support-widget-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Suporte via Telegram"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            {/* Telegram Icon as FAB */}
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" className="support-widget-fab-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            {/* Pulse ring */}
            <span className="support-widget-fab-pulse" />
          </>
        )}
      </button>
    </div>
  );
}