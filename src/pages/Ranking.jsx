import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal, TrendingUp, Award, Crown, ShoppingBag } from 'lucide-react';
import { rankingService } from '../services/api'; // Importa o nosso mensageiro
import './Ranking.css';

export function Ranking() {
  // Pegamos o mês e ano atuais como padrão inicial para os filtros
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
  
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de meses para o Filtro (Dropdown)
  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  // Gera uma lista de anos (do ano passado até 2 anos no futuro)
  const anos = Array.from({ length: 4 }, (_, i) => dataAtual.getFullYear() - 1 + i);

  // ==========================================
  // 📡 INTEGRAÇÃO COM A API DO BACKEND
  // ==========================================
  const carregarRanking = async () => {
    setLoading(true);
    try {
      const response = await rankingService.getTopVendedores(mesSelecionado, anoSelecionado);
      if (response.status === 'success') {
        setRankingData(response.ranking);
      } else {
        setRankingData([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do ranking:", error);
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  };

  // Toda vez que o Mês ou Ano mudar, a gente busca os dados de novo automaticamente!
  useEffect(() => {
    carregarRanking();
  }, [mesSelecionado, anoSelecionado]);

  // Funçãozinha para formatar o dinheiro para o padrão Brasileiro (R$)
  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Ícones dinâmicos para a Tabela (Medalhas nas Posições)
  const renderPosicao = (posicao) => {
    if (posicao === 1) return <div className="posicao-badge ouro"><Trophy size={18} /> 1º</div>;
    if (posicao === 2) return <div className="posicao-badge prata"><Medal size={18} /> 2º</div>;
    if (posicao === 3) return <div className="posicao-badge bronze"><Award size={18} /> 3º</div>;
    return <div className="posicao-badge comum">{posicao}º</div>;
  };

  // ==========================================
  // 🏆 RENDERIZAÇÃO DO PÓDIO (TOP 3)
  // ==========================================
  const renderPodio = () => {
    if (rankingData.length === 0) return null;

    const top1 = rankingData[0];
    const top2 = rankingData[1];
    const top3 = rankingData[2];

    return (
      <div className="podium-container">
        {/* 2º LUGAR - PRATA (Fica na esquerda) */}
        {top2 && (
          <div className="podium-card prata">
            <div className="podium-avatar">{top2.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username">@{top2.username}</div>
            <div className="podium-sales-count">
              <ShoppingBag size={14} /> {top2.total_vendas} vendas
            </div>
            <div className="podium-revenue">{formatarDinheiro(top2.total_faturado)}</div>
          </div>
        )}

        {/* 1º LUGAR - OURO (Fica no centro, maior e com coroa flutuante) */}
        {top1 && (
          <div className="podium-card ouro">
            <Crown size={36} className="podium-crown" />
            <div className="podium-avatar">{top1.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username">@{top1.username}</div>
            <div className="podium-sales-count">
              <ShoppingBag size={14} /> {top1.total_vendas} vendas
            </div>
            <div className="podium-revenue">{formatarDinheiro(top1.total_faturado)}</div>
          </div>
        )}

        {/* 3º LUGAR - BRONZE (Fica na direita) */}
        {top3 && (
          <div className="podium-card bronze">
            <div className="podium-avatar">{top3.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username">@{top3.username}</div>
            <div className="podium-sales-count">
              <ShoppingBag size={14} /> {top3.total_vendas} vendas
            </div>
            <div className="podium-revenue">{formatarDinheiro(top3.total_faturado)}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ranking-page-container">
      {/* ==========================================
          CABEÇALHO E FILTROS 
          ========================================== */}
      <div className="ranking-header">
        <div className="ranking-title">
          <div className="icon-wrapper">
            <Trophy size={28} />
          </div>
          <div>
            <h1>Ranking de Vendas</h1>
            <p>Os maiores faturamentos da plataforma neste período.</p>
          </div>
        </div>

        {/* FILTROS DE DATA ALINHADOS */}
        <div className="ranking-filters">
          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <select 
              value={mesSelecionado} 
              onChange={(e) => setMesSelecionado(Number(e.target.value))}
              className="ranking-select"
            >
              {meses.map((m) => (
                <option key={m.valor} value={m.valor}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <select 
              value={anoSelecionado} 
              onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              className="ranking-select"
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ==========================================
          CONTEÚDO PRINCIPAL (LOADING, PÓDIO E TABELA) 
          ========================================== */}
      {loading ? (
        <div className="ranking-card">
          <div className="ranking-loading">
            <div className="spinner"></div>
            <p>Calculando o Ranking...</p>
          </div>
        </div>
      ) : rankingData.length > 0 ? (
        <>
          {/* 🔥 NOSSO PÓDIO DE DESTAQUE SUPERIOR */}
          {renderPodio()}

          {/* ÁREA DA TABELA (Lista Completa) */}
          <div className="ranking-card">
            <div className="table-responsive">
              <table className="ranking-table">
                <thead>
                  <tr>
                    {/* As larguras agora são tratadas de forma inteligente pelo CSS */}
                    <th>Posição</th>
                    <th>Usuário (Username)</th>
                    <th className="text-right">Desempenho</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item) => (
                    <tr key={item.username} className={`rank-row rank-${item.posicao}`}>
                      {/* Posição */}
                      <td>{renderPosicao(item.posicao)}</td>
                      
                      {/* Avatar e Nome */}
                      <td className="user-cell">
                        <div className="user-avatar">{item.username.charAt(0).toUpperCase()}</div>
                        <span className="user-name">@{item.username}</span>
                      </td>
                      
                      {/* Faturamento e Quantidade de Vendas (Alinhado à direita) */}
                      <td className="faturamento-cell">
                        <span className="faturamento-valor">
                          <TrendingUp size={16} className="trend-icon" />
                          {formatarDinheiro(item.total_faturado)}
                        </span>
                        <span className="vendas-detalhe">
                          <ShoppingBag size={12} /> {item.total_vendas} vendas concluídas
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ESTADO VAZIO: Nenhuma venda no mês selecionado */
        <div className="ranking-card">
          <div className="ranking-empty">
            <Trophy size={48} className="empty-icon" />
            <h3>Nenhuma venda registrada</h3>
            <p>Ainda não há dados de vendas aprovadas para {meses.find(m => m.valor === mesSelecionado)?.nome} de {anoSelecionado}.</p>
          </div>
        </div>
      )}
    </div>
  );
}