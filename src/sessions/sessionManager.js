import { WhatsAppClient } from "../bot/client.js";
import qrcode from "qrcode";
import db from "../../db/connection.js";
import path from "path";
// import fs from "fs";

// ---- GESTÃO DAS CONEXÕES DO WHATSAPP (INSTÂNCIAS) ----
const activeClients = new Map();
const sessionStatus = new Map(); // sessionId → "connected" | "disconnected" | "starting"
const qrCodes = new Map(); // sessionId → qrCodeData

// inserir ou atualizar metadados no DB
async function upsertSessionRecord(sessionId, trelloConfigName, status) {
  await db("whatsapp_sessions")
    .insert({ sessionId, trelloConfigName, status })
    .onConflict("sessionId")
    .merge({ status, updated_at: db.fn.now() });
}

// Função para iniciar uma nova sessão do WhatsApp
export async function startWhatsAppSession(sessionId, trelloConfigName) {
  console.log(`[Manager] startWhatsAppSession(${sessionId}) chamado.`);
  sessionStatus.set(sessionId, "starting");
  await upsertSessionRecord(sessionId, trelloConfigName, "starting");

  if (activeClients.has(sessionId)) {
    console.log(`[Manager] ${sessionId} já ativo, retornando.`);
    return;
  }

  const trelloConfig = await db("trello_configs")
    .where({ name: trelloConfigName })
    .first();
  if (!trelloConfig)
    throw new Error(`Config "${trelloConfigName}" não encontrada.`);

  const client = new WhatsAppClient(sessionId, trelloConfig);

  client.on("qr", ({ qr }) => {
    console.log("Dados recebidos para o QR Code:", qr);
    if (!qr) {
      console.error(
        "[Manager][QR] Recebeu um valor de QR Code vazio. Abortando geração de URL."
      );
      return;
    }
    console.log(`[Manager][QR ${sessionId}] recebido.`);
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error(
          `[Manager][QR ${sessionId}] Erro ao gerar QR Code URL:`,
          err
        );
        return;
      }
      // Agora você armazena a URL da imagem do QR Code
      qrCodes.set(sessionId, url);
      console.log(`[Manager][QR ${sessionId}] QR Code disponível para acesso.`);
    });
  });

  client.on("ready", () => {
    console.log(`[Manager][READY ${sessionId}] Cliente pronto.`);
    sessionStatus.set(sessionId, "connected");
    qrCodes.delete(sessionId);
    upsertSessionRecord(sessionId, trelloConfigName, "connected");
  });

  client.on("auth_failure", (msg) => {
    console.error(`[Manager][AUTH_FAIL ${sessionId}]`, msg);
  });

  client.on("disconnected", () => {
    console.log(`[Manager][DISCONNECTED ${sessionId}]`);
    sessionStatus.set(sessionId, "disconnected");
    activeClients.delete(sessionId);
    qrCodes.delete(sessionId);
    upsertSessionRecord(sessionId, trelloConfigName, "disconnected");
  });

  client.on("init_failure", () => {
    console.error(`[Manager][INIT_FAIL ${sessionId}] Não conseguiu iniciar.`);
    sessionStatus.set(sessionId, "disconnected");
    activeClients.delete(sessionId);
    qrCodes.delete(sessionId);
    upsertSessionRecord(sessionId, trelloConfigName, "disconnected");
  });

  activeClients.set(sessionId, client);
  client.initialize();
}

// WIP Função para resetar a sessão (deletar dados de autenticação)
export async function resetWhatsAppSession(sessionId) {
  const authDir = path.resolve(`.wwebjs_auth/session-${sessionId}`);
  const cacheDir = path.resolve(`.wwebjs_cache/session-${sessionId}`);

  // 1) Remover cliente da memória
  if (activeClients.has(sessionId)) {
    activeClients.delete(sessionId);
  }

  // 2) Apagar pastas inteiras (ignora travamentos)
  const forceRm = async (dir) => {
    try {
      // rm do Node 14+: recursive + force
      await fsPromises.rm(dir, { recursive: true, force: true });
      console.log(`[Reset] Pasta removida: ${dir}`);
    } catch (err) {
      console.warn(`[Reset] Não foi possível remover ${dir}: ${err.message}`);
    }
  };

  await forceRm(authDir);
  await forceRm(cacheDir);

  // 3) Atualizar status e limpar QR
  sessionStatus.set(sessionId, "disconnected");
  qrCodes.delete(sessionId);

  // 4) Se usar DB, delete o registro
  await db("whatsapp_sessions").where({ sessionId }).del();

  console.log(`[Reset] Sessão '${sessionId}' resetada.`);
}

// expor status e QR
export function getSessionStatus(sessionId) {
  // Se tem client ativo, retorna o status salvo
  if (activeClients.has(sessionId)) {
    return sessionStatus.get(sessionId) || "starting";
  }
  // Se não tem client, garante disconnected
  return "disconnected";
}

export function getSessionQRCode(sessionId) {
  return qrCodes.get(sessionId);
}

// stop individual
export function stopWhatsAppSession(sessionId) {
  const client = activeClients.get(sessionId);

  console.log(`[Manager STOP] Parando sessão ${sessionId}…`);

  if (client) {
    // Tenta um logout/fechamento limpo
    if (typeof client.logout === "function") {
      client.logout();
      console.log(`[Manager STOP] logout() chamado para ${sessionId}`);
    }
    if (typeof client.destroy === "function") {
      client.destroy();
      console.log(`[Manager STOP] destroy() chamado para ${sessionId}`);
    }

    activeClients.delete(sessionId);
  }

  // Atualiza o status — faz do “fonte da verdade”
  sessionStatus.set(sessionId, "disconnected");
  qrCodes.delete(sessionId);

  console.log(
    `[Manager STOP] status[${sessionId}] = ${sessionStatus.get(sessionId)}`
  );
}

// stop all sessions (shutdown)
export async function stopAllSessions() {
  for (const sessionId of activeClients.keys()) {
    stopWhatsAppSession(sessionId);
    await db("whatsapp_sessions")
      .where({ sessionId })
      .update({ status: "disconnected", updated_at: db.fn.now() });
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
