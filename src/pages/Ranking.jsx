import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal, TrendingUp, Award } from 'lucide-react';
import { rankingService } from '../services/api'; // Importa o nosso mensageiro
import './Ranking.css';

export function Ranking() {
  // Pegamos o mês e ano atuais como padrão inicial
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
  
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de meses para o Filtro
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

  // Função que busca os dados lá do nosso servidor (main.py)
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

  // Toda vez que o Mês ou Ano mudar, a gente busca os dados de novo!
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

  // Ícones dinâmicos para o Top 3
  const renderPosicao = (posicao) => {
    if (posicao === 1) return <div className="posicao-badge ouro"><Trophy size={18} /> 1º</div>;
    if (posicao === 2) return <div className="posicao-badge prata"><Medal size={18} /> 2º</div>;
    if (posicao === 3) return <div className="posicao-badge bronze"><Award size={18} /> 3º</div>;
    return <div className="posicao-badge comum">{posicao}º</div>;
  };

  return (
    <div className="ranking-page-container">
      {/* CABEÇALHO */}
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

        {/* FILTROS */}
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

      {/* ÁREA DA TABELA */}
      <div className="ranking-card">
        {loading ? (
          <div className="ranking-loading">
            <div className="spinner"></div>
            <p>Calculando o Ranking...</p>
          </div>
        ) : rankingData.length > 0 ? (
          <div className="table-responsive">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th width="15%">Posição</th>
                  <th width="50%">Usuário (Username)</th>
                  <th width="35%" className="text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map((item) => (
                  <tr key={item.username} className={`rank-row rank-${item.posicao}`}>
                    <td>{renderPosicao(item.posicao)}</td>
                    <td className="user-cell">
                      <div className="user-avatar">{item.username.charAt(0).toUpperCase()}</div>
                      <span className="user-name">@{item.username}</span>
                    </td>
                    <td className="text-right faturamento-cell">
                      <TrendingUp size={16} className="trend-icon" />
                      {formatarDinheiro(item.total_faturado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ranking-empty">
            <Trophy size={48} className="empty-icon" />
            <h3>Nenhuma venda registrada</h3>
            <p>Ainda não há dados de vendas aprovadas para {meses.find(m => m.valor === mesSelecionado)?.nome} de {anoSelecionado}.</p>
          </div>
        )}
      </div>
    </div>
  );
}