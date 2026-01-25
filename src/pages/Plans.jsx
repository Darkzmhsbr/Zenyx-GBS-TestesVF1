import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { 
  Plus, Trash2, Calendar, DollarSign, Edit2, Check, X, Tag 
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
    dias_duracao: '' 
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
    // 🔥 Pega o ID com segurança, seja ele objeto ou número
    const botId = typeof selectedBot === 'object' ? selectedBot.id : selectedBot;
    if (!botId) return;

    try {
      const lista = await planService.listPlans(botId);
      setPlans(lista);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erro!',
        text: 'Não foi possível carregar os planos.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    }
  };

  const handleCreate = async () => {
    // 🎯 Extração limpa do ID para evitar o erro [object Object] na URL
    const botId = typeof selectedBot === 'object' ? selectedBot.id : selectedBot;

    if (!newPlan.nome_exibicao || !newPlan.preco_atual || !newPlan.dias_duracao) {
      return Swal.fire('Atenção', 'Preencha todos os campos.', 'warning');
    }

    if (!botId) {
      return Swal.fire('Erro', 'Selecione um bot primeiro.', 'error');
    }

    try {
      setLoading(true);
      
      // 🔥 LÓGICA DA VERSÃO FUNCIONAL: 
      // Enviamos o bot_id DENTRO do objeto, como o main.py espera
      await planService.createPlan({
        nome_exibicao: newPlan.nome_exibicao,
        preco_atual: parseFloat(newPlan.preco_atual),
        dias_duracao: parseInt(newPlan.dias_duracao),
        bot_id: botId 
      });
      
      setNewPlan({ nome_exibicao: '', preco_atual: '', dias_duracao: '' });
      carregarPlanos();
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Plano criado com sucesso.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#151515',
        color: '#fff'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao criar plano. Verifique o console.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan({ ...plan });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await planService.updatePlan(editingPlan.id, editingPlan);
      setIsEditModalOpen(false);
      carregarPlanos();
      Swal.fire({
        title: 'Atualizado!',
        text: 'Plano atualizado com sucesso.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#151515',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao atualizar plano.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Este plano será removido permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await planService.deletePlan(id);
        carregarPlanos();
        Swal.fire({
          title: 'Deletado!',
          icon: 'success',
          background: '#151515',
          color: '#fff'
        });
      } catch (error) {
        Swal.fire('Erro', 'Não foi possível deletar o plano.', 'error');
      }
    }
  };

  return (
    <div className="plans-container">
      {selectedBot ? (
        <>
          <div className="page-header">
            <h1>Planos de Acesso: <span className="highlight-text">{selectedBot.nome}</span></h1>
            <p className="page-subtitle">Gerencie os valores e durações dos acessos ao seu canal VIP.</p>
          </div>

          <Card className="create-plan-card">
            <CardContent>
              <div className="card-header-title">
                <Plus size={20} />
                <span>Criar Novo Plano</span>
              </div>
              
              <div className="create-plan-form">
                <Input 
                  placeholder="Nome do Plano (Ex: Plano Mensal)" 
                  value={newPlan.nome_exibicao}
                  onChange={e => setNewPlan({...newPlan, nome_exibicao: e.target.value})}
                  icon={<Tag size={16}/>}
                />
                <Input 
                  placeholder="Preço (Ex: 49.90)" type="number"
                  value={newPlan.preco_atual}
                  onChange={e => setNewPlan({...newPlan, preco_atual: e.target.value})}
                  icon={<DollarSign size={16}/>}
                />
                <Input 
                  placeholder="Duração (Dias)" type="number"
                  value={newPlan.dias_duracao}
                  onChange={e => setNewPlan({...newPlan, dias_duracao: e.target.value})}
                  icon={<Calendar size={16}/>}
                />
                <div className="form-action-btn">
                  <Button onClick={handleCreate} disabled={loading}>
                    <Plus size={18} style={{marginRight: 8}}/> {loading ? 'Criando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="plans-grid">
            {plans.map(plan => (
              <Card key={plan.id} className="plan-item-card">
                <CardContent>
                  <div className="plan-info-main">
                    <h3>{plan.nome_exibicao}</h3>
                    <div className="plan-price">R$ {parseFloat(plan.preco_atual).toFixed(2)}</div>
                    <div className="plan-duration">
                      <Calendar size={14} /> {plan.dias_duracao} dias de acesso
                    </div>
                  </div>
                  
                  <div className="plan-actions">
                    <button className="action-btn edit" onClick={() => handleEdit(plan)}>
                      <Edit2 size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(plan.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isEditModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Editar Plano</h3>
                  <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="modal-body">
                  <Input 
                    label="Nome do Plano"
                    value={editingPlan.nome_exibicao}
                    onChange={e => setEditingPlan({...editingPlan, nome_exibicao: e.target.value})}
                  />
                  <div className="modal-row">
                     <Input 
                      label="Preço (R$)" type="number"
                      value={editingPlan.preco_atual}
                      onChange={e => setEditingPlan({...editingPlan, preco_atual: e.target.value})}
                      icon={<DollarSign size={16}/>}
                    />
                    <Input 
                      label="Duração (Dias)" type="number"
                      value={editingPlan.dias_duracao}
                      onChange={e => setEditingPlan({...editingPlan, dias_duracao: e.target.value})}
                      icon={<Calendar size={16}/>}
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