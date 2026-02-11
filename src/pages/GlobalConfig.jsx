import React, { useState, useEffect } from 'react';
import { integrationService, notificationService, superAdminService } from '../services/api';
import Swal from 'sweetalert2';
import { 
  Save, DollarSign, Bell, Shield, Radio, CheckCircle, 
  AlertTriangle, Info, Send 
} from 'lucide-react';
import './GlobalConfig.css';

export function GlobalConfig() {
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(false);
  
  // Estados do Financeiro
  const [config, setConfig] = useState({
    default_fee: 60, // 60 centavos
    master_pushin_pay_id: '',
    maintenance_mode: false
  });

  // Estados da Notificação
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    type: 'info' // info, success, warning, alert
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await integrationService.getConfig();
      if (data) {
        setConfig({
          default_fee: data.default_fee || 60,
          master_pushin_pay_id: data.master_pushin_pay_id || '',
          maintenance_mode: data.maintenance_mode || false
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configs:", error);
    }
  };

  // --- SALVAR CONFIGURAÇÕES GERAIS ---
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await integrationService.saveConfig(config);
      Swal.fire('Sucesso', 'Configurações globais atualizadas!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar configurações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ENVIAR NOTIFICAÇÃO EM MASSA (BROADCAST) ---
  const handleSendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) {
      return Swal.fire('Atenção', 'Preencha título e mensagem.', 'warning');
    }

    const result = await Swal.fire({
      title: 'Enviar para TODOS?',
      text: "Isso criará uma notificação para todos os usuários do sistema.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#c333ff',
      confirmButtonText: 'Sim, Enviar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Precisamos criar essa função no backend ou usar um endpoint específico
        // Por enquanto, vamos simular ou usar um endpoint genérico se houver
        // Supondo que exista um endpoint no superAdminService para isso:
        await superAdminService.sendBroadcast(broadcast);
        
        Swal.fire('Enviado!', 'Notificação enviada para todos os usuários.', 'success');
        setBroadcast({ title: '', message: '', type: 'info' });
      } catch (error) {
        Swal.fire('Erro', 'Falha ao enviar broadcast. Verifique se o Backend suporta essa função.', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="global-config-container fade-in">
      <div className="config-header">
        <h1>⚙️ Configurações Globais</h1>
        <p>Definições mestras do sistema Zenyx</p>
      </div>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="config-tabs">
        <button 
          className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <DollarSign size={18} /> Financeiro & Sistema
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} /> Central de Avisos (Broadcast)
        </button>
      </div>

      <div className="config-content">
        
        {/* --- ABA FINANCEIRO --- */}
        {activeTab === 'financial' && (
          <div className="tab-pane fade-in">
            <div className="config-card">
              <div className="card-header">
                <h3>💰 Taxas e Recebedor Mestre</h3>
                <p>Configuração do Split de Pagamento Global</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Taxa Padrão por Venda (Centavos)</label>
                  <input 
                    type="number" 
                    value={config.default_fee}
                    onChange={(e) => setConfig({...config, default_fee: parseInt(e.target.value)})}
                  />
                  <small>Valor cobrado de <strong>novos usuários</strong> por padrão (Ex: 60 = R$ 0,60).</small>
                </div>

                <div className="form-group">
                  <label>Pushin Pay ID (Conta Mestra)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: MASTER_KEY_123..."
                    value={config.master_pushin_pay_id}
                    onChange={(e) => setConfig({...config, master_pushin_pay_id: e.target.value})}
                  />
                  <small>Para onde vai o lucro das taxas (Split).</small>
                </div>
              </div>

              <div className="divider"></div>

              <div className="card-header">
                <h3>🛡️ Segurança do Sistema</h3>
              </div>

              <div className="form-group checkbox-group">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={config.maintenance_mode}
                    onChange={(e) => setConfig({...config, maintenance_mode: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
                <div>
                  <strong>Modo Manutenção</strong>
                  <p>Se ativo, apenas Super Admins poderão acessar o painel.</p>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveConfig} disabled={loading}>
                  <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA NOTIFICAÇÕES (BROADCAST) --- */}
        {activeTab === 'notifications' && (
          <div className="tab-pane fade-in">
            <div className="config-card">
              <div className="card-header">
                <h3>📢 Enviar Aviso Global</h3>
                <p>Envie uma notificação para o painel de <strong>TODOS</strong> os usuários.</p>
              </div>

              <div className="form-group">
                <label>Título do Aviso</label>
                <input 
                  type="text" 
                  placeholder="Ex: Manutenção Programada"
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({...broadcast, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Mensagem</label>
                <textarea 
                  rows="3"
                  placeholder="Ex: O sistema passará por atualizações às 22h..."
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Tipo de Alerta</label>
                <div className="type-selector">
                  <div 
                    className={`type-option info ${broadcast.type === 'info' ? 'selected' : ''}`}
                    onClick={() => setBroadcast({...broadcast, type: 'info'})}
                  >
                    <Info size={16} /> Informativo
                  </div>
                  <div 
                    className={`type-option success ${broadcast.type === 'success' ? 'selected' : ''}`}
                    onClick={() => setBroadcast({...broadcast, type: 'success'})}
                  >
                    <CheckCircle size={16} /> Sucesso
                  </div>
                  <div 
                    className={`type-option warning ${broadcast.type === 'warning' ? 'selected' : ''}`}
                    onClick={() => setBroadcast({...broadcast, type: 'warning'})}
                  >
                    <AlertTriangle size={16} /> Alerta
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-broadcast" onClick={handleSendBroadcast} disabled={loading}>
                  <Send size={18} /> {loading ? 'Enviando...' : 'Enviar para Todos'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}