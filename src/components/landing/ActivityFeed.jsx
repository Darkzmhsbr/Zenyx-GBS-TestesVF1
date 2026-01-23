import React, { useState, useEffect } from 'react';
import { publicService } from '../../api';

export function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Atualiza do backend a cada 30 segundos
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animação rotativa local (a cada 3 segundos)
  useEffect(() => {
    if (activities.length > 0) {
      // Mostra primeiros 5
      setDisplayedActivities(activities.slice(0, 5));
      
      let currentIndex = 0;
      const rotateInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % activities.length;
        
        // Cria array com 5 itens começando do índice atual
        const newDisplay = [];
        for (let i = 0; i < 5; i++) {
          const idx = (currentIndex + i) % activities.length;
          newDisplay.push(activities[idx]);
        }
        
        setDisplayedActivities(newDisplay);
      }, 3000); // Roda a cada 3 segundos
      
      return () => clearInterval(rotateInterval);
    }
  }, [activities]);

  const fetchActivities = async () => {
    try {
      const data = await publicService.getActivityFeed();
      if (data && data.activities) {
        setActivities(data.activities);
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
                displayedActivities.map((activity, index) => (
                  <div key={`${activity.name}-${index}`} className="activity-item">
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