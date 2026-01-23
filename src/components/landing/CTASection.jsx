import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zenyxvips.com/api';

export function CTASection() {
  const [stats, setStats] = useState({
    total_bots: 500,
    total_sales: 5000,
    total_revenue: 50000,
    active_users: 1200
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/stats`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Mantém valores padrão em caso de erro
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  return (
    <section className="section-container">
      <div className="cta-section">
        <h2 className="cta-title">Pronto para Escalar suas Vendas?</h2>
        <p className="cta-subtitle">
          Junte-se a centenas de criadores que já automatizaram seus negócios
        </p>

        <div className="cta-stats">
          <div className="cta-stat">
            <p className="cta-stat-value">🎯 {formatNumber(stats.total_bots)}+</p>
            <p className="cta-stat-label">Bots Criados</p>
          </div>
          <div className="cta-stat">
            <p className="cta-stat-value">💰 {formatCurrency(stats.total_revenue)}+</p>
            <p className="cta-stat-label">em Vendas Processadas</p>
          </div>
          <div className="cta-stat">
            <p className="cta-stat-value">⚡ {formatNumber(stats.active_users)}+</p>
            <p className="cta-stat-label">Usuários Ativos</p>
          </div>
        </div>

        <Link to="/register" className="hero-btn-primary">
          Começar Agora Grátis
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}