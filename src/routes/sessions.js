// src/routes/sessions.js
import express from "express";
import {
  startWhatsAppSession,
  getSessionStatus,
  resetWhatsAppSession,
  stopWhatsAppSession,
  getSessionQRCode
} from "../sessions/sessionManager.js";

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

// WIP endpoint para parar uma sessão do WhatsApp
router.post("/stop/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  try {
    stopWhatsAppSession(sessionId);
    res.status(200).json({ message: `Sessão '${sessionId}' parada com sucesso.` });
  } catch (err) {
    console.error(`[Stop] Erro ao parar sessão '${sessionId}':`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
