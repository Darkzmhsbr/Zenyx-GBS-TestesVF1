import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const REASONS = [
  { value: 'cp', label: '🔴 Pornografia Infantil / Exploração de Menores', severity: 'critical' },
  { value: 'illegal', label: '🔴 Conteúdo Ilegal', severity: 'critical' },
  { value: 'fraud', label: '🟠 Fraude / Estelionato', severity: 'high' },
  { value: 'scam', label: '🟠 Golpe / Enganação', severity: 'high' },
  { value: 'harassment', label: '🟡 Assédio / Ameaças', severity: 'medium' },
  { value: 'spam', label: '🟡 Spam / Conteúdo Indesejado', severity: 'medium' },
  { value: 'other', label: '⚪ Outro Motivo', severity: 'low' },
];

export function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ reporter_name: '', bot_username: '', reason: '', description: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.bot_username.trim()) { setError('Informe o @username do bot.'); return; }
    if (!form.reason) { setError('Selecione o motivo da denúncia.'); return; }

    setSending(true);
    try {
      await api.post('/api/public/reports', {
        reporter_name: form.reporter_name.trim() || null,
        bot_username: form.bot_username.trim(),
        reason: form.reason,
        description: form.description.trim() || null,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  // Estilos inline para manter tudo em um arquivo (página pública standalone)
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
    },
    backBtn: {
      alignSelf: 'flex-start',
      maxWidth: '700px',
      width: '100%',
      margin: '0 auto 20px',
      background: 'none',
      border: 'none',
      color: '#a78bfa',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 600,
      padding: 0,
    },
    card: {
      maxWidth: '700px',
      width: '100%',
      background: 'rgba(27, 23, 48, 0.95)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    icon: {
      fontSize: '48px',
      marginBottom: '12px',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #c333ff, #ff6b6b)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
    },
    subtitle: {
      color: '#a0a0b0',
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    notice: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '24px',
      fontSize: '0.85rem',
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#d4d4d8',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    optional: {
      color: '#666',
      fontWeight: 400,
      fontSize: '0.75rem',
      textTransform: 'none',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      background: '#1b1730',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    errorBox: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '16px',
      color: '#ef4444',
      fontSize: '0.9rem',
    },
    submitBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #c333ff, #8b5cf6)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      opacity: sending ? 0.7 : 1,
    },
    successCard: {
      textAlign: 'center',
      padding: '60px 40px',
    },
    successIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    successTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#10b981',
      marginBottom: '12px',
    },
    successText: {
      color: '#a0a0b0',
      fontSize: '0.95rem',
      lineHeight: 1.6,
      marginBottom: '24px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      color: '#555',
      fontSize: '0.8rem',
    },
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Voltar para a página principal
        </button>
      </div>

      <div style={{ ...styles.card, ...(sent ? styles.successCard : {}) }}>
        {sent ? (
          <>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Denúncia Enviada!</h2>
            <p style={styles.successText}>
              Sua denúncia foi recebida com sucesso e será analisada pela nossa equipe de segurança.
              <br /><br />
              Tomaremos as medidas cabíveis o mais rápido possível. Agradecemos por ajudar a manter a plataforma segura.
            </p>
            <button
              style={{ ...styles.submitBtn, maxWidth: '300px', margin: '0 auto' }}
              onClick={() => navigate('/')}
            >
              Voltar ao Início
            </button>
          </>
        ) : (
          <>
            <div style={styles.header}>
              <div style={styles.icon}>🚨</div>
              <h1 style={styles.title}>Portal de Denúncias</h1>
              <p style={styles.subtitle}>
                Ajude a manter a plataforma segura. Denuncie bots com conteúdo ilegal ou abusivo.
              </p>
            </div>

            <div style={styles.notice}>
              <span>🔒</span>
              <span>Sua denúncia é <strong>confidencial</strong>. Seu nome e dados pessoais não serão expostos ao denunciado em nenhuma circunstância.</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Seu Nome <span style={styles.optional}>(opcional — sua identidade será protegida)</span>
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={form.reporter_name}
                  onChange={e => setForm({ ...form, reporter_name: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username do Bot Denunciado *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ex: @nome_do_bot"
                  value={form.bot_username}
                  onChange={e => setForm({ ...form, bot_username: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Motivo da Denúncia *</label>
                <select
                  style={styles.select}
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  required
                >
                  <option value="">Selecione o motivo...</option>
                  {REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Descrição <span style={styles.optional}>(conte-nos o que aconteceu)</span>
                </label>
                <textarea
                  style={styles.textarea}
                  placeholder="Descreva com detalhes o que você viu ou vivenciou..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  maxLength={2000}
                />
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              <button type="submit" style={styles.submitBtn} disabled={sending}>
                {sending ? '⏳ Enviando...' : '🚨 Enviar Denúncia'}
              </button>
            </form>

            <div style={styles.footer}>
              ZenyxVIPs © {new Date().getFullYear()} — Todas as denúncias são tratadas com sigilo e seriedade.
            </div>
          </>
        )}
      </div>
    </div>
  );
}