import React from 'react';
import { Minimize2, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

// ============================================================
// 🚀 WIDGET FLUTUANTE DE PROGRESSO DE CAMPANHAS
// Renderizado no MainLayout, persiste entre navegações de página
// ============================================================

export function ProgressWidget() {
  const { activeProgress, progressData, closeProgressWidget, toggleMinimize } = useProgress();

  // Não renderiza nada se não houver campanha ativa
  if (!activeProgress || !progressData) return null;

  const { isMinimized } = activeProgress;
  const { percentage, sent_success, blocked_count, total_leads, processed, status } = progressData;

  const remaining = total_leads - processed;
  const secondsRemaining = remaining * 0.04;
  const minutesRemaining = Math.ceil(secondsRemaining / 60);

  // Versão minimizada
  if (isMinimized) {
    return (
      <div className="progress-widget minimized">
        <div className="progress-mini-content" onClick={toggleMinimize}>
          <span>🚀 {processed}/{total_leads} ({percentage}%)</span>
        </div>
        <button className="btn-close-mini" onClick={closeProgressWidget}>
          <X size={14} />
        </button>
      </div>
    );
  }

  // Versão expandida
  return (
    <div className="progress-widget expanded">
      <div className="progress-header">
        <h3>🚀 Enviando Campanha</h3>
        <div className="progress-controls">
          <button onClick={toggleMinimize} title="Minimizar">
            <Minimize2 size={16} />
          </button>
          <button onClick={closeProgressWidget} title="Fechar">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="progress-body">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="progress-percentage">
          {processed}/{total_leads} ({percentage}%)
        </div>
        
        <div className="progress-metrics">
          <div className="metric">
            <span className="metric-label">✅ Enviados:</span>
            <span className="metric-value">{sent_success}</span>
          </div>
          <div className="metric">
            <span className="metric-label">❌ Bloqueados:</span>
            <span className="metric-value">{blocked_count}</span>
          </div>
          {status === 'enviando' && remaining > 0 && (
            <div className="metric">
              <span className="metric-label">⏱️ Tempo restante:</span>
              <span className="metric-value">~{minutesRemaining} min</span>
            </div>
          )}
        </div>
        
        <div className="progress-status">
          {status === 'enviando' && <span className="status-sending">⚡ Enviando...</span>}
          {status === 'concluido' && <span className="status-complete">✅ Concluído!</span>}
          {status === 'erro' && <span className="status-error">❌ Erro no envio</span>}
        </div>
      </div>
    </div>
  );
}