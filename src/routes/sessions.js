// src/routes/sessions.js
import express from "express";
import {
  startWhatsAppSession,
  getSessionStatus,
  resetWhatsAppSession,
  stopWhatsAppSession,
  getSessionQRCode,
} from "../sessions/sessionManager.js";
import db from "../../db/connection.js";

const router = express.Router();

// endpoint para verificar o status da sessão
router.get("/status/:sessionId", (req, res) => {
  const status = getSessionStatus(req.params.sessionId);
  res.status(200).json({ status });
});

// endpoint para obter o QR code da sessão
router.get("/qr/:sessionId", (req, res) => {
  const qr = getSessionQRCode(req.params.sessionId);

  if (!qr) {
    return res.status(404).json({ error: "QR code não disponível." });
  }

  res.status(200).json({ qr });
});

// WIP endpoint para resetar a sessão (deletar dados de autenticação)
router.post("/reset/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    await resetWhatsAppSession(sessionId);
    res.status(200).json({ message: `Sessão '${sessionId}' resetada.` });
  } catch (err) {
    console.error(
      `[Reset] Erro ao resetar sessão '${sessionId}':`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
});

// endpoint para iniciar uma nova sessão do WhatsApp
router.post("/start", (req, res) => {
  // recebe sessionId e trelloConfigName do corpo da requisição
  const { sessionId, trelloConfigName } = req.body;

  // valida se sessionId e configuracao foi fornecido
  if (!sessionId || !trelloConfigName) {
    return res.status(400).json({
      error: "'sessionId' e 'trelloConfigName' são campos obrigatórios.",
    });
  }

  try {
    startWhatsAppSession(sessionId, trelloConfigName);
    res.status(200).json({
      message: `A inicialização da sessão '${sessionId}' com a configuração '${trelloConfigName}' foi iniciada.`,
    });
  } catch (error) {
    console.error(
      `[API] Erro ao iniciar a sessão '${sessionId}':`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// endpoint para parar uma sessão do WhatsApp
router.post("/stop/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  console.log(`[API STOP] Antes: status = ${getSessionStatus(sessionId)}`);

  try {
    stopWhatsAppSession(sessionId);

    // Se estiver usando persistência em DB:
    await db("whatsapp_sessions")
      .where({ sessionId })
      .update({ status: "disconnected", updated_at: db.fn.now() });

    console.log(`[API STOP] Depois: status = ${getSessionStatus(sessionId)}`);

    return res.status(200).json({ message: `Sessão '${sessionId}' parada.` });
  } catch (err) {
    console.error(`[API STOP] Erro:`, err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
