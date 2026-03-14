import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
    Save, 
    Flame, 
    Clock, 
    MessageSquare, 
    AlertOctagon, 
    Zap, 
    CreditCard,
    Loader2
} from 'lucide-react';
import { useBot } from '../context/BotContext';
import { launchStrategyService, planService } from '../services/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { RichInput } from '../components/RichInput';
import { MediaUploader } from '../components/MediaUploader';
import './LaunchStrategyPage.css';

export function LaunchStrategyPage() {
    const { selectedBot } = useBot();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [planos, setPlanos] = useState([]);

    const [config, setConfig] = useState({
        ativo: false,
        msg_boas_vindas: '',
        media_url: '',
        btn_text: '🔓 RESGATAR CONVITE VIP',
        tempo_vip_minutos: 1,
        msg_expulsao: '',
        media_oferta_url: '',
        plano_id: ''
    });

    useEffect(() => {
        if (selectedBot) {
            loadData();
        }
    }, [selectedBot]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Busca as configurações da estratégia de lançamento
            const data = await launchStrategyService.getConfig(selectedBot.id);
            if (data) {
                setConfig({
                    ativo: data.ativo || false,
                    msg_boas_vindas: data.msg_boas_vindas || '',
                    media_url: data.media_url || '',
                    btn_text: data.btn_text || '🔓 RESGATAR CONVITE VIP',
                    tempo_vip_minutos: data.tempo_vip_minutos || 1,
                    msg_expulsao: data.msg_expulsao || '',
                    media_oferta_url: data.media_oferta_url || '',
                    plano_id: data.plano_id || ''
                });
            }

            // Busca os planos disponíveis para o Dropdown da Oferta
            const plansData = await planService.listPlans(selectedBot.id);
            if (Array.isArray(plansData)) {
                setPlanos(plansData.filter(p => p.is_active !== false && p.ativo !== false));
            } else if (plansData && Array.isArray(plansData.plans)) {
                setPlanos(plansData.plans.filter(p => p.is_active !== false && p.ativo !== false));
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            Swal.fire('Erro', 'Falha ao carregar as configurações.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedBot) return;
        if (config.ativo && config.tempo_vip_minutos < 1) {
            return Swal.fire('Atenção', 'O tempo de degustação deve ser de pelo menos 1 minuto.', 'warning');
        }
        if (config.ativo && !config.plano_id) {
            return Swal.fire('Atenção', 'Você deve selecionar um plano de oferta para a expulsão.', 'warning');
        }

        setSaving(true);
        try {
            // Conversão de tipos segura antes de enviar
            const payload = {
                ...config,
                tempo_vip_minutos: parseInt(config.tempo_vip_minutos) || 1,
                plano_id: config.plano_id ? parseInt(config.plano_id) : null
            };

            await launchStrategyService.saveConfig(selectedBot.id, payload);
            
            Swal.fire({
                icon: 'success',
                title: 'Estratégia Salva!',
                text: config.ativo ? 'O modo degustação VIP está ATIVADO.' : 'Configurações salvas.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: '#151515',
                color: '#fff'
            });
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Swal.fire('Erro', 'Falha ao salvar as configurações.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRichChange = (field, val) => {
        let cleanValue = val;
        if (val && typeof val === 'object' && val.target) {
            cleanValue = val.target.value;
        }
        setConfig(prev => ({ ...prev, [field]: cleanValue }));
    };

    if (loading) {
        return (
            <div className="launch-page-container loading-state">
                <div className="loading-content fade-in-up">
                    <Loader2 className="spinner-animado" size={50} />
                    <h2>Sincronizando Estratégia...</h2>
                    <p>Preparando a máquina de vendas, por favor aguarde.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="launch-page-container fade-in-up">
            
            {/* HEADER */}
            <div className="launch-header">
                <div className="header-titles">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div className="flame-icon-wrapper">
                            <Flame size={28} color="#f97316" />
                        </div>
                        <h1>Estratégia de Lançamento</h1>
                    </div>
                    <p>Crie um funil de escassez extrema com degustação VIP temporária.</p>
                </div>
                <div className="header-actions">
                    <Button variant="primary" onClick={handleSave} disabled={saving} className="btn-save-main">
                        {saving ? <Loader2 size={18} className="spinner-animado" /> : <Save size={18} />}
                        <span className="btn-text">{saving ? 'Salvando...' : 'Salvar Estratégia'}</span>
                    </Button>
                </div>
            </div>

            {/* MASTER TOGGLE CARD */}
            <Card className={`master-toggle-card ${config.ativo ? 'is-active' : ''}`}>
                <CardContent className="mt-content">
                    <div className="mt-info">
                        <Zap size={24} color={config.ativo ? "#f97316" : "#666"} />
                        <div>
                            <h3>Ativar Modo Lançamento (Degustação VIP)</h3>
                            <p>Quando ativado, os usuários receberão um link de uso único e serão expulsos automaticamente após o tempo limite.</p>
                        </div>
                    </div>
                    <div className={`custom-toggle large ${config.ativo ? 'active-orange' : ''}`} onClick={() => setConfig({...config, ativo: !config.ativo})}>
                        <div className="toggle-handle"></div>
                        <span className="toggle-label">{config.ativo ? 'ATIVADO' : 'DESATIVADO'}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="launch-grid">
                
                {/* COLUNA ESQUERDA: ENTRADA E TEMPO */}
                <div className="launch-column">
                    
                    {/* PASSO 1: MENSAGEM DE ENTRADA */}
                    <Card className="launch-card">
                        <div className="launch-badge step-1">Passo 1: A Isca</div>
                        <CardContent>
                            <div className="card-header-row">
                                <MessageSquare size={20} color="#3b82f6"/>
                                <h3>Mensagem de Convite</h3>
                            </div>
                            <p className="card-description">
                                Essa é a mensagem que o lead recebe assim que clica em /start. 
                                Nela, deve estar o botão para resgatar o acesso temporário.
                            </p>

                            <div className="form-group mt-15">
                                <RichInput 
                                    label="Copy Persuasiva" 
                                    value={config.msg_boas_vindas} 
                                    onChange={val => handleRichChange('msg_boas_vindas', val)} 
                                    rows={6}
                                />
                            </div>

                            <div className="form-group mt-15">
                                <MediaUploader 
                                    label="Mídia da Isca (Imagem ou Vídeo)" 
                                    value={config.media_url} 
                                    onChange={(url) => setConfig({...config, media_url: url})} 
                                />
                            </div>

                            <div className="form-group mt-15">
                                <Input 
                                    label="Texto do Botão de Acesso" 
                                    value={config.btn_text} 
                                    onChange={e => setConfig({...config, btn_text: e.target.value})}
                                    placeholder="Ex: 🔓 RESGATAR CONVITE VIP"
                                />
                                <small className="helper-text">Ao clicar, o usuário recebe o link de 1 uso do Canal VIP.</small>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PASSO 2: O CRONÔMETRO */}
                    <Card className="launch-card">
                        <div className="launch-badge step-2">Passo 2: O Cronômetro</div>
                        <CardContent>
                            <div className="card-header-row">
                                <Clock size={20} color="#eab308"/>
                                <h3>Tempo de Degustação</h3>
                            </div>
                            <p className="card-description">
                                Defina quantos minutos o usuário poderá ficar dentro do VIP de graça antes de ser removido pelo bot.
                            </p>

                            <div className="timer-box mt-15">
                                <div className="timer-input-wrapper">
                                    <Input 
                                        type="number"
                                        min="1"
                                        value={config.tempo_vip_minutos} 
                                        onChange={e => setConfig({...config, tempo_vip_minutos: parseInt(e.target.value) || 1})}
                                        style={{ fontSize: '1.5rem', textAlign: 'center', height: '60px' }}
                                    />
                                    <span className="timer-suffix">Minutos</span>
                                </div>
                                <div className="timer-warning">
                                    <AlertOctagon size={16} />
                                    <span>Após esse exato tempo, o usuário será expulso (kickado) automaticamente.</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* COLUNA DIREITA: A OFERTA (REMARKETING) */}
                <div className="launch-column">
                    
                    {/* PASSO 3: A EXPULSÃO */}
                    <Card className="launch-card drop-shadow-orange">
                        <div className="launch-badge step-3">Passo 3: A Conversão</div>
                        <CardContent>
                            <div className="card-header-row">
                                <Flame size={20} color="#f97316"/>
                                <h3>Mensagem de Expulsão / Oferta</h3>
                            </div>
                            <p className="card-description">
                                Assim que o bot remover o usuário do VIP, ele enviará esta mensagem imediatamente na DM cobrando pelo acesso definitivo.
                            </p>

                            <div className="form-group mt-15">
                                <RichInput 
                                    label="Copy de Escassez (O Gatilho)" 
                                    value={config.msg_expulsao} 
                                    onChange={val => handleRichChange('msg_expulsao', val)} 
                                    rows={6}
                                />
                            </div>

                            <div className="form-group mt-15">
                                <MediaUploader 
                                    label="Mídia da Oferta (Prova social, etc)" 
                                    value={config.media_oferta_url} 
                                    onChange={(url) => setConfig({...config, media_oferta_url: url})} 
                                />
                            </div>

                            <div className="form-group mt-15 offer-select-box">
                                <label><CreditCard size={16}/> Plano Oferecido no Botão</label>
                                <select 
                                    className="zenyx-select"
                                    value={config.plano_id || ''} 
                                    onChange={e => setConfig({...config, plano_id: e.target.value})}
                                >
                                    <option value="">-- Selecione o Plano Definitivo --</option>
                                    {planos.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.nome_exibicao} - R$ {plan.preco_atual?.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <small className="helper-text">
                                    O botão de pagamento (Checkout) será gerado automaticamente usando o plano escolhido acima.
                                </small>
                            </div>
                        </CardContent>
                    </Card>

                    {/* DICA DE ESTRATÉGIA */}
                    <div className="strategy-tip-box">
                        <h4>💡 Dica de Mestre</h4>
                        <p>
                            Use o gatilho da <b>Aversão à Perda</b>. O usuário acabou de ver o seu conteúdo VIP por dentro. 
                            A copy da expulsão deve focar em <i>"Você perdeu o acesso ao paraíso, mas ainda dá tempo de voltar..."</i>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}