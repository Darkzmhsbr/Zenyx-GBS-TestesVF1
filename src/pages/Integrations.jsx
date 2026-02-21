import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Save, CheckCircle, XCircle, ShieldCheck, AlertCircle,
  Settings, Power, PowerOff, ArrowUpDown, Edit3, ExternalLink,
  Zap, Shield, RefreshCw, ChevronDown, X, Eye, EyeOff, Star
} from 'lucide-react';
import Swal from 'sweetalert2';
import { integrationService } from '../services/api';
import { useBot } from '../context/BotContext';
import './Integrations.css';

// =========================================================
// 🎨 DADOS DAS GATEWAYS DISPONÍVEIS NA PLATAFORMA
// =========================================================
const GATEWAYS_INFO = {
  pushinpay: {
    id: 'pushinpay',
    nome: 'PushinPay',
    descricao: 'Pagamento via PIX',
    cor: '#00e676',
    corGradient: 'linear-gradient(135deg, #00e676, #00a855)',
    logo: 'https://f005.backblazeb2.com/file/Bot-TikTok/zenyx/pushinpay-logo-3d.png',
    taxaInfo: 'Taxa ~3%',
    site: 'https://pushinpay.com.br',
    tokenLabel: 'Token da API (Bearer Token)',
    tokenPlaceholder: 'Cole seu token PushinPay aqui...',
    disponivel: true
  },
  wiinpay: {
    id: 'wiinpay',
    nome: 'WiinPay',
    descricao: 'Pagamento via PIX',
    cor: '#a855f7',
    corGradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    logo: 'https://f005.backblazeb2.com/file/Bot-TikTok/zenyx/wiinpay-logo-3d.png',
    taxaInfo: 'Taxa ~4.5%',
    site: 'https://wiinpay.com.br',
    tokenLabel: 'Chave API (API Key)',
    tokenPlaceholder: 'Cole sua API Key WiinPay aqui...',
    disponivel: true
  },
  syncpay: {
    id: 'syncpay',
    nome: 'Sync Pay',
    descricao: 'Pagamento via PIX',
    cor: '#3b82f6', // Azul tecnológico
    corGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    logo: 'https://f005.backblazeb2.com/file/Bot-TikTok/zenyx/syncpay-logo-3d.png',
    taxaInfo: 'Taxa Personalizada',
    site: 'https://app.syncpayments.com.br',
    // Sync Pay usa duas chaves, então labels duplas:
    tokenLabel: 'Client ID (Chave Pública)',
    tokenPlaceholder: 'Ex: 5ee78200-8b99...',
    tokenLabel2: 'Client Secret (Chave Privada)',
    tokenPlaceholder2: 'Ex: a490fcdb-78dd...',
    disponivel: true
  },
  mercadopago: {
    id: 'mercadopago',
    nome: 'Mercado Pago',
    descricao: 'Pagamento via PIX',
    cor: '#00b1ea',
    corGradient: 'linear-gradient(135deg, #00b1ea, #0077b6)',
    logo: 'https://f005.backblazeb2.com/file/Bot-TikTok/zenyx/mercadopago-logo.png',
    taxaInfo: 'Em breve',
    site: '#',
    tokenLabel: '',
    tokenPlaceholder: '',
    disponivel: false
  }
};

