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
    default_fee: 60,
    master_pushin_pay_id: '',
    master_wiinpay_user_id: '',
    master_syncpay_client_id: '',
    master_paradise_account_id: '',
    master_paradise_secret_key: '',
    master_omegapay_client_id: '',
    master_omegapay_client_secret: '',
    maintenance_mode: false,
    ranking_publico: true
  });

  // Estados da Notificação
  const [broadcast, setBroadcast] = useState({
    title: '',
    message: '',
    type: 'info' 
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
          master_wiinpay_user_id: data.master_wiinpay_user_id || '',
          master_syncpay_client_id: data.master_syncpay_client_id || '',
          master_paradise_account_id: data.master_paradise_account_id || '',
          master_paradise_secret_key: data.master_paradise_secret_key || '',
          master_omegapay_client_id: data.master_omegapay_client_id || '',
          master_omegapay_client_secret: data.master_omegapay_client_secret || '',
          maintenance_mode: data.maintenance_mode || false,
          ranking_publico: data.ranking_publico !== undefined ? data.ranking_publico : true
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configs:", error);
    }
  };

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
              
              {/* TAXA SEPARADA PARA NÃO ESPREMER */}
              <div className="form-row" style={{ gridTemplateColumns: '1fr', marginBottom: '30px' }}>
                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label>Taxa Padrão por Venda (Centavos)</label>
                  <input 
                    type="number" 
                    value={config.default_fee}
                    onChange={(e) => setConfig({...config, default_fee: parseInt(e.target.value)})}
                  />
                  <small>Valor cobrado de <strong>novos usuários</strong> por padrão (Ex: 60 = R$ 0,60).</small>
                </div>
              </div>

              {/* GRID DOS CARDS DE GATEWAY */}
              <div className="gateways-grid">
                
                <div className="gateway-box">
                  <h4 style={{ color: '#00e676' }}>PushinPay</h4>
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

                <div className="gateway-box">
                  <h4 style={{ color: '#a855f7' }}>WiinPay</h4>
                  <div className="form-group">
                    <label>WiinPay User ID (Conta Mestra)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: cmllismb726j1od..."
                      value={config.master_wiinpay_user_id}
                      onChange={(e) => setConfig({...config, master_wiinpay_user_id: e.target.value})}
                    />
                    <small>Para onde vai o lucro das taxas (Split).</small>
                  </div>
                </div>

                <div className="gateway-box">
                  <h4 style={{ color: '#3b82f6' }}>Sync Pay</h4>
                  <div className="form-group">
                    <label>Sync Pay Client ID (Conta Mestra)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 5ee78200-8b99-4936..."
                      value={config.master_syncpay_client_id}
                      onChange={(e) => setConfig({...config, master_syncpay_client_id: e.target.value})}
                    />
                    <small>Para onde vai o lucro das taxas (Split).</small>
                  </div>
                </div>

                <div className="gateway-box">
                  <h4 style={{ color: '#facc15' }}>Paradise</h4>
                  <div className="form-group">
                    <label>Account ID (Split da Paradise)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 6225"
                      value={config.master_paradise_account_id}
                      onChange={(e) => setConfig({...config, master_paradise_account_id: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Secret Key (Chave Mestra)</label>
                    <input 
                      type="password" 
                      placeholder="Ex: sk_a8d689..."
                      value={config.master_paradise_secret_key}
                      onChange={(e) => setConfig({...config, master_paradise_secret_key: e.target.value})}
                    />
                  </div>
                </div>

                <div className="gateway-box">
                  <h4 style={{ color: '#0ea5e9' }}>OmegaPay</h4>
                  <div className="form-group">
                    <label>Client ID (Chave Pública Mestra)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: luisdedeus2512_..."
                      value={config.master_omegapay_client_id}
                      onChange={(e) => setConfig({...config, master_omegapay_client_id: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Secret (Chave Privada Mestra)</label>
                    <input 
                      type="password" 
                      placeholder="Ex: nrbqx75vle..."
                      value={config.master_omegapay_client_secret}
                      onChange={(e) => setConfig({...config, master_omegapay_client_secret: e.target.value})}
                    />
                  </div>
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

              {/* 🏆 TOGGLE: RANKING PÚBLICO */}
              <div className="form-group checkbox-group" style={{ marginTop: '15px' }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={config.ranking_publico}
                    onChange={(e) => setConfig({...config, ranking_publico: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
                <div>
                  <strong>Ranking de Vendas Público</strong>
                  <p>Se desativado, apenas administradores poderão ver o ranking de vendas.</p>
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