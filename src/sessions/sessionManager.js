import { WhatsAppClient } from "../bot/client.js";
import qrcode from "qrcode-terminal";
import db from "../../db/connection.js";

// ---- GESTÃO DAS CONEXÕES DO WHATSAPP (INSTÂNCIAS) ----
const activeClients = new Map();

export async function startWhatsAppSession(sessionId, trelloConfigName) {
  if (activeClients.has(sessionId)) {
    console.log(`[${sessionId}] Sessão já existe ou está a iniciar.`);
    return;
  }

  // Buscar configuração do Trello na base de dados
  console.log(
    `[Manager] A buscar configuração do Trello: ${trelloConfigName}...`
  );
  const trelloConfig = await db("trello_configs")
    .where({ name: trelloConfigName })
    .first();

  if (!trelloConfig) {
    throw new Error(
      `[Manager] Configuração do Trello "${trelloConfigName}" não encontrada.`
    );
  }
  console.log(
    `[Manager] Configuração do Trello encontrada para o board ${trelloConfig.boardId}.`
  );

  // Iniciar o cliente do WhatsApp
  const client = new WhatsAppClient(sessionId, trelloConfig);

  client.on("qr", ({ qr }) => {
    console.log(`[Manager] QR Code para ${sessionId} recebido.`);
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log(`[Manager] A sessão ${sessionId} está pronta!`);
  });

  client.on("disconnected", () => {
    console.log(
      `[Manager] A sessão ${sessionId} foi desconectada. A remover da lista ativa.`
    );
    activeClients.delete(sessionId);
  });

  client.on("init_failure", () => {
    console.log(`[Manager] Falha ao iniciar a sessão ${sessionId}.`);
    activeClients.delete(sessionId);
  });

  // Guardar a instância do cliente e sua configuração do Trello
  activeClients.set(sessionId, client);

  client.initialize();
}

export function getWhatsAppClient(sessionId) {
  return activeClients.get(sessionId);
}

// ---- GESTÃO DAS SESSÕES DE CONVERSA (FLUXO DO UTILIZADOR) ----
const conversationSessions = new Map();

export function getConversationSession(sender) {
  return (
    conversationSessions.get(sender) || {
      media: [],
      text: null,
      timeout: null,
      cardCriado: false,
      triggerMsg: null,
    }
  );
}

export function updateConversationSession(sender, sessionData) {
  const currentSession = getConversationSession(sender);
  conversationSessions.set(sender, { ...currentSession, ...sessionData });
}

export function clearConversationSession(sender) {
  if (conversationSessions.has(sender)) {
    const session = conversationSessions.get(sender);
    if (session.timeout) clearTimeout(session.timeout);
    conversationSessions.delete(sender);
  }
}