export function Integrations() {
  const { selectedBot } = useBot();
  
  // Estado geral das gateways do bot
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal de configuração
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGateway, setModalGateway] = useState(null);
  
  // 🆕 Estados para lidar com campos únicos ou duplos (Sync Pay)
  const [modalToken, setModalToken] = useState(''); // Usado para Pushin e Wiin
  const [modalClientSecret, setModalClientSecret] = useState(''); // Usado só na Sync Pay
  
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [modalMode, setModalMode] = useState('new'); // 'new' ou 'edit'
  
  // Modal de contingência
  const [contingenciaOpen, setContingenciaOpen] = useState(false);
  const [tempPrincipal, setTempPrincipal] = useState('pushinpay');
  const [tempFallback, setTempFallback] = useState('');

  // =========================================================
  // 📡 CARREGAMENTO DE DADOS
  // =========================================================
  const carregarConfig = useCallback(async () => {
    if (!selectedBot) return;
    setLoading(true);
    
    try {
      const config = await integrationService.getGatewayConfig(selectedBot.id);
      setGatewayConfig(config);
    } catch (error) {
      console.error("Erro ao carregar config de gateways:", error);
      // Fallback: monta config padrão
      setGatewayConfig({
        bot_id: selectedBot.id,
        gateway_principal: 'pushinpay',
        gateway_fallback: null,
        pushinpay: { ativo: false, configurado: false, token_mask: '' },
        wiinpay: { ativo: false, configurado: false, token_mask: '' },
        syncpay: { ativo: false, configurado: false, token_mask: '' }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBot]);

  useEffect(() => {
    if (selectedBot) carregarConfig();
  }, [selectedBot, carregarConfig]);

  // =========================================================
  // 📊 CÁLCULOS DE CONTADORES
  // =========================================================
  const contadores = {
    ativos: [
      gatewayConfig?.pushinpay?.ativo,
      gatewayConfig?.wiinpay?.ativo,
      gatewayConfig?.syncpay?.ativo
    ].filter(Boolean).length,
    configurados: [
      gatewayConfig?.pushinpay?.configurado,
      gatewayConfig?.wiinpay?.configurado,
      gatewayConfig?.syncpay?.configurado
    ].filter(Boolean).length,
    disponiveis: Object.values(GATEWAYS_INFO).filter(g => g.disponivel).length
  };

  // =========================================================
  // ⚡ AÇÕES
  // =========================================================
  
  // Abrir modal para configurar gateway
  const abrirConfigurar = (gwId) => {
    const isConfigurado = gatewayConfig?.[gwId]?.configurado;
    setModalGateway(gwId);
    setModalToken('');
    setModalClientSecret('');
    setShowToken(false);
    setShowSecret(false);
    setModalMode(isConfigurado ? 'edit' : 'new');
    setModalOpen(true);
  };

  // Salvar token no modal
  const salvarToken = async () => {
    const token = modalToken.trim();
    const secret = modalClientSecret.trim();
    
    // Validação para Sync Pay (exige 2 campos)
    if (modalGateway === 'syncpay') {
      if (!token || token.length < 10 || !secret || secret.length < 10) {
        return Swal.fire({
          title: 'Credenciais inválidas',
          text: 'O Client ID e o Client Secret devem ser preenchidos corretamente.',
          icon: 'warning',
          background: '#0d0b14',
          color: '#e2e8f0',
          confirmButtonColor: '#10b981'
        });
      }
    } else {
      // Validação básica de tamanho para outras gateways
      if (!token || token.length < 20) {
        return Swal.fire({
          title: 'Token inválido',
          text: 'O token deve ter pelo menos 20 caracteres.',
          icon: 'warning',
          background: '#0d0b14',
          color: '#e2e8f0',
          confirmButtonColor: '#10b981'
        });
      }

      // Validação específica por gateway
      if (modalGateway === 'wiinpay' && !token.startsWith('eyJ')) {
        return Swal.fire({
          title: 'API Key WiinPay inválida',
          text: 'A API Key da WiinPay deve ser um token JWT (começa com "eyJ..."). Verifique se copiou o token completo.',
          icon: 'error',
          background: '#0d0b14',
          color: '#e2e8f0',
          confirmButtonColor: '#10b981'
        });
      }
    }

    setSaving(true);
    try {
      if (modalGateway === 'pushinpay') {
        if (modalMode === 'edit') {
          await integrationService.updatePushinToken(selectedBot.id, token);
        } else {
          await integrationService.savePushinToken(selectedBot.id, token);
        }
      } else if (modalGateway === 'wiinpay') {
        if (modalMode === 'edit') {
          await integrationService.updateWiinpayToken(selectedBot.id, token);
        } else {
          await integrationService.saveWiinpayToken(selectedBot.id, token);
        }
      } else if (modalGateway === 'syncpay') {
        if (modalMode === 'edit') {
          await integrationService.updateSyncPayToken(selectedBot.id, token, secret);
        } else {
          await integrationService.saveSyncPayToken(selectedBot.id, token, secret);
        }
      }

      Swal.fire({
        title: 'Salvo!',
        text: `${GATEWAYS_INFO[modalGateway].nome} ${modalMode === 'edit' ? 'atualizada' : 'configurada'} com sucesso!`,
        icon: 'success',
        background: '#0d0b14',
        color: '#e2e8f0',
        confirmButtonColor: '#10b981'
      });

      setModalOpen(false);
      setModalToken('');
      setModalClientSecret('');
      await carregarConfig();
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao salvar. Verifique as credenciais e tente novamente.',
        icon: 'error',
        background: '#0d0b14',
        color: '#e2e8f0'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ativar / Pausar gateway
  const toggleGateway = async (gwId, ativar) => {
    const gwNome = GATEWAYS_INFO[gwId].nome;
    
    if (ativar && !gatewayConfig?.[gwId]?.configurado) {
      return Swal.fire({
        title: 'Configure primeiro',
        text: `Você precisa configurar as credenciais da ${gwNome} antes de ativar.`,
        icon: 'info',
        background: '#0d0b14',
        color: '#e2e8f0',
        confirmButtonColor: '#10b981'
      });
    }

    const confirmResult = await Swal.fire({
      title: ativar ? `Ativar ${gwNome}?` : `Pausar ${gwNome}?`,
      text: ativar 
        ? `A ${gwNome} será ativada para processar pagamentos.`
        : `A ${gwNome} será pausada. Pagamentos não serão processados por ela.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: ativar ? '#10b981' : '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: ativar ? 'Sim, Ativar' : 'Sim, Pausar',
      cancelButtonText: 'Cancelar',
      background: '#0d0b14',
      color: '#e2e8f0'
    });

    if (!confirmResult.isConfirmed) return;

    setSaving(true);
    try {
      const payload = {};
      if (gwId === 'pushinpay') payload.pushinpay_ativo = ativar;
      if (gwId === 'wiinpay') payload.wiinpay_ativo = ativar;
      if (gwId === 'syncpay') payload.syncpay_ativo = ativar;
      
      await integrationService.updateGatewayConfig(selectedBot.id, payload);
      await carregarConfig();

      Swal.fire({
        title: ativar ? 'Ativada!' : 'Pausada!',
        text: `${gwNome} foi ${ativar ? 'ativada' : 'pausada'} com sucesso.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#0d0b14',
        color: '#e2e8f0'
      });
    } catch (error) {
      Swal.fire({ title: 'Erro', text: error.message || 'Falha na operação.', icon: 'error', background: '#0d0b14', color: '#e2e8f0' });
    } finally {
      setSaving(false);
    }
  };

  // Abrir modal de contingência
  const abrirContingencia = () => {
    setTempPrincipal(gatewayConfig?.gateway_principal || 'pushinpay');
    setTempFallback(gatewayConfig?.gateway_fallback || '');
    setContingenciaOpen(true);
  };

  // Salvar contingência
  const salvarContingencia = async () => {
    if (tempPrincipal === tempFallback) {
      return Swal.fire({
        title: 'Configuração inválida',
        text: 'A gateway principal e a de contingência não podem ser a mesma.',
        icon: 'warning',
        background: '#0d0b14',
        color: '#e2e8f0'
      });
    }

    setSaving(true);
    try {
      await integrationService.updateGatewayConfig(selectedBot.id, {
        gateway_principal: tempPrincipal,
        gateway_fallback: tempFallback || null
      });

      await carregarConfig();
      setContingenciaOpen(false);
      
      Swal.fire({
        title: 'Contingência Salva!',
        text: 'Ordem de prioridade das gateways atualizada.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#0d0b14',
        color: '#e2e8f0'
      });
    } catch (error) {
      Swal.fire({ title: 'Erro', text: 'Falha ao salvar contingência.', icon: 'error', background: '#0d0b14', color: '#e2e8f0' });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // 🎨 RENDER: ESTADO SEM BOT
  // =========================================================
  if (!selectedBot) {
    return (
      <div className="gw-container">
        <div className="gw-no-bot">
          <AlertCircle size={52} />
          <h2>Nenhum Bot Selecionado</h2>
          <p>Selecione um bot no menu superior para configurar os pagamentos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gw-container">
        <div className="gw-loading">
          <div className="gw-spinner" />
          <p>Carregando gateways...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🎨 RENDER: CARD DE GATEWAY
  // =========================================================
  const renderGatewayCard = (gwId) => {
    const info = GATEWAYS_INFO[gwId];
    const config = gatewayConfig?.[gwId];
    const isAtivo = config?.ativo || false;
    const isConfigurado = config?.configurado || false;
    const isPrincipal = gatewayConfig?.gateway_principal === gwId;
    const isFallback = gatewayConfig?.gateway_fallback === gwId;

    return (
      <div className={`gw-card ${isAtivo ? 'gw-card--ativo' : ''} ${!info.disponivel ? 'gw-card--breve' : ''}`} key={gwId}>
        {/* Header do card */}
        <div className="gw-card__header">
          <div className="gw-card__icon" style={{ background: info.corGradient }}>
            <img src={info.logo} alt={info.nome} className="gw-card__logo" />
          </div>
          <div className="gw-card__info">
            <h3 className="gw-card__nome">{info.nome}</h3>
            <p className="gw-card__desc">{info.descricao}</p>
          </div>
          <div className="gw-card__badges">
            {!info.disponivel ? (
              <span className="gw-badge gw-badge--breve">EM BREVE</span>
            ) : isAtivo ? (
              <span className="gw-badge gw-badge--ativo"><CheckCircle size={12} /> ATIVO</span>
            ) : isConfigurado ? (
              <span className="gw-badge gw-badge--inativo"><XCircle size={12} /> INATIVO</span>
            ) : (
              <span className="gw-badge gw-badge--nao-config">NÃO CONFIGURADO</span>
            )}
            {isPrincipal && isAtivo && (
              <span className="gw-badge gw-badge--principal"><Star size={11} /> PRINCIPAL</span>
            )}
            {isFallback && isAtivo && (
              <span className="gw-badge gw-badge--fallback"><Shield size={11} /> BACKUP</span>
            )}
          </div>
        </div>

        {/* Token mask */}
        {isConfigurado && (
          <div className="gw-card__token-info">
            <ShieldCheck size={14} />
            <span>Credencial: {config.token_mask || '••••••••'}</span>
          </div>
        )}

        {/* Ações */}
        {info.disponivel && (
          <div className="gw-card__actions">
            {/* Botão Configurar */}
            <button 
              className="gw-btn gw-btn--config"
              onClick={() => abrirConfigurar(gwId)}
            >
              {isConfigurado ? <><Edit3 size={16} /> Editar Acesso</> : <><Settings size={16} /> Configurar</>}
            </button>

            {/* Botão Taxa (info) */}
            <div className="gw-card__taxa">
              <CreditCard size={14} />
              <span>{info.taxaInfo}</span>
            </div>

            {/* Linha inferior: Ativar/Pausar + Link externo */}
            <div className="gw-card__bottom-row">
              {isAtivo ? (
                <button 
                  className="gw-btn gw-btn--pausar"
                  onClick={() => toggleGateway(gwId, false)}
                  disabled={saving}
                >
                  <PowerOff size={15} /> Pausar
                </button>
              ) : (
                <button 
                  className="gw-btn gw-btn--ativar"
                  onClick={() => toggleGateway(gwId, true)}
                  disabled={saving || !isConfigurado}
                >
                  <Power size={15} /> Ativar
                </button>
              )}
              <a href={info.site} target="_blank" rel="noopener noreferrer" className="gw-btn gw-btn--link">
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        )}

        {/* Gateway indisponível */}
        {!info.disponivel && (
          <div className="gw-card__coming-soon">
            <p>Integração em desenvolvimento. Em breve disponível.</p>
          </div>
        )}
      </div>
    );
  };

  // =========================================================
  // 🎨 RENDER PRINCIPAL
  // =========================================================
  return (
    <div className="gw-container">
      {/* Header */}
      <div className="gw-header">
        <div className="gw-header__text">
          <h1>Gateways de Pagamento</h1>
          <p>
            Configurando para: <strong>{selectedBot.nome}</strong>
          </p>
        </div>
        <div className="gw-header__actions">
          <button className="gw-btn gw-btn--contingencia" onClick={abrirContingencia}>
            <ArrowUpDown size={17} /> Contingência
          </button>
          <button className="gw-btn gw-btn--refresh" onClick={carregarConfig}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Contadores */}
      <div className="gw-counters">
        <div className="gw-counter">
          <span className="gw-counter__label">GATEWAYS ATIVOS</span>
          <div className="gw-counter__value">
            <span>{contadores.ativos}</span>
            {contadores.ativos > 0 && <span className="gw-counter__dot gw-counter__dot--green" />}
          </div>
        </div>
        <div className="gw-counter">
          <span className="gw-counter__label">CONFIGURADOS</span>
          <div className="gw-counter__value">{contadores.configurados}</div>
        </div>
        <div className="gw-counter">
          <span className="gw-counter__label">DISPONÍVEIS NA PLATAFORMA</span>
          <div className="gw-counter__value gw-counter__value--accent">{contadores.disponiveis}</div>
        </div>
      </div>

      {/* Aviso de contingência ativa */}
      {gatewayConfig?.gateway_fallback && contadores.ativos >= 2 && (
        <div className="gw-contingencia-badge">
          <Zap size={16} />
          <span>
            <strong>Contingência ativa:</strong> {GATEWAYS_INFO[gatewayConfig.gateway_principal]?.nome} → {GATEWAYS_INFO[gatewayConfig.gateway_fallback]?.nome}
          </span>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="gw-grid">
        {Object.keys(GATEWAYS_INFO).map(gwId => renderGatewayCard(gwId))}
      </div>

      {/* =========================================================
          MODAL: Configurar / Editar Token
          ========================================================= */}
      {modalOpen && modalGateway && (
        <div className="gw-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="gw-modal" onClick={e => e.stopPropagation()}>
            <button className="gw-modal__close" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="gw-modal__header">
              <div className="gw-modal__icon" style={{ background: GATEWAYS_INFO[modalGateway].corGradient }}>
                <img src={GATEWAYS_INFO[modalGateway].logo} alt={GATEWAYS_INFO[modalGateway].nome} className="gw-card__logo" />
              </div>
              <div>
                <h2>{modalMode === 'edit' ? 'Editar' : 'Configurar'} {GATEWAYS_INFO[modalGateway].nome}</h2>
                <p>Bot: {selectedBot.nome}</p>
              </div>
            </div>

            <div className="gw-modal__body">
              {/* CAMPO 1 (Para todos) */}
              <label className="gw-modal__label">
                {GATEWAYS_INFO[modalGateway].tokenLabel}
              </label>
              <div className="gw-modal__input-wrap" style={{ marginBottom: modalGateway === 'syncpay' ? '15px' : '0' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  className="gw-modal__input"
                  placeholder={GATEWAYS_INFO[modalGateway].tokenPlaceholder}
                  value={modalToken}
                  onChange={e => setModalToken(e.target.value)}
                  autoFocus
                />
                <button className="gw-modal__eye" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* CAMPO 2 (Somente Sync Pay) */}
              {modalGateway === 'syncpay' && (
                <>
                  <label className="gw-modal__label">
                    {GATEWAYS_INFO[modalGateway].tokenLabel2}
                  </label>
                  <div className="gw-modal__input-wrap">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      className="gw-modal__input"
                      placeholder={GATEWAYS_INFO[modalGateway].tokenPlaceholder2}
                      value={modalClientSecret}
                      onChange={e => setModalClientSecret(e.target.value)}
                    />
                    <button className="gw-modal__eye" onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </>
              )}

              {modalMode === 'edit' && gatewayConfig?.[modalGateway]?.token_mask && (
                <div className="gw-modal__current-token" style={{ marginTop: '15px' }}>
                  <ShieldCheck size={14} />
                  Credencial atual: {gatewayConfig[modalGateway].token_mask}
                </div>
              )}

              <p className="gw-modal__hint" style={{ marginTop: '15px' }}>
                {modalGateway === 'pushinpay' 
                  ? 'Gere seu token em pushinpay.com.br → Painel → Configurações → API.'
                  : modalGateway === 'syncpay'
                  ? 'Gere suas chaves em syncpay.com.br → API → Cadastrar API.'
                  : 'Gere sua API Key em wiinpay.com.br → Painel → Integrações → API Key.'
                }
              </p>
            </div>

            <div className="gw-modal__footer">
              <button className="gw-btn gw-btn--cancel" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="gw-btn gw-btn--save" onClick={salvarToken} disabled={saving}>
                {saving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: Contingência de Gateway
          ========================================================= */}
      {contingenciaOpen && (
        <div className="gw-modal-overlay" onClick={() => setContingenciaOpen(false)}>
          <div className="gw-modal gw-modal--contingencia" onClick={e => e.stopPropagation()}>
            <button className="gw-modal__close" onClick={() => setContingenciaOpen(false)}>
              <X size={20} />
            </button>

            <div className="gw-modal__header">
              <div className="gw-modal__icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <ArrowUpDown size={24} color="#fff" />
              </div>
              <div>
                <h2>Contingência de Gateway</h2>
                <p>Defina a ordem de prioridade dos pagamentos</p>
              </div>
            </div>

            <div className="gw-modal__body">
              <div className="gw-contingencia-info">
                <Zap size={16} />
                <span>Se a gateway principal falhar, o sistema usará automaticamente a de backup para gerar o PIX.</span>
              </div>

              <div className="gw-contingencia-form">
                <div className="gw-contingencia-field">
                  <label><Star size={14} /> Gateway Principal</label>
                  <select 
                    value={tempPrincipal} 
                    onChange={e => setTempPrincipal(e.target.value)}
                    className="gw-select"
                  >
                    <option value="pushinpay">PushinPay</option>
                    <option value="wiinpay">WiinPay</option>
                    <option value="syncpay">Sync Pay</option>
                  </select>
                </div>

                <div className="gw-contingencia-arrow">
                  <ChevronDown size={24} />
                  <span>Fallback</span>
                </div>

                <div className="gw-contingencia-field">
                  <label><Shield size={14} /> Gateway de Backup</label>
                  <select 
                    value={tempFallback} 
                    onChange={e => setTempFallback(e.target.value)}
                    className="gw-select"
                  >
                    <option value="">Nenhuma (sem backup)</option>
                    <option value="pushinpay">PushinPay</option>
                    <option value="wiinpay">WiinPay</option>
                    <option value="syncpay">Sync Pay</option>
                  </select>
                </div>
              </div>

              {tempFallback && tempPrincipal !== tempFallback && (
                <div className="gw-contingencia-preview">
                  <span className="gw-contingencia-preview__item gw-contingencia-preview__item--principal">
                    1° {GATEWAYS_INFO[tempPrincipal]?.nome}
                  </span>
                  <span className="gw-contingencia-preview__arrow">→</span>
                  <span className="gw-contingencia-preview__item gw-contingencia-preview__item--fallback">
                    2° {GATEWAYS_INFO[tempFallback]?.nome}
                  </span>
                </div>
              )}
            </div>

            <div className="gw-modal__footer">
              <button className="gw-btn gw-btn--cancel" onClick={() => setContingenciaOpen(false)}>
                Cancelar
              </button>
              <button className="gw-btn gw-btn--save" onClick={salvarContingencia} disabled={saving}>
                {saving ? 'Salvando...' : <><Save size={16} /> Salvar Contingência</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}