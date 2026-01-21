import React, { useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Award, Lock, Shield, Briefcase, Star, CreditCard, Save, Edit2 } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Profile.css';

export function Profile() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // ✅ Modo de edição
  
  // Dados do Perfil
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    pushin_pay_id: ''
  });

  // Dados Estatísticos
  const [stats, setStats] = useState({
    total_bots: 0,
    total_members: 0,
    total_revenue: 0,
    total_sales: 0
  });

  // Gamificação
  const [gamification, setGamification] = useState({
    current_level: null,
    next_level: null,
    progress_percentage: 0
  });

  // ✅ NOVAS METAS ATUALIZADAS (VALORES MAIORES)
  const badges = [
    { name: 'Iniciante', target: 100, color: '#10b981' },           // R$ 1,00
    { name: 'Prodígio', target: 10000000, color: '#3b82f6' },      // R$ 100.000,00
    { name: 'Empreendedor', target: 50000000, color: '#8b5cf6' },  // R$ 500.000,00
    { name: 'Barão', target: 5000000, color: '#f59e0b' },          // R$ 50.000,00 (intermediário)
    { name: 'Milionário', target: 100000000, color: '#ef4444' },   // R$ 1.000.000,00
    { name: 'Magnata', target: 1000000000, color: '#c333ff' }      // R$ 10.000.000,00
  ];

  // Formatar Moeda
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, statsData] = await Promise.all([
        authService.getMe(),
        profileService.getStats()
      ]);
      
      setProfile({
        name: userData.full_name || '',
        email: userData.email || '',
        pushin_pay_id: userData.pushin_pay_id || ''
      });
      
      setStats(statsData);

      // Calcular Nível
      const revenue = statsData.total_revenue || 0;
      
      // Ordena badges por target para encontrar o nível correto
      const sortedBadges = [...badges].sort((a, b) => a.target - b.target);
      
      let current = sortedBadges[0];
      let next = sortedBadges[1];
      
      for (let i = 0; i < sortedBadges.length; i++) {
        if (revenue >= sortedBadges[i].target) {
          current = sortedBadges[i];
          next = sortedBadges[i + 1] || null;
        }
      }

      let progress = 100;
      if (next) {
        const range = next.target - current.target;
        const value = revenue - current.target;
        progress = Math.min(100, Math.max(0, (value / range) * 100));
      }

      setGamification({
        current_level: current,
        next_level: next,
        progress_percentage: progress
      });

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      Swal.fire('Erro', 'Não foi possível carregar os dados do perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LÓGICA DE CARGOS E HIERARQUIA
  const getUserRole = () => {
    const username = user?.username?.toLowerCase() || '';
    
    if (user?.is_superuser || username === 'adminzenyx' || username === 'admin') {
        return {
            label: 'Administrador - Dono do Império Zenyx',
            icon: <Shield size={16} />,
            className: 'role-badge role-master'
        };
    }

    const socios = ['socio1', 'fulano_socio']; 
    if (socios.includes(username)) {
        return {
            label: 'Sócio do Império Zenyx',
            icon: <Star size={16} />,
            className: 'role-badge role-partner'
        };
    }

    const colaboradores = ['suporte', 'dev_team', 'atendente'];
    if (colaboradores.includes(username)) {
        return {
            label: 'Colaborador do Império Zenyx',
            icon: <Briefcase size={16} />,
            className: 'role-badge role-collab'
        };
    }

    return {
        label: 'Usuário',
        icon: <User size={16} />,
        className: 'role-badge role-user'
    };
  };

  const role = getUserRole();

  // ✅ FUNÇÃO SALVAR PERFIL (ATUALIZADA)
  const handleSaveProfile = async () => {
    try {
        setLoading(true);
        await authService.updateProfile({
            full_name: profile.name,
            pushin_pay_id: profile.pushin_pay_id
        });
        setEditing(false);
        Swal.fire('Sucesso!', 'Perfil atualizado com sucesso!', 'success');
        // Recarrega dados
        loadData();
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        Swal.fire('Erro', 'Não foi possível salvar os dados.', 'error');
    } finally {
        setLoading(false);
    }
  };

  // ✅ FUNÇÃO CANCELAR EDIÇÃO
  const handleCancelEdit = () => {
    setEditing(false);
    loadData(); // Recarrega dados originais
  };

  if (loading) return <div className="loading">Carregando perfil...</div>;

  return (
    <div className="profile-container">
      
      {/* HEADER DO PERFIL */}
      <div className="profile-header-section">
        <div className="profile-identity">
            <div className="avatar-wrapper">
                <div className="avatar-placeholder">{profile.name.charAt(0) || 'U'}</div>
            </div>
            <div>
                <h1 className="profile-name">{profile.name || user.username}</h1>
                <div className="profile-email">{profile.email}</div>
                <div className={role.className}>
                    {role.icon}
                    <span>{role.label}</span>
                </div>
            </div>
        </div>
        
        {/* ✅ BOTÃO EDITAR PERFIL */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {!editing ? (
                <button 
                    onClick={() => setEditing(true)}
                    style={{ 
                        padding: '10px 20px', 
                        background: '#8b5cf6', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 'bold'
                    }}
                >
                    <Edit2 size={18} /> Editar Perfil
                </button>
            ) : (
                <>
                    <button 
                        onClick={handleCancelEdit}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#666', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveProfile}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#10b981', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        <Save size={18} /> Salvar Alterações
                    </button>
                </>
            )}
        </div>
      </div>

      {/* ✅ SEÇÃO DE DADOS PESSOAIS (EDITÁVEL) */}
      {editing && (
        <div className="edit-section" style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '30px' }}>
          <h3 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="#8b5cf6" />
            Informações Pessoais
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Nome Completo */}
            <div>
              <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
                Nome Completo
              </label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Seu nome completo"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: '#222', 
                  border: '1px solid #444', 
                  color: '#fff', 
                  borderRadius: '6px' 
                }}
              />
            </div>
            
            {/* Email (read-only) */}
            <div>
              <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
                Email (não editável)
              </label>
              <input 
                type="email" 
                value={profile.email}
                disabled
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: '#1a1a1a', 
                  border: '1px solid #333', 
                  color: '#888', 
                  borderRadius: '6px',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO FINANCEIRA */}
      <div className="finance-section" style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '30px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', marginBottom: '15px' }}>
            <CreditCard size={20} color="#10b981" />
            Configuração de Recebimento
        </h3>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>
            Para receber suas comissões de vendas, informe o ID da sua conta Pushin Pay. 
            Você receberá o valor das vendas descontando a taxa da plataforma.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#ccc', fontSize: '12px', marginBottom: '5px' }}>
                    ID da Conta Pushin Pay
                </label>
                <input 
                    type="text" 
                    value={profile.pushin_pay_id}
                    onChange={(e) => setProfile({...profile, pushin_pay_id: e.target.value})}
                    placeholder="Ex: 9D4FA0F6-..."
                    disabled={!editing}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        background: editing ? '#222' : '#1a1a1a', 
                        border: '1px solid #444', 
                        color: '#fff', 
                        borderRadius: '6px',
                        cursor: editing ? 'text' : 'not-allowed'
                    }}
                />
            </div>
            {!editing && (
                <button 
                    onClick={handleSaveProfile}
                    style={{ 
                        padding: '10px 20px', 
                        background: '#c333ff', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    <Save size={18} /> Salvar
                </button>
            )}
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="empire-stats-section">
        <h3 className="section-title">Estatísticas do Império</h3>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <span className="stat-label">Faturamento Total</span>
            <span className="stat-value">{formatMoney(stats.total_revenue)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Vendas Realizadas</span>
            <span className="stat-value">{stats.total_sales}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Bots Ativos</span>
            <span className="stat-value">{stats.total_bots}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Membros Totais</span>
            <span className="stat-value">{stats.total_members}</span>
          </div>
        </div>
      </div>

      {/* GAMIFICAÇÃO */}
      <div className="gamification-section">
        <div className="level-header">
          <div>
            <span className="current-level-label">Nível Atual</span>
            <h2 className="current-level-title">{gamification.current_level?.name || 'Iniciante'}</h2>
          </div>
          <div className="xp-badge">
            {gamification.next_level ? `Próximo: ${gamification.next_level.name}` : 'Nível Máximo'}
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-labels">
            <span>Progresso</span>
            <span>{gamification.progress_percentage.toFixed(1)}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{width: `${gamification.progress_percentage}%`}}
            ></div>
          </div>
          <p className="progress-info">
            Faturamento Atual: <strong>{formatMoney(stats.total_revenue)}</strong> 
            {gamification.next_level && ` / Meta: ${formatMoney(gamification.next_level.target)}`}
          </p>
        </div>

        {/* GALERIA DE TROFÉUS */}
        <h3 className="badges-title" style={{marginTop: '40px'}}>Galeria de Troféus</h3>
        <div className="badges-grid">
          {badges.sort((a, b) => a.target - b.target).map((badge, index) => {
            const isUnlocked = stats.total_revenue >= badge.target;
            return (
              <div key={index} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon" style={{ borderColor: isUnlocked ? badge.color : '#333', color: isUnlocked ? badge.color : '#555' }}>
                  {isUnlocked ? <Award size={32} /> : <Lock size={32} />}
                </div>
                <h4>{badge.name}</h4>
                <p className="badge-target">{formatMoney(badge.target)}</p>
                <div className="badge-status">
                  {isUnlocked ? <span className="status-unlocked">CONQUISTADO</span> : <span className="status-locked">BLOQUEADO</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}