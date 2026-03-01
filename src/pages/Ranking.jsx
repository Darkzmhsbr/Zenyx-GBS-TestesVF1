import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Medal, TrendingUp, Award, Crown, ShoppingBag } from 'lucide-react';
import { rankingService } from '../services/api'; 
import './Ranking.css';

export function Ranking() {
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
  const [modoTodos, setModoTodos] = useState(false); // 🆕 "Todos os Tempos"
  
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
  ];

  const anos = Array.from({ length: 4 }, (_, i) => dataAtual.getFullYear() - 1 + i);

  const carregarRanking = async () => {
    setLoading(true);
    try {
      const mes = modoTodos ? 0 : mesSelecionado;
      const ano = modoTodos ? 0 : anoSelecionado;
      const response = await rankingService.getTopVendedores(mes, ano);
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

  useEffect(() => {
    carregarRanking();
  }, [mesSelecionado, anoSelecionado, modoTodos]);

  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL'
    }).format(valor);
  };

  const renderPosicao = (posicao) => {
    if (posicao === 1) return <div className="posicao-badge ouro" style={{ minWidth: '70px', justifyContent: 'center' }}><Trophy size={18} /> 1º</div>;
    if (posicao === 2) return <div className="posicao-badge prata" style={{ minWidth: '70px', justifyContent: 'center' }}><Medal size={18} /> 2º</div>;
    if (posicao === 3) return <div className="posicao-badge bronze" style={{ minWidth: '70px', justifyContent: 'center' }}><Award size={18} /> 3º</div>;
    return <div className="posicao-badge comum" style={{ minWidth: '70px', justifyContent: 'center' }}>{posicao}º</div>;
  };

  const renderPodio = () => {
    if (rankingData.length === 0) return null;

    const top1 = rankingData[0];
    const top2 = rankingData[1];
    const top3 = rankingData[2];

    return (
      <div className="podium-container">
        {top2 && (
          <div className="podium-card prata">
            <div className="podium-avatar">{top2.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username" style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{top2.username}</div>
            <div className="podium-sales-count">
              <ShoppingBag size={14} /> {top2.total_vendas} vendas
            </div>
            <div className="podium-revenue">{formatarDinheiro(top2.total_faturado)}</div>
          </div>
        )}

        {top1 && (
          <div className="podium-card ouro">
            <Crown size={36} className="podium-crown" />
            <div className="podium-avatar">{top1.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username" style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{top1.username}</div>
            <div className="podium-sales-count">
              <ShoppingBag size={14} /> {top1.total_vendas} vendas
            </div>
            <div className="podium-revenue">{formatarDinheiro(top1.total_faturado)}</div>
          </div>
        )}

        {top3 && (
          <div className="podium-card bronze">
            <div className="podium-avatar">{top3.username.charAt(0).toUpperCase()}</div>
            <div className="podium-username" style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{top3.username}</div>
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
      {/* CABEÇALHO E FILTROS */}
      <div className="ranking-header">
        <div className="ranking-title">
          <div className="icon-wrapper">
            <Trophy size={28} />
          </div>
          <div>
            <h1>Ranking de Vendas</h1>
            <p>{modoTodos ? 'Ranking geral de todos os tempos da plataforma.' : 'Os maiores faturamentos da plataforma neste período.'}</p>
          </div>
        </div>

        {/* 🔥 FILTROS COM ESTRUTURA BLINDADA CONTRA SOBREPOSIÇÃO */}
        <div className="ranking-filters" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* 🆕 BOTÃO: TODOS OS TEMPOS */}
          <button 
            onClick={() => setModoTodos(!modoTodos)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: modoTodos ? 'rgba(195,51,255,0.15)' : '#161616',
              border: modoTodos ? '1px solid rgba(195,51,255,0.5)' : '1px solid #333',
              borderRadius: '8px', padding: '0 16px', height: '42px',
              color: modoTodos ? '#c333ff' : '#a3a3a3', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap'
            }}
          >
            <Trophy size={16} /> {modoTodos ? '✓ Todos os Tempos' : 'Todos os Tempos'}
          </button>

          {!modoTodos && (
            <>
              <div style={{ 
                display: 'flex', alignItems: 'center', backgroundColor: '#161616', 
                border: '1px solid #333', borderRadius: '8px', padding: '0 12px', height: '42px',
                flex: '1 1 0', minWidth: 0
              }}>
                <Calendar size={18} color="#a3a3a3" style={{ marginRight: '8px', flexShrink: 0 }} />
                <select 
                  value={mesSelecionado} 
                  onChange={(e) => setMesSelecionado(Number(e.target.value))}
                  style={{ 
                    background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem',
                    outline: 'none', cursor: 'pointer', width: '100%', minWidth: 0
                  }}
                >
                  {meses.map((m) => (
                    <option key={m.valor} value={m.valor} style={{ background: '#1a1a1a' }}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ 
                display: 'flex', alignItems: 'center', backgroundColor: '#161616', 
                border: '1px solid #333', borderRadius: '8px', padding: '0 12px', height: '42px',
                flex: '1 1 0', minWidth: 0
              }}>
                <Calendar size={18} color="#a3a3a3" style={{ marginRight: '8px', flexShrink: 0 }} />
                <select 
                  value={anoSelecionado} 
                  onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                  style={{ 
                    background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem',
                    outline: 'none', cursor: 'pointer', width: '100%', minWidth: 0
                  }}
                >
                  {anos.map((a) => (
                    <option key={a} value={a} style={{ background: '#1a1a1a' }}>{a}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      {loading ? (
        <div className="ranking-card">
          <div className="ranking-loading">
            <div className="spinner"></div>
            <p>Calculando o Ranking...</p>
          </div>
        </div>
      ) : rankingData.length > 0 ? (
        <>
          {/* PÓDIO */}
          {renderPodio()}

          {/* TABELA ALINHADA E CRAVADA */}
          <div className="ranking-card">
            <div className="table-responsive">
              <table className="ranking-table" style={{ width: '100%', minWidth: '700px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '15%', textAlign: 'center' }}>Posição</th>
                    <th style={{ width: '45%', textAlign: 'left', paddingLeft: '20px' }}>Usuário (Username)</th>
                    <th style={{ width: '40%', textAlign: 'right', paddingRight: '24px' }}>Desempenho</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item) => (
                    <tr key={item.username} className={`rank-row rank-${item.posicao}`}>
                      
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {renderPosicao(item.posicao)}
                      </td>
                      
                      <td style={{ verticalAlign: 'middle', paddingLeft: '20px' }}>
                        <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div className="user-avatar" style={{ flexShrink: 0 }}>{item.username.charAt(0).toUpperCase()}</div>
                          <span className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>@{item.username}</span>
                        </div>
                      </td>
                      
                      <td style={{ textAlign: 'right', verticalAlign: 'middle', paddingRight: '24px' }}>
                        <div className="faturamento-cell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className="faturamento-valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={16} className="trend-icon" color="#22c55e" />
                            {formatarDinheiro(item.total_faturado)}
                          </span>
                          <span className="vendas-detalhe" style={{ color: '#a3a3a3', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShoppingBag size={12} /> {item.total_vendas} vendas concluídas
                          </span>
                        </div>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="ranking-card">
          <div className="ranking-empty">
            <Trophy size={48} className="empty-icon" />
            <h3>Nenhuma venda registrada</h3>
            <p>Ainda não há dados de vendas aprovadas {modoTodos ? 'na plataforma' : `para ${meses.find(m => m.valor === mesSelecionado)?.nome} de ${anoSelecionado}`}.</p>
          </div>
        </div>
      )}
    </div>
  );
}