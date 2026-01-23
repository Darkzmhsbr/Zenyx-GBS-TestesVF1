import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zenyxvips.com/api';

export function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Atualiza a cada 10 segundos para simular tempo real
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/activity-feed`);
      if (response.data && response.data.activities) {
        setActivities(response.data.activities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      // Se der erro, usa dados mock
      setActivities([
        { name: "João P.", plan: "Acesso Semanal", price: 2.00, action: "ADICIONADO", icon: "✅" },
        { name: "Maria S.", plan: "Grupo VIP Premium", price: 5.00, action: "ADICIONADO", icon: "✅" },
        { name: "Carlos A.", plan: "Acesso Mensal", price: 10.00, action: "REMOVIDO", icon: "❌" },
        { name: "Ana C.", plan: "Acesso VIP", price: 15.00, action: "ADICIONADO", icon: "✅" },
        { name: "Lucas F.", plan: "Grupo Elite", price: 8.00, action: "ADICIONADO", icon: "✅" },
      ]);
      setLoading(false);
    }
  };

  return (
    <section id="automacao" className="activity-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Automação Inteligente 🔥</h2>
          <p className="section-subtitle">Do pagamento ao acesso VIP em segundos</p>
        </div>

        <div className="activity-content">
          {/* Feed de Atividades */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              Atividade em Tempo Real
            </h3>
            <div className="activity-feed-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Carregando atividades...
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-details">
                      <p className="activity-name">
                        {activity.name} - {activity.plan}
                      </p>
                      <p className="activity-plan">
                        {activity.action}
                      </p>
                    </div>
                    <div className="activity-price">
                      R$ {activity.price.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Destaques */}
          <div className="activity-highlights">
            <div className="highlight-item">
              <div className="highlight-icon">📦</div>
              <h3 className="highlight-title">Vendas Automatizadas</h3>
              <p className="highlight-description">
                Do pagamento até o acesso VIP sem nenhuma intervenção manual. 
                Aprovação instantânea via webhook.
              </p>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon">♻️</div>
              <h3 className="highlight-title">Remarketing Inteligente</h3>
              <p className="highlight-description">
                Recupere vendas com mensagens automáticas. 
                Segmentação avançada por estágio do funil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}