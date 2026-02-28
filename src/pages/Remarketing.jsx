import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { useProgress } from '../context/ProgressContext';
import { remarketingService, planService, testSendService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, RotateCcw, Edit, Play, Trash2, ChevronLeft, ChevronRight, Mic } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { RichInput } from '../components/RichInput';
import { MediaUploader } from '../components/MediaUploader'; // 🔥 NOVO COMPONENTE DE UPLOAD
import Swal from 'sweetalert2';
import './Remarketing.css';

export function Remarketing() {
  const { selectedBot } = useBot();
  const [mode, setMode] = useState('menu'); // 'menu' | 'custom' | 'scheduled' | 'history'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 📅 Estados da Campanha Periódica
  const [schedStep, setSchedStep] = useState(1);
  const [schedData, setSchedData] = useState({
    target: 'todos',
    days: 7,
    time: '10:00',
    sameContent: true,
    message: '',
    media_url: '',
    plano_id: null,
    promo_price: '',
  });
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  
  // 🔥 PROGRESSO GLOBAL (via ProgressContext - persiste entre páginas)
  const { startProgressMonitoring, progressData, activeProgress, closeProgressWidget } = useProgress();
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    target: 'todos', 
    mensagem: '',
    
    // 🔥 NOVOS CAMPOS PARA COMBO ÁUDIO
    audio_url: '', 
    audio_delay_seconds: 3,

    media_url: '',
    incluir_oferta: false,
    plano_oferta_id: '',
    price_mode: 'original',
    custom_price: '',
    expiration_mode: 'none',
    expiration_value: ''
  });


  // 🔊 HELPER: Detecta se a URL é um áudio OGG
  const isAudioUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(ogg|mp3|wav)$/i);
  };

  useEffect(() => {
    if (selectedBot) {
      setMode('menu');
      setStep(1);
      setSchedStep(1);
      setHistory([]);
      setCurrentPage(1);
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
      carregarHistorico();
    }
  }, [selectedBot]);

  // Recarrega histórico quando muda de página
  useEffect(() => {
    if (selectedBot) carregarHistorico();
  }, [currentPage]);

  // (Polling de progresso agora é gerenciado pelo ProgressContext global)

  // 🔥 Detecta quando campanha concluiu (via contexto global) para mostrar resultado
  useEffect(() => {
    if (progressData && progressData.is_complete) {
      Swal.fire({
        title: 'Campanha Concluída!',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>✅ Enviados:</strong> ${progressData.sent_success}</p>
            <p><strong>❌ Bloqueados:</strong> ${progressData.blocked_count}</p>
            <p><strong>👥 Total:</strong> ${progressData.total_leads}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#151515',
        color: '#fff'
      });

      setTimeout(() => {
        closeProgressWidget();
        carregarHistorico();
      }, 1500);
    }
  }, [progressData?.is_complete]);

  const carregarHistorico = async () => {
    if (!selectedBot) return;
    
    try {
      const response = await remarketingService.getHistory(selectedBot.id, currentPage, perPage);
      setHistory(Array.isArray(response.data) ? response.data : []);
      setTotalCount(response.total || 0);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistory([]);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleDelete = async (historyId) => {
    const result = await Swal.fire({
      title: 'Deletar campanha?',
      text: "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await remarketingService.deleteHistory(historyId);
        Swal.fire({
          title: 'Deletado!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#151515',
          color: '#fff'
        });
        carregarHistorico();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        Swal.fire({
          title: 'Erro',
          text: 'Falha ao deletar campanha.',
          icon: 'error',
          background: '#151515',
          color: '#fff'
        });
      }
    }
  };

  const handleReusar = (item) => {
    try {
      const config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
      
      // 🔥 CORREÇÃO: Normaliza custom_price ao reutilizar (9.9 → "9.90", vírgula → ponto)
      let normalizedPrice = '';
      if (config.custom_price !== null && config.custom_price !== undefined && config.custom_price !== '') {
        const cleaned = String(config.custom_price).replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
          normalizedPrice = parsed.toFixed(2); // Garante "9.90" ao invés de "9.9"
        }
      }
      
      setFormData({
        target: item.target || 'todos',
        mensagem: config.mensagem || '',
        
        // 🔥 Reuso de áudio
        audio_url: config.audio_url || '',
        audio_delay_seconds: config.audio_delay_seconds || 3,

        media_url: config.media_url || '',
        incluir_oferta: config.incluir_oferta || false,
        plano_oferta_id: config.plano_oferta_id || '',
        price_mode: config.price_mode || 'original',
        custom_price: normalizedPrice,  // 🔥 Agora sempre formatado corretamente
        expiration_mode: config.expiration_mode || 'none',
        expiration_value: config.expiration_value || ''
      });
      setMode("custom"); setStep(1);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Erro ao reusar campanha:", error);
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao carregar configuração da campanha.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    }
  };

  const handleTestarIndividual = async (item) => {
    const { value: telegramId } = await Swal.fire({
      title: 'Testar Envio Individual',
      input: 'text',
      inputLabel: 'Digite o Telegram ID para receber o teste:',
      inputPlaceholder: 'Ex: 123456789',
      showCancelButton: true,
      confirmButtonText: 'Enviar Teste',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff',
      inputValidator: (value) => {
        if (!value) return 'Por favor, digite um Telegram ID';
        if (!/^\d+$/.test(value)) return 'Telegram ID deve conter apenas números';
      }
    });

    if (telegramId) {
      try {
        setLoading(true);
        
        Swal.fire({
          title: 'Enviando...',
          text: 'Aguarde enquanto o teste é enviado.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await remarketingService.sendIndividual(
          selectedBot.id, 
          telegramId, 
          item.id
        );
        
        Swal.fire({
          title: 'Teste Enviado!',
          text: `Mensagem enviada para o ID ${telegramId}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#151515',
          color: '#fff'
        });
      } catch (error) {
        console.error('Erro ao enviar teste:', error);
        Swal.fire({
          title: 'Erro',
          text: error.response?.data?.detail || 'Falha ao enviar teste.',
          icon: 'error',
          background: '#151515',
          color: '#fff'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 🧪 ENVIAR TESTE COMPLETO (com mídia, botões, oferta)
  const handleEnviarTeste = async () => {
    if (!selectedBot) return;
    if (!formData.mensagem?.trim()) {
      Swal.fire({title:'Aviso', text:'Preencha a mensagem antes de testar.', icon:'warning', background:'#151515', color:'#fff'});
      return;
    }
    try {
      Swal.fire({ title: '🧪 Enviando teste...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#151515', color: '#fff' });
      
      const mediaUrl = formData.media_url || null;
      let mediaType = null;
      if (mediaUrl) {
        const lower = mediaUrl.toLowerCase();
        if (lower.match(/\.(mp4|mov)/)) mediaType = 'video';
        else if (lower.match(/\.(ogg|mp3|wav)/)) mediaType = 'audio';
        else mediaType = 'photo';
      }
      
      await testSendService.send(selectedBot.id, {
        message: formData.mensagem,
        media_url: mediaUrl,
        media_type: mediaType,
        source: 'remarketing',
        incluir_oferta: formData.incluir_oferta || false,
        plano_oferta_id: formData.plano_oferta_id ? parseInt(formData.plano_oferta_id) : null,
        preco_custom: formData.preco_custom ? parseFloat(formData.preco_custom) : null,
        price_mode: formData.price_mode || 'original',
      });
      
      Swal.fire({ title: '✅ Teste enviado!', text: 'Verifique o Telegram do admin do bot.', icon: 'success', timer: 2500, showConfirmButton: false, background: '#151515', color: '#fff' });
    } catch (error) {
      Swal.fire({ title: 'Erro', text: error.response?.data?.detail || 'Falha ao enviar teste.', icon: 'error', background: '#151515', color: '#fff' });
    }
  };

  const handleEnviar = async () => {
    // Validação
    const hasContent = formData.mensagem.trim() || formData.audio_url || formData.media_url;
    
    if (!hasContent) {
      Swal.fire({
        title: 'Atenção',
        text: 'Sua campanha precisa ter ao menos uma mensagem, um áudio ou uma mídia.',
        icon: 'warning',
        background: '#151515',
        color: '#fff'
      });
      return;
    }

    if (formData.incluir_oferta && !formData.plano_oferta_id) {
      Swal.fire({
        title: 'Atenção',
        text: 'Selecione um plano para a oferta.',
        icon: 'warning',
        background: '#151515',
        color: '#fff'
      });
      return;
    }

    // 🔥 CORREÇÃO: Validar preço personalizado antes de enviar
    if (formData.incluir_oferta && formData.price_mode === 'custom') {
      const cleaned = String(formData.custom_price).replace(',', '.');
      const parsed = parseFloat(cleaned);
      if (!formData.custom_price || isNaN(parsed) || parsed <= 0) {
        Swal.fire({
          title: 'Atenção',
          text: 'Informe um preço personalizado válido (maior que zero).',
          icon: 'warning',
          background: '#151515',
          color: '#fff'
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      const result = await remarketingService.send(selectedBot.id, formData, false, null);
      
      if (result.campaign_id) {
        startProgressMonitoring(result.campaign_id);
        
        setFormData({
          target: 'todos',
          mensagem: '',
          audio_url: '',
          audio_delay_seconds: 3,
          media_url: '',
          incluir_oferta: false,
          plano_oferta_id: '',
          price_mode: 'original',
          custom_price: '',
          expiration_mode: 'none',
          expiration_value: ''
        });
        setMode("menu"); setStep(1);
      } else {
        Swal.fire({
          title: 'Campanha Iniciada!',
          text: 'A campanha foi iniciada com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#151515',
          color: '#fff'
        });
        carregarHistorico();
      }
    } catch (error) {
      console.error("Erro ao enviar campanha:", error);
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.detail || 'Falha ao enviar campanha.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const targetOptions = [
    { id: 'todos', icon: '👥', title: 'Todos', desc: 'Envia para todos os contatos' },
    { id: 'topo', icon: '🎯', title: 'TOPO - Leads Frios', desc: 'Usuários que só deram /start' },
    { id: 'meio', icon: '🔥', title: 'MEIO - Leads Quentes', desc: 'Usuários que geraram PIX' },
    { id: 'fundo', icon: '✅', title: 'FUNDO - Clientes', desc: 'Usuários que pagaram' },
    { id: 'expirado', icon: '⏰', title: 'Expirados', desc: 'PIX venceu sem pagamento' }
  ];

  // (Widget de progresso agora é renderizado globalmente no MainLayout via ProgressWidget)

  // ============================================================
  // RENDER - HISTÓRICO
  // ============================================================
  if (mode === 'history') {
    return (
      <div className="remarketing-container">
        <div className="wizard-container">
          <h2 className="wizard-title">
            <History size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Histórico de Campanhas
          </h2>

          <Button 
            onClick={() => setMode('menu')} 
            style={{ marginBottom: '20px' }}
          >
            ← Voltar ao Menu
          </Button>

          <div className="history-list">
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                Nenhuma campanha enviada ainda.
              </p>
            ) : (
              history.map(item => {
                let config = {};
                try {
                  config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
                } catch (e) {
                  console.error('Erro ao parsear config:', e);
                }

                const targetLabel = targetOptions.find(t => t.id === item.target)?.title || item.target || 'Desconhecido';
                
                let dataFormatada = 'Data desconhecida';
                if (item.data) {
                    try {
                        // 🔥 FIX FUSO: Backend salva em horário de Brasília sem timezone info
                        let dateStr = String(item.data);
                        if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/\-\d{2}:\d{2}$/)) {
                            dateStr = dateStr + '-03:00';
                        }
                        const dateObj = new Date(dateStr);
                        if (!isNaN(dateObj.getTime())) {
                            dataFormatada = dateObj.toLocaleString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });
                        }
                    } catch (e) { console.error("Erro data:", item.data); }
                }

                const msgPreview = config.msg || config.mensagem || "Sem texto";

                return (
                  <div key={item.id} className="history-item">
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {targetLabel}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {dataFormatada}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                        ✅ {item.sent_success || 0} enviados • 
                        ❌ {item.blocked_count || 0} bloqueados
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '3px', fontStyle:'italic' }}>
                          "{msgPreview.substring(0, 40)}..."
                      </div>
                    </div>
                    <div className="history-actions">
                      <button 
                        className="btn-small primary" 
                        onClick={() => handleReusar(item)}
                        title="Reutilizar esta campanha"
                      >
                        <RotateCcw size={14} /> Reusar
                      </button>
                      <button 
                        className="btn-small primary" 
                        onClick={() => handleTestarIndividual(item)}
                        title="Testar envio individual"
                      >
                        <Play size={14} /> Testar
                      </button>
                      <button 
                        className="btn-small danger" 
                        onClick={() => handleDelete(item.id)}
                        title="Deletar esta campanha"
                      >
                        <Trash2 size={14} /> Deletar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls-remarketing">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Anterior
              </Button>
              
              <div className="page-info">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
              >
                Próxima <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - MENU PRINCIPAL
  // ============================================================
  if (mode === 'menu') {
    return (
      <div className="remarketing-container">
        <div className="wizard-container">
          <h2 className="wizard-title">
            <Send size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Remarketing
          </h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>
            Escolha o tipo de campanha que deseja criar
          </p>

          <div className="remarketing-menu-grid">
            {/* CAMPANHA PERSONALIZADA */}
            <div
              className="option-card"
              onClick={() => { setMode('custom'); setStep(1); }}
              style={{ padding: '30px 20px', cursor: 'pointer' }}
            >
              <div className="option-icon">🎯</div>
              <h3 style={{ margin: '10px 0 8px', fontSize: '1.1rem' }}>Campanha Personalizada</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Disparo único e imediato. Configure público, mensagem, mídia e oferta para enviar agora.
              </p>
            </div>

            {/* CAMPANHA PERIÓDICA */}
            <div
              className="option-card"
              onClick={() => { setMode('scheduled'); setSchedStep(1); }}
              style={{ padding: '30px 20px', cursor: 'pointer' }}
            >
              <div className="option-icon">📅</div>
              <h3 style={{ margin: '10px 0 8px', fontSize: '1.1rem' }}>Campanha Periódica</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Agendamento automático. Defina dias, horário e conteúdo para disparos recorrentes.
              </p>
            </div>
          </div>

          {/* VER HISTÓRICO */}
          <Button
            onClick={() => setMode('history')}
            variant="outline"
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            <History size={18} /> Ver Histórico de Campanhas
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - CAMPANHA PERIÓDICA (4 PASSOS)
  // ============================================================
  if (mode === 'scheduled') {
    const schedTargetOptions = [
      { id: 'todos', icon: '👥', title: 'Todos', desc: 'Toda a base de leads' },
      { id: 'nao_compradores', icon: '🎯', title: 'Não compradores', desc: 'Leads que nunca compraram' },
      { id: 'topo', icon: '🔵', title: 'Topo de Funil', desc: 'Novos leads' },
      { id: 'meio', icon: '🟡', title: 'Meio de Funil', desc: 'Leads engajados' },
      { id: 'fundo', icon: '🟢', title: 'Fundo de Funil', desc: 'Quase compraram' },
      { id: 'expirados', icon: '🔴', title: 'Expirados', desc: 'Assinatura vencida' },
    ];

    const handleSchedSubmit = async () => {
      if (!selectedBot) return;
      setLoading(true);
      try {
        const payload = {
          bot_id: selectedBot.id,
          target: schedData.target,
          schedule_days: parseInt(schedData.days) || 7,
          schedule_time: schedData.time || '10:00',
          use_same_content: schedData.sameContent,
          message: schedData.message,
          media_url: schedData.media_url,
          plano_id: schedData.plano_id ? parseInt(schedData.plano_id) : null,
          promo_price: schedData.promo_price ? parseFloat(String(schedData.promo_price).replace(',', '.')) : null,
        };

        const res = await remarketingService.createScheduled(payload);
        
        Swal.fire({
          title: '📅 Campanha Agendada!',
          html: `<p>Sua campanha periódica foi criada com sucesso.</p><p><strong>${schedData.days} dias</strong> de disparos às <strong>${schedData.time}</strong></p>`,
          icon: 'success',
          background: '#151515',
          color: '#fff',
          confirmButtonColor: '#c333ff',
        });
        setMode('menu');
      } catch (err) {
        Swal.fire({ title: 'Erro', text: err?.response?.data?.detail || 'Falha ao agendar.', icon: 'error', background: '#151515', color: '#fff' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="remarketing-container">
        <div className="wizard-container">
          <h2 className="wizard-title">
            <Clock size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Campanha Periódica
          </h2>

          <div className="wizard-step-indicator">
            Passo {schedStep} de 4
          </div>

          {/* PASSO 1: PÚBLICO ALVO */}
          {schedStep === 1 && (
            <>
              <h3 style={{ marginBottom: '20px' }}>Quem vai receber os disparos?</h3>
              <div className="wizard-options-grid">
                {schedTargetOptions.map(opt => (
                  <div
                    key={opt.id}
                    className={`option-card ${schedData.target === opt.id ? 'selected' : ''}`}
                    onClick={() => setSchedData({...schedData, target: opt.id})}
                  >
                    <div className="option-icon">{opt.icon}</div>
                    <h4>{opt.title}</h4>
                    <small style={{color: '#888'}}>{opt.desc}</small>
                  </div>
                ))}
              </div>
              <div className="wizard-actions">
                <button className="btn-back" onClick={() => setMode('menu')}>
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button className="btn-next" onClick={() => setSchedStep(2)}>
                  Próximo <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* PASSO 2: CONFIGURAÇÃO DO AGENDAMENTO */}
          {schedStep === 2 && (
            <>
              <h3 style={{ marginBottom: '20px' }}>Configure o agendamento</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>📆 Quantidade de dias</label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    max="365"
                    value={schedData.days}
                    onChange={e => setSchedData({...schedData, days: e.target.value})}
                    placeholder="Ex: 7"
                  />
                  <small style={{color:'#666', marginTop:'4px', display:'block'}}>
                    A campanha será disparada uma vez por dia durante {schedData.days || 0} dia(s)
                  </small>
                </div>
                <div className="form-group">
                  <label>⏰ Horário de disparo (Brasília)</label>
                  <input
                    type="time"
                    className="input-field"
                    value={schedData.time}
                    onChange={e => setSchedData({...schedData, time: e.target.value})}
                  />
                  <small style={{color:'#666', marginTop:'4px', display:'block'}}>
                    O disparo acontecerá neste horário todos os dias
                  </small>
                </div>
              </div>

              <div style={{ background: '#151515', padding: '15px', borderRadius: '10px', border: '1px solid #333', marginBottom: '20px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={schedData.sameContent}
                    onChange={e => setSchedData({...schedData, sameContent: e.target.checked})}
                  />
                  Usar o mesmo conteúdo para todos os dias
                </label>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '8px 0 0 30px' }}>
                  {schedData.sameContent 
                    ? '✅ A mesma mensagem, mídia e oferta será enviada todos os dias.'
                    : '⚠️ Conteúdo diferente por dia será suportado em breve. Por enquanto, use o mesmo conteúdo.'}
                </p>
              </div>

              <div className="wizard-actions">
                <button className="btn-back" onClick={() => setSchedStep(1)}>
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button className="btn-next" onClick={() => setSchedStep(3)}>
                  Próximo <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* PASSO 3: CONTEÚDO DA CAMPANHA */}
          {schedStep === 3 && (
            <>
              <h3 style={{ marginBottom: '20px' }}>Conteúdo da campanha</h3>

              <div className="form-group">
                <label>💬 Mensagem</label>
                <RichInput
                  value={schedData.message}
                  onChange={val => setSchedData({...schedData, message: val})}
                  placeholder="Digite a mensagem que será enviada..."
                  maxLength={4096}
                />
              </div>

              <div className="form-group">
                <label>🖼️ Mídia (URL da imagem/vídeo)</label>
                <MediaUploader
                  botId={selectedBot?.id}
                  value={schedData.media_url}
                  onChange={url => setSchedData({...schedData, media_url: url})}
                />
              </div>

              <div className="offer-section">
                <label className="checkbox-label" style={{ marginBottom: '15px' }}>
                  <input
                    type="checkbox"
                    checked={!!schedData.plano_id}
                    onChange={e => {
                      if (!e.target.checked) setSchedData({...schedData, plano_id: null, promo_price: ''});
                    }}
                  />
                  🏷️ Incluir oferta com plano
                </label>

                {schedData.plano_id !== null && (
                  <div className="offer-details-box">
                    <div className="form-group">
                      <label>Plano</label>
                      <select
                        className="input-field"
                        value={schedData.plano_id || ''}
                        onChange={e => setSchedData({...schedData, plano_id: e.target.value})}
                      >
                        <option value="">Selecione um plano</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} — R$ {(p.preco / 100).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Preço promocional (R$)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Ex: 9.90"
                        value={schedData.promo_price}
                        onChange={e => setSchedData({...schedData, promo_price: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-actions" style={{ marginTop: '25px' }}>
                <button className="btn-back" onClick={() => setSchedStep(2)}>
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button className="btn-next" onClick={() => setSchedStep(4)}>
                  Revisar <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* PASSO 4: REVISÃO E CONFIRMAÇÃO */}
          {schedStep === 4 && (
            <>
              <h3 style={{ marginBottom: '20px' }}>Revisão da Campanha Periódica</h3>

              <div className="review-box">
                <p><strong>👥 Público:</strong> {schedTargetOptions.find(o => o.id === schedData.target)?.title || schedData.target}</p>
                <p><strong>📆 Duração:</strong> {schedData.days} dia(s)</p>
                <p><strong>⏰ Horário:</strong> {schedData.time} (Brasília)</p>
                <p><strong>📝 Conteúdo:</strong> {schedData.sameContent ? 'Mesmo para todos os dias' : 'Diferente por dia'}</p>
                {schedData.plano_id && (
                  <p><strong>🏷️ Oferta:</strong> Plano #{schedData.plano_id} por R$ {schedData.promo_price || 'original'}</p>
                )}
                {schedData.message && (
                  <div className="msg-quote">
                    {schedData.message.substring(0, 200)}{schedData.message.length > 200 ? '...' : ''}
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(195,51,255,0.08)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(195,51,255,0.3)', marginBottom: '20px' }}>
                <p style={{ color: '#c333ff', margin: 0, fontSize: '0.9rem' }}>
                  📅 A campanha será disparada <strong>todos os dias às {schedData.time}</strong> durante <strong>{schedData.days} dia(s)</strong>. 
                  Leads que comprarem durante o período serão automaticamente removidos dos próximos disparos.
                </p>
              </div>

              <div className="wizard-actions">
                <button className="btn-back" onClick={() => setSchedStep(3)}>
                  <ChevronLeft size={18} /> Voltar
                </button>
                <button 
                  className="btn-next" 
                  onClick={handleSchedSubmit}
                  disabled={loading}
                >
                  {loading ? 'Agendando...' : '📅 Agendar Campanha'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - WIZARD PERSONALIZADO (STEPS 1-3)
  // ============================================================
  return (
    <div className="remarketing-container">
      <div className="wizard-container">
        
        <h2 className="wizard-title">
          <Send size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Campanha de Remarketing
        </h2>

        <div className="wizard-step-indicator">
          Passo {step} de 3
        </div>

        {/* STEP 1: PÚBLICO */}
        {step === 1 && (
          <>
            <h3 style={{ marginBottom: '20px' }}>Quem vai receber esta campanha?</h3>
            <div className="wizard-options-grid">
              {targetOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`option-card ${formData.target === opt.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, target: opt.id })}
                >
                  <div className="option-icon">{opt.icon}</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            <div className="wizard-actions">
              <button className="btn-back" onClick={() => setMode("menu")}>
                <History size={18} /> Ver Histórico
              </button>
              <button className="btn-next" onClick={() => setStep(2)}>
                Próximo <Send size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: MENSAGEM */}
        {step === 2 && (
          <>
            <h3 style={{ marginBottom: '20px' }}>Monte sua mensagem</h3>
            
            {/* 🔥 NOVO: ÁUDIO INTRODUTÓRIO */}
            <div className="form-group" style={{
                background: 'rgba(195, 51, 255, 0.03)', 
                padding: '15px', 
                borderRadius: '8px', 
                borderLeft: '3px solid #c333ff', 
                marginBottom: '20px'
            }}>
                <label style={{display:'flex', alignItems:'center', gap:'8px', color:'#c333ff'}}>
                    <Mic size={18} /> Áudio de Introdução (Voice Note)
                </label>
                
                <div style={{marginTop:'10px'}}>
                    <MediaUploader 
                        label="🎤 Upload de Áudio OGG (Chega PRIMEIRO)" 
                        value={formData.audio_url} 
                        onChange={(url) => setFormData({ ...formData, audio_url: url })} 
                    />
                </div>
                
                {formData.audio_url && (
                    <div style={{marginTop:'15px', display:'flex', gap:'15px', alignItems:'center'}}>
                        <div style={{flex: 1}}>
                            <label style={{fontSize:'0.85rem'}}>⏳ Delay após Áudio (seg)</label>
                            <input 
                                className="input-field"
                                type="number"
                                value={formData.audio_delay_seconds}
                                onChange={(e) => setFormData({...formData, audio_delay_seconds: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <div style={{flex: 3}}>
                             <p style={{fontSize:'0.8rem', color:'#888', marginTop:'22px'}}>
                                Tempo que o bot espera antes de enviar a Mensagem e a Oferta abaixo.
                             </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-group">
              <label><MessageSquare size={16} style={{ verticalAlign: 'middle' }} /> Mensagem {formData.audio_url && "(Enviada após o áudio)"}</label>
              <RichInput
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={6}
                placeholder="Digite a mensagem aqui..."
              />
            </div>

            <div className="form-group">
              <label><Image size={16} style={{ verticalAlign: 'middle' }} /> Mídia Visual (Opcional)</label>
              <MediaUploader 
                label="URL da Mídia (Foto ou Vídeo)" 
                value={formData.media_url} 
                onChange={(url) => setFormData({ ...formData, media_url: url })} 
              />
            </div>

            {/* ALERTA DE ÁUDIO NO CAMPO ERRADO (LEGADO) */}
            {isAudioUrl(formData.media_url) && !formData.audio_url && (
                <div style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    marginBottom: '15px'
                }}>
                    <p style={{color: '#eab308', fontSize: '0.85rem', margin: 0}}>
                        ⚠️ <strong>Dica:</strong> Para usar a função de Combo (Áudio + Texto), use o campo "Áudio de Introdução" no topo da página.
                    </p>
                </div>
            )}
            
            {/* ALERTA COMBO ATIVO */}
            {formData.audio_url && (formData.mensagem || formData.media_url) && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    marginBottom: '15px'
                }}>
                    <p style={{color: '#059669', fontSize: '0.85rem', margin: 0}}>
                        🚀 <strong>Combo Ativado!</strong> Áudio chega primeiro ➔ espera {formData.audio_delay_seconds}s ➔ Mensagem/Oferta chega depois.
                    </p>
                </div>
            )}

            {/* OFERTA ESPECIAL */}
            <div className="offer-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.incluir_oferta}
                  onChange={(e) => setFormData({ ...formData, incluir_oferta: e.target.checked })}
                />
                <Tag size={20} />
                Incluir Oferta Especial
              </label>

              {formData.incluir_oferta && (
                <div className="offer-details-box">
                  <div className="form-group">
                    <label>Plano da Oferta</label>
                    <select
                      className="input-field"
                      value={formData.plano_oferta_id}
                      onChange={(e) => setFormData({ ...formData, plano_oferta_id: e.target.value })}
                    >
                      <option value="">Selecione um plano</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nome_exibicao} - R$ {p.preco_atual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preço</label>
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={formData.price_mode === 'original' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, price_mode: 'original' })}
                      >
                        Original
                      </button>
                      <button
                        type="button"
                        className={formData.price_mode === 'custom' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, price_mode: 'custom' })}
                      >
                        Personalizado
                      </button>
                    </div>
                    {formData.price_mode === 'custom' && (
                      <input
                        className="input-field"
                        type="text"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="Ex: 9.90"
                        value={formData.custom_price}
                        onChange={(e) => {
                          // 🔥 CORREÇÃO: Aceita vírgula e ponto, permite apenas números decimais
                          let val = e.target.value;
                          // Permite apenas números, ponto e vírgula
                          val = val.replace(/[^0-9.,]/g, '');
                          // Substitui vírgula por ponto para normalizar
                          val = val.replace(',', '.');
                          // Evita múltiplos pontos
                          const parts = val.split('.');
                          if (parts.length > 2) {
                            val = parts[0] + '.' + parts.slice(1).join('');
                          }
                          setFormData({ ...formData, custom_price: val });
                        }}
                        onBlur={(e) => {
                          // 🔥 CORREÇÃO: Ao sair do campo, formata com 2 casas decimais
                          const cleaned = String(e.target.value).replace(',', '.');
                          const parsed = parseFloat(cleaned);
                          if (!isNaN(parsed) && parsed > 0) {
                            setFormData({ ...formData, custom_price: parsed.toFixed(2) });
                          }
                        }}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label><Clock size={16} /> Expiração da Oferta</label>
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={formData.expiration_mode === 'none' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'none' })}
                      >
                        Sem Expiração
                      </button>
                      <button
                        type="button"
                        className={formData.expiration_mode === 'minutes' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'minutes' })}
                      >
                        Minutos
                      </button>
                      <button
                        type="button"
                        className={formData.expiration_mode === 'hours' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'hours' })}
                      >
                        Horas
                      </button>
                    </div>
                    {formData.expiration_mode !== 'none' && (
                      <input
                        className="input-field"
                        type="number"
                        placeholder="Quantidade"
                        value={formData.expiration_value}
                        onChange={(e) => setFormData({ ...formData, expiration_value: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button className="btn-back" onClick={() => setStep(1)}>
                Voltar
              </button>
              <button className="btn-next" onClick={() => {
                // 🔥 VALIDAÇÃO OBRIGATÓRIA DO PASSO 2
                // Verifica se tem pelo menos uma mensagem OU áudio preenchido
                const temMensagem = formData.mensagem && formData.mensagem.trim().length > 0;
                const temAudio = formData.audio_url && formData.audio_url.trim().length > 0;
                
                if (!temMensagem && !temAudio) {
                  import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Mensagem obrigatória!',
                      text: 'Defina pelo menos um texto para a mensagem ou um áudio de introdução antes de avançar.',
                      confirmButtonColor: '#c333ff'
                    });
                  });
                  return;
                }
                
                // Se oferta está ativa, plano deve estar selecionado
                if (formData.incluir_oferta && !formData.plano_oferta_id) {
                  import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Plano obrigatório!',
                      text: 'Você ativou a oferta especial mas não selecionou um plano. Escolha um plano ou desative a oferta.',
                      confirmButtonColor: '#c333ff'
                    });
                  });
                  return;
                }
                
                setStep(3);
              }}>
                Próximo
              </button>
            </div>
          </>
        )}

        {/* STEP 3: REVISÃO */}
        {step === 3 && (
          <>
            <h3 style={{ marginBottom: '20px' }}>Revisão Final</h3>
            
            <div className="review-box">
              <p><strong>Público:</strong> {targetOptions.find(o => o.id === formData.target)?.title}</p>
              
              {formData.audio_url && (
                <div style={{marginBottom:'10px', color:'#c333ff'}}>
                    <strong>🎤 Áudio + Delay ({formData.audio_delay_seconds}s)</strong>
                </div>
              )}
              
              {formData.media_url && <p><strong>Mídia:</strong> {formData.media_url}</p>}
              {formData.incluir_oferta && (
                <p><strong>Oferta:</strong> {plans.find(p => p.id === parseInt(formData.plano_oferta_id))?.nome_exibicao}</p>
              )}
              <div className="msg-quote">{formData.mensagem}</div>
            </div>

            <div className="wizard-actions">
              <button className="btn-back" onClick={() => setStep(2)}>
                Voltar
              </button>
              <div style={{display:'flex', gap:'10px'}}>
                <button 
                  className="btn-reuse"
                  onClick={handleEnviarTeste}
                  disabled={loading}
                  title="Envia tudo (mídia + texto + oferta) para o admin do bot"
                >
                  🧪 Enviar Teste
                </button>
                <button 
                  className="btn-next" 
                  onClick={handleEnviar}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Agora'}
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}