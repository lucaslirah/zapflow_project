// src/routes/sessions.js
import express from "express";
import fs from "fs";
import path from "path";
import { startWhatsAppSession } from "../sessions/sessionManager.js";

const router = express.Router();

// endpoint para verificar o status da sessão
router.get("/status", (req, res) => {
  const isReady = client.info?.wid ? true : false;
  res.status(200).json({ status: isReady ? "connected" : "disconnected" });
});

// endpoint para resetar a sessão (deletar dados de autenticação)
router.post("/reset", async (req, res) => {
  try {
    const authPath = path.resolve(".wwebjs_auth");
    const cachePath = path.resolve(".wwebjs_cache");

    if (fs.existsSync(authPath))
      fs.rmSync(authPath, { recursive: true, force: true });
    if (fs.existsSync(cachePath))
      fs.rmSync(cachePath, { recursive: true, force: true });

    createClient(); // reinicializa o cliente

    res
      .status(200)
      .json({ message: "Sessão resetada. Escaneie o QR novamente." });
  } catch (err) {
    console.error("Erro ao resetar sessão:", err);
    res.status(500).json({ error: "Erro ao resetar sessão" });
  }
});

// endpoint para iniciar uma nova sessão do WhatsApp
router.post("/start", (req, res) => {
  // recebe sessionId e trelloConfigName do corpo da requisição
  const { sessionId, trelloConfigName } = req.body;

  // valida se sessionId e configuracao foi fornecido
  if (!sessionId || !trelloConfigName) {
    return res.status(400).json({ 
      error: "'sessionId' e 'trelloConfigName' são campos obrigatórios."
    });
  }

  try {
    startWhatsAppSession(sessionId, trelloConfigName);
    res
      .status(200)
      .json({ 
        message: `A inicialização da sessão '${sessionId}' com a configuração '${trelloConfigName}' foi iniciada.` 
      });
  } catch (error) {
    console.error(`[API] Erro ao iniciar a sessão '${sessionId}':`, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
