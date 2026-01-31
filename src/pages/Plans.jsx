import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { 
  Plus, Trash2, Calendar, DollarSign, Edit2, Check, X, Tag, Infinity, Hash, Info 
} from 'lucide-react';
import { planService } from '../services/api';
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import './Plans.css';

export function Plans() {
  const { selectedBot } = useBot(); 
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para criação
  const [newPlan, setNewPlan] = useState({ 
    nome_exibicao: '', 
    preco_atual: '',
    dias_duracao: '',
    is_lifetime: false,
    id_canal_destino: '' // 🔥 NOVO CAMPO
  });

  // Estado para edição (Modal)
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (selectedBot) {
        carregarPlanos();
    } else {
        setPlans([]);
    }
  }, [selectedBot]);

  const carregarPlanos = async () => {
    if (!selectedBot?.id) return;
    try {
      const lista = await planService.listPlans(selectedBot.id);
      setPlans(lista);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar planos', 'error');
    }
  };

  const handleCreate = async () => {
    // Validação: Se não for vitalício, exigir dias_duracao
    if (!newPlan.nome_exibicao || !newPlan.preco_atual) {
      return Swal.fire('Atenção', 'Preencha o nome e o preço', 'warning');
    }
    
    if (!newPlan.is_lifetime && !newPlan.dias_duracao) {
      return Swal.fire('Atenção', 'Planos temporários precisam ter duração em dias', 'warning');
    }

    try {
      setLoading(true);
      await planService.createPlan(selectedBot.id, {
        nome_exibicao: newPlan.nome_exibicao,
        preco_atual: parseFloat(newPlan.preco_atual),
        dias_duracao: newPlan.is_lifetime ? 9999 : parseInt(newPlan.dias_duracao),
        is_lifetime: newPlan.is_lifetime,
        id_canal_destino: newPlan.id_canal_destino || null // 🔥 ENVIA PARA O BACKEND
      });
      
      Swal.fire('Sucesso', 'Plano criado!', 'success');
      setNewPlan({ nome_exibicao: '', preco_atual: '', dias_duracao: '', is_lifetime: false, id_canal_destino: '' });
      carregarPlanos();
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível criar o plano', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan({ 
      ...plan,
      is_lifetime: plan.is_lifetime || false,
      id_canal_destino: plan.id_canal_destino || '' 
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPlan) return;
    
    // Validação
    if (!editingPlan.is_lifetime && !editingPlan.dias_duracao) {
      return Swal.fire('Atenção', 'Planos temporários precisam ter duração', 'warning');
    }
    
    try {
      await planService.updatePlan(
          selectedBot.id,
          editingPlan.id,
          {
            nome_exibicao: editingPlan.nome_exibicao,
            preco_atual: parseFloat(editingPlan.preco_atual),
            dias_duracao: editingPlan.is_lifetime ? 9999 : parseInt(editingPlan.dias_duracao),
            descricao: editingPlan.descricao || "",
            is_lifetime: editingPlan.is_lifetime,
            id_canal_destino: editingPlan.id_canal_destino || null // 🔥 ATUALIZA NO BACKEND
          }
      );
      
      Swal.fire('Atualizado', 'Plano editado com sucesso', 'success');
      setIsEditModalOpen(false);
      setEditingPlan(null);
      carregarPlanos();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao atualizar plano', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso apagará o plano permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, deletar'
    });

    if (result.isConfirmed) {
      try {
        await planService.deletePlan(selectedBot.id, id);
        Swal.fire('Deletado!', 'O plano foi removido.', 'success');
        carregarPlanos();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao deletar plano', 'error');
      }
    }
  };

  return (
    <div className="plans-container">
      <div className="header-actions">
        <h1>Gerenciar Planos</h1>
      </div>

      {selectedBot ? (
        <>
          {/* CARD DE CRIAÇÃO */}
          <Card className="create-plan-card">
            <CardContent>
              <h3>Novo Plano</h3>
              <div className="create-plan-form">
                <Input 
                  placeholder="Nome (Ex: Mensal)" 
                  value={newPlan.nome_exibicao}
                  onChange={e => setNewPlan({...newPlan, nome_exibicao: e.target.value})}
                  icon={<Tag size={18}/>}
                />
                <Input 
                  placeholder="Preço (10.00)" type="number"
                  value={newPlan.preco_atual}
                  onChange={e => setNewPlan({...newPlan, preco_atual: e.target.value})}
                  icon={<DollarSign size={18}/>}
                />
                
                {/* BLOCO: Toggle Vitalício */}
                <div className="form-group-inline">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newPlan.is_lifetime}
                      onChange={e => setNewPlan({...newPlan, is_lifetime: e.target.checked})}
                    />
                    <Infinity size={18} style={{marginLeft: 8, marginRight: 4}} />
                    <span>Acesso Vitalício</span>
                  </label>
                </div>
                
                {/* Só mostra campo de dias se NÃO for vitalício */}
                {!newPlan.is_lifetime && (
                  <Input 
                    placeholder="Duração (dias)" type="number"
                    value={newPlan.dias_duracao}
                    onChange={e => setNewPlan({...newPlan, dias_duracao: e.target.value})}
                    icon={<Calendar size={18}/>}
                  />
                )}
                
                <Button onClick={handleCreate} disabled={loading} className="form-action-btn">
                  <Plus size={20} /> Criar
                </Button>
              </div>

              {/* 🔥 OPÇÕES AVANÇADAS: CANAL DE DESTINO */}
              <div className="advanced-options-row">
                {/* EXPLICAÇÃO VISUAL */}
                <div className="info-banner">
                  <Info size={20} />
                  <div className="info-content">
                    <h5>Múltiplos Canais / Grupos (Opcional)</h5>
                    <p>
                      Deseja que este plano libere acesso a um <b>Canal ou Grupo diferente</b> do padrão do bot? 
                      <br/>Cole o ID abaixo. Se deixar vazio, o cliente entrará no canal principal.
                    </p>
                  </div>
                </div>

                <Input 
                  label="ID do Canal/Grupo de Destino (Ex: -100123456789)" 
                  placeholder="Deixe vazio para usar o padrão do Bot" 
                  value={newPlan.id_canal_destino}
                  onChange={e => setNewPlan({...newPlan, id_canal_destino: e.target.value})}
                  icon={<Hash size={18}/>}
                />
              </div>

            </CardContent>
          </Card>

          {/* LISTA DE PLANOS */}
          <div className="plans-grid">
            {plans.map(plan => (
              <Card key={plan.id} className="plan-card-item">
                <CardContent>
                  <div className="plan-card-top">
                    <div className="plan-icon">
                      {plan.is_lifetime ? <Infinity size={24} /> : <Calendar size={24} />}
                    </div>
                    <div className="plan-info">
                      <h4 className="plan-title">{plan.nome_exibicao}</h4>
                      <span className="plan-badge">
                        {plan.is_lifetime ? 'Vitalício' : `${plan.dias_duracao} dias`}
                      </span>
                      {/* Badge visual se tiver canal customizado */}
                      {plan.id_canal_destino && (
                        <span className="plan-badge" style={{color: '#3b82f6', marginTop: 4, display:'block', borderColor: 'rgba(59,130,246,0.3)'}}>
                          <Hash size={10} style={{marginRight:2}}/> Canal Específico
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="plan-price-area">
                    <span className="currency">R$</span>
                    <span className="amount">{parseFloat(plan.preco_atual).toFixed(2)}</span>
                  </div>

                  <div className="plan-actions">
                    <button className="btn-icon edit" onClick={() => openEditModal(plan)} title="Editar">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(plan.id)} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* MODAL DE EDIÇÃO */}
          {isEditModalOpen && editingPlan && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Editar Plano</h3>
                  <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                </div>
                
                <div className="modal-body">
                  <div className="modal-row">
                    <Input 
                      label="Nome do Plano"
                      value={editingPlan.nome_exibicao}
                      onChange={e => setEditingPlan({...editingPlan, nome_exibicao: e.target.value})}
                    />
                    
                    <Input 
                      label="Preço (R$)" type="number"
                      value={editingPlan.preco_atual}
                      onChange={e => setEditingPlan({...editingPlan, preco_atual: e.target.value})}
                      icon={<DollarSign size={16}/>}
                    />
                  </div>
                  
                  {/* BLOCO: Toggle Vitalício no Modal */}
                  <div className="form-group" style={{marginTop: 5}}>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={editingPlan.is_lifetime}
                        onChange={e => setEditingPlan({...editingPlan, is_lifetime: e.target.checked})}
                      />
                      <Infinity size={18} style={{marginLeft: 8, marginRight: 4}} />
                      <span>Acesso Vitalício</span>
                    </label>
                  </div>
                  
                  {/* Só mostra campo de dias se NÃO for vitalício */}
                  {!editingPlan.is_lifetime && (
                    <Input 
                      label="Duração (Dias)" type="number"
                      value={editingPlan.dias_duracao}
                      onChange={e => setEditingPlan({...editingPlan, dias_duracao: e.target.value})}
                      icon={<Calendar size={16}/>}
                    />
                  )}

                  {/* 🔥 BLOCO: Canal Específico (Edição) */}
                  <div style={{marginTop: 15, paddingTop: 15, borderTop: '1px solid #333'}}>
                    <div className="info-banner" style={{fontSize: '0.8rem', padding: '8px'}}>
                      <Info size={16} />
                      <div className="info-content">
                        <h5>Acesso Diferenciado</h5>
                        <p>Configure um ID abaixo apenas se quiser desviar o cliente para outro canal.</p>
                      </div>
                    </div>

                    <Input 
                      label="ID do Canal VIP Específico" 
                      placeholder="Deixe vazio para usar padrão" 
                      value={editingPlan.id_canal_destino}
                      onChange={e => setEditingPlan({...editingPlan, id_canal_destino: e.target.value})}
                      icon={<Hash size={16}/>}
                    />
                  </div>

                </div>

                <div className="modal-footer">
                  <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdate}>
                    <Check size={18} style={{marginRight: 8}}/> Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          )}

        </>
      ) : (
        <div className="empty-state">
            <h2>👈 Selecione um bot no menu lateral para gerenciar os planos.</h2>
        </div>
      )}
    </div>
  );
}