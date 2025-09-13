import { WhatsAppClient } from "../bot/client.js";
import qrcode from "qrcode-terminal";
import db from "../../db/connection.js";
import path from "path";
import fs from "fs";

// ---- GESTÃO DAS CONEXÕES DO WHATSAPP (INSTÂNCIAS) ----
const activeClients = new Map();
const sessionStatus = new Map(); // sessionId → "connected" | "disconnected" | "starting"
const qrCodes = new Map(); // sessionId → qrCodeData

export async function startWhatsAppSession(sessionId, trelloConfigName) {
  sessionStatus.set(sessionId, "starting");

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
    qrCodes.set(sessionId, qr);
  });

  client.on("ready", () => {
    console.log(`[Manager] A sessão ${sessionId} está pronta!`);
    sessionStatus.set(sessionId, "connected");
  });

  client.on("disconnected", () => {
    console.log(
      `[Manager] A sessão ${sessionId} foi desconectada. A remover da lista ativa.`
    );

    sessionStatus.set(sessionId, "disconnected");

    activeClients.delete(sessionId);
  });

  client.on("init_failure", () => {
    console.log(`[Manager] Falha ao iniciar a sessão ${sessionId}.`);

    sessionStatus.set(sessionId, "disconnected");

    activeClients.delete(sessionId);
  });

  // Guardar a instância do cliente e sua configuração do Trello
  activeClients.set(sessionId, client);

  client.initialize();
}

// Função para obter o status da sessão
export function getSessionStatus(sessionId) {
  return sessionStatus.get(sessionId) || "not_found";
}
// Função para obter o QR code da sessão
export function getSessionQRCode(sessionId) {
  return qrCodes.get(sessionId);
}

// WIP Função para resetar a sessão (deletar dados de autenticação)
export async function resetWhatsAppSession(sessionId) {
  const authPath = path.resolve(`.wwebjs_auth/session-${sessionId}`);
  const cachePath = path.resolve(`.wwebjs_cache/session-${sessionId}`);

  // 1. Remover cliente da memória
  const client = activeClients.get(sessionId);
  if (client) {
    activeClients.delete(sessionId);
  }

  // 2. Apagar arquivos da sessão
  try {
    const tryDeleteFolder = async (folderPath) => {
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          try {
            await fs.promises.rm(filePath, { recursive: true, force: true });
          } catch (err) {
            console.warn(`[Reset] Arquivo travado, ignorando: ${err.message}`);
          }
        }
      }
    };

    await tryDeleteFolder(authPath);
    await tryDeleteFolder(cachePath);
  } catch (err) {
    throw new Error(`Erro ao apagar arquivos da sessão: ${err.message}`);
  }

  // 3. Atualizar status e limpar QR
  sessionStatus.set(sessionId, "disconnected");
  qrCodes.delete(sessionId);
}

// WIP Função para parar uma sessão
export function stopWhatsAppSession(sessionId) {
  const client = activeClients.get(sessionId);

  if (client) {
    // Se quiser, pode tentar client.logout() ou apenas remover da memória
    activeClients.delete(sessionId);
    sessionStatus.set(sessionId, "disconnected");
    console.log(`[Manager] Sessão '${sessionId}' foi parada manualmente.`);
  } else {
    console.log(`[Manager] Sessão '${sessionId}' não estava ativa.`);
  }
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
