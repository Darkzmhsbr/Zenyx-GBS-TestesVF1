import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api';
// 👇 Importante: Pegar o usuário logado para saber quem é
import { useAuth } from '../context/AuthContext';
import { User, Award, Lock, Shield, Briefcase, Star } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Profile.css';

export function Profile() {
  const { user, logout } = useAuth(); // Pegando dados da sessão
  const [loading, setLoading] = useState(true);
  
  // Dados do Perfil (vindos da API de perfil)
  const [profile, setProfile] = useState({
    name: '',
    avatar_url: ''
  });

  // Dados Estatísticos (Império)
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

  // Lista de Badges (Mantida original)
  const badges = [
    { name: 'Iniciante', target: 100, color: '#10b981' },
    { name: 'Empreendedor', target: 1000, color: '#3b82f6' },
    { name: 'Barão', target: 5000, color: '#8b5cf6' },
    { name: 'Magnata', target: 10000, color: '#c333ff' },
    { name: 'Imperador', target: 50000, color: '#f59e0b' }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Tenta buscar dados do backend
      const data = await profileService.get();
      if (data) {
        setProfile({
            name: data.name || user?.username, // Fallback para o user da sessão
            avatar_url: data.avatar_url
        });
        // Se a API retornar stats e gamification, preenche aqui
        if (data.stats) setStats(data.stats);
        if (data.gamification) setGamification(data.gamification);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Sair do Sistema?',
      text: "Você precisará logar novamente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#c333ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair',
      background: '#1b1730',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) logout();
    });
  };

  // =========================================================
  // 👑 LÓGICA DE CARGOS E HIERARQUIA
  // =========================================================
  const getUserRole = () => {
    const username = user?.username?.toLowerCase() || '';
    
    // 1. VERIFICAÇÃO REAL DE SUPER ADMIN (Vem do Banco de Dados)
    // Se o backend disser que é superuser, ou se for o dono do sistema
    if (user?.is_superuser || username === 'adminzenyx' || username === 'admin') {
        return {
            label: 'Administrador - Dono do Império Zenyx',
            icon: <Shield size={16} />,
            className: 'role-badge role-master'
        };
    }

    // 2. SÓCIOS (Adicione os usernames aqui no futuro)
    const socios = ['socio1', 'fulano_socio']; 
    if (socios.includes(username)) {
        return {
            label: 'Sócio do Império Zenyx',
            icon: <Star size={16} />,
            className: 'role-badge role-partner'
        };
    }

    // 3. COLABORADORES (Adicione os usernames aqui no futuro)
    const colaboradores = ['suporte', 'dev_team', 'atendente'];
    if (colaboradores.includes(username)) {
        return {
            label: 'Colaborador do Império Zenyx',
            icon: <Briefcase size={16} />,
            className: 'role-badge role-collab'
        };
    }

    // 4. PADRÃO (CLIENTES)
    return {
        label: 'Usuário',
        icon: <User size={16} />,
        className: 'role-badge role-user'
    };
  };

  const roleInfo = getUserRole();
  const currentLevelName = gamification.current_level?.name || "Iniciante";

  // Formata moeda
  const formatMoney = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="profile-container">
      
      {/* 1. HEADER DO PERFIL */}
      <div className="profile-header-section">
        <div className="profile-identity">
          <div className="avatar-wrapper">
             {/* Se não tiver avatar, mostra ícone */}
             {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="avatar-img" />
             ) : (
                <User size={40} color="#c333ff" />
             )}
          </div>
          <div>
            <h1 className="profile-name">{user?.full_name || user?.username}</h1>
            
            {/* Exibe o Cargo Dinâmico */}
            <div className={roleInfo.className}>
                {roleInfo.icon}
                <span>{roleInfo.label}</span>
            </div>

            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-actions">
           <Button onClick={handleLogout} variant="danger" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
             Sair da Conta
           </Button>
        </div>
      </div>

      {/* 2. ESTATÍSTICAS DO IMPÉRIO (Só mostra se for Admin/Sócio ou se o user tiver bots) */}
      <div className="empire-stats-section">
         <h3 className="section-title">Estatísticas do Império</h3>
         <div className="stats-grid">
            <div className="stat-card">
               <span className="stat-label">Bots Ativos</span>
               <strong className="stat-value">{stats.total_bots}</strong>
            </div>
            <div className="stat-card">
               <span className="stat-label">Membros Totais</span>
               <strong className="stat-value">{stats.total_members}</strong>
            </div>
            <div className="stat-card highlight">
               <span className="stat-label">Faturamento Total</span>
               <strong className="stat-value">{formatMoney(stats.total_revenue)}</strong>
            </div>
         </div>
      </div>

      {/* 3. GAMIFICAÇÃO & NÍVEL */}
      <div className="gamification-section">
        <div className="level-header">
           <div>
             <span className="current-level-label">Nível Atual</span>
             <h2 className="current-level-title">{currentLevelName}</h2>
           </div>
           <div className="xp-badge">
             {stats.total_sales} Vendas
           </div>
        </div>

        <div className="progress-container">
          <div className="progress-labels">
             <span>Progresso para {gamification.next_level?.name || "Próximo Nível"}</span>
             <span>{Math.round(gamification.progress_percentage)}%</span>
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
          {badges.map((badge, index) => {
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