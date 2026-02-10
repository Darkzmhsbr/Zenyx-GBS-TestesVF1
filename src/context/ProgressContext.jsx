import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { remarketingService } from '../services/api';

// ============================================================
// 🚀 CONTEXTO GLOBAL DE PROGRESSO DE CAMPANHAS
// Mantém o widget de progresso visível mesmo ao navegar entre páginas
// ============================================================

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [activeProgress, setActiveProgress] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const progressIntervalRef = useRef(null);

  // Buscar progresso da campanha
  const fetchProgress = useCallback(async (campaignId) => {
    try {
      const data = await remarketingService.getProgress(campaignId);
      setProgressData(data);

      if (data.is_complete) {
        // Para o polling quando completo
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, []);

  // Iniciar monitoramento de progresso
  const startProgressMonitoring = useCallback((campaignId) => {
    // Limpa polling anterior se houver
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setActiveProgress({ campaignId, isMinimized: false });
    setProgressData(null);
    fetchProgress(campaignId);

    progressIntervalRef.current = setInterval(() => {
      fetchProgress(campaignId);
    }, 2000);
  }, [fetchProgress]);

  // Fechar widget
  const closeProgressWidget = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setActiveProgress(null);
    setProgressData(null);
  }, []);

  // Toggle minimizar/maximizar
  const toggleMinimize = useCallback(() => {
    setActiveProgress(prev => prev ? ({
      ...prev,
      isMinimized: !prev.isMinimized
    }) : null);
  }, []);

  const value = {
    activeProgress,
    progressData,
    startProgressMonitoring,
    closeProgressWidget,
    toggleMinimize
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress deve ser usado dentro de um ProgressProvider');
  }
  return context;
}