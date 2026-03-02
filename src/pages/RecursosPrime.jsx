import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Lock, TrendingUp, Copy, Repeat, Brain, Search, Zap, Shield,
  ChevronRight, Star, Trophy, Sparkles, CheckCircle
} from 'lucide-react';
import { recursosPrimeService } from '../services/api';
import './RecursosPrime.css';

const ICON_MAP = {
  TrendingUp, Copy, Repeat, Brain, Search, Zap, Shield
};

export function RecursosPrime() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await recursosPrimeService.getRecursos();
      setData(res);
    } catch (e) {
      console.error('Erro:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  
  const progressPercent = data ? (data.desbloqueados / data.total_recursos) * 100 : 0;

  if (loading) {
    return (
      <div className="rp-container">
        <div className="rp-loading">
          <div className="rp-spinner" />
          <p>Carregando recursos...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rp-container">
      {/* HERO HEADER */}
      <div className="rp-hero">
        <div className="rp-hero-bg">
          <Crown size={200} />
        </div>
        <div className="rp-hero-content">
          <div className="rp-hero-badge">
            <Crown size={16} /> RECURSOS PRIME
          </div>
          <h1 className="rp-hero-title">
            Desbloqueie recursos exclusivos
          </h1>
          <p className="rp-hero-subtitle">
            Conquiste metas de faturamento e libere ferramentas poderosas para acelerar seus resultados.
          </p>

          {/* Progress */}
          <div className="rp-progress-section">
            <div className="rp-progress-header">
              <div className="rp-progress-stats">
                <span className="rp-progress-count">
                  <Sparkles size={16} />
                  {data.desbloqueados}/{data.total_recursos} desbloqueados
                </span>
                <span className="rp-progress-revenue">
                  <Trophy size={16} />
                  Faturamento total: <strong>{formatMoney(data.faturamento_total_reais)}</strong>
                </span>
              </div>
            </div>
            <div className="rp-progress-track">
              <div 
                className="rp-progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {data.proxima_meta && (
              <div className="rp-next-goal">
                Próximo desbloqueio: <strong>{data.proxima_meta.nome}</strong> — 
                faltam <strong>{formatMoney(data.proxima_meta.falta_reais)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECURSOS GRID */}
      <div className="rp-grid">
        {data.recursos.map((recurso, index) => {
          const IconComponent = ICON_MAP[recurso.icone] || Star;
          const isLocked = recurso.status === 'bloqueado';
          const isFree = recurso.meta_reais === 0;
          
          return (
            <div 
              key={recurso.id}
              className={`rp-card ${isLocked ? 'locked' : 'unlocked'}`}
              onClick={() => !isLocked && recurso.rota && navigate(recurso.rota)}
              style={{ '--card-color': recurso.cor }}
            >
              {/* Lock overlay */}
              {isLocked && (
                <div className="rp-card-lock-overlay">
                  <Lock size={32} />
                  <span>Fature {formatMoney(recurso.meta_reais)} para desbloquear</span>
                </div>
              )}

              <div className="rp-card-header">
                <div className="rp-card-icon" style={{ background: `${recurso.cor}15`, color: recurso.cor }}>
                  <IconComponent size={24} />
                </div>
                <div className="rp-card-status">
                  {isLocked ? (
                    <span className="rp-badge locked">
                      <Lock size={12} /> Bloqueado
                    </span>
                  ) : isFree ? (
                    <span className="rp-badge free">
                      <Star size={12} /> Grátis
                    </span>
                  ) : (
                    <span className="rp-badge unlocked">
                      <CheckCircle size={12} /> Desbloqueado
                    </span>
                  )}
                </div>
              </div>

              <h3 className="rp-card-title">{recurso.nome}</h3>
              <p className="rp-card-desc">{recurso.descricao}</p>

              <div className="rp-card-footer">
                {isLocked ? (
                  <div className="rp-card-meta-info">
                    <span className="rp-card-meta">Meta: {formatMoney(recurso.meta_reais)}</span>
                    <div className="rp-card-mini-progress">
                      <div 
                        className="rp-card-mini-fill" 
                        style={{ 
                          width: `${Math.min(100, (data.faturamento_total_reais / recurso.meta_reais) * 100)}%`,
                          background: recurso.cor 
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <button className="rp-card-action" style={{ color: recurso.cor }}>
                    Acessar <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INFO FOOTER */}
      <div className="rp-info-footer">
        <Star size={18} />
        <p>
          Os recursos são desbloqueados automaticamente conforme seu faturamento cresce. 
          Continue vendendo para liberar ferramentas cada vez mais poderosas!
        </p>
      </div>
    </div>
  );
}