import React, { createContext, useState, useEffect, useContext } from 'react';
import { botService } from '../services/api';
// 👇 1. Importamos o Auth para saber quando o usuário muda
import { useAuth } from './AuthContext';

const BotContext = createContext();

export function BotProvider({ children }) {
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 👇 2. Pegamos o usuário atual do sistema
  const { user } = useAuth();

  // Carrega bots ao iniciar E SEMPRE que o usuário mudar
  useEffect(() => {
    if (user) {
      loadBots();
    }
  }, [user]); // 👈 O segredo está aqui: Mudou o user? Recarrega os bots!

  async function loadBots() {
    try {
      setLoading(true);
      
      // 1. Busca TODOS os bots do banco (A API JÁ FILTRA POR DONO AGORA)
      const allBots = await botService.listBots();
      
      // 🔥 CORREÇÃO FASE 2: 
      // Não filtramos mais no frontend. A API (listar_bots) já retorna 
      // apenas os bots que pertencem a este usuário.
      const finalBots = allBots;

      setBots(finalBots);
      
      // 4. Lógica de Seleção Automática
      if (finalBots.length > 0) {
          // Se o bot selecionado anteriormente não está na lista nova, muda para o primeiro
          if (selectedBot && !finalBots.find(b => b.id === selectedBot.id)) {
             setSelectedBot(finalBots[0]);
             localStorage.setItem('zenyx_selected_bot', finalBots[0].id);
          } 
          // Se não tem nada selecionado, pega o salvo no storage ou o primeiro da lista
          else if (!selectedBot) {
             const savedBotId = localStorage.getItem('zenyx_selected_bot');
             const found = finalBots.find(b => String(b.id) === String(savedBotId));
             setSelectedBot(found || finalBots[0]);
             
             // Atualiza storage por garantia
             if (found || finalBots[0]) {
                localStorage.setItem('zenyx_selected_bot', (found || finalBots[0]).id);
             }
          }
      } else {
          // Se não sobrou nenhum bot (lista vazia), limpa a seleção
          setSelectedBot(null);
          localStorage.removeItem('zenyx_selected_bot');
      }

    } catch (error) {
      console.error("Erro ao carregar bots no contexto:", error);
      // Se der erro (ex: 401), zera a lista
      setBots([]);
    } finally {
      setLoading(false);
    }
  }

  const changeBot = (bot) => {
    setSelectedBot(bot);
    localStorage.setItem('zenyx_selected_bot', bot.id);
  };

  const refreshBots = async () => {
    await loadBots();
  };

  return (
    <BotContext.Provider value={{ 
      bots, 
      selectedBot, 
      changeBot, 
      refreshBots,
      loading 
    }}>
      {children}
    </BotContext.Provider>
  );
}

export function useBot() {
  return useContext(BotContext);
}