// src/routes/sessions.js
import express from "express";
import { createClient } from "../bot/clientInstance.js";
import { getClient } from "../bot/clientInstance.js";
const client = getClient();
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
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId é obrigatório." });
  }

  try {
    startWhatsAppSession(sessionId);
    res.status(200).json({ message: `A inicialização da sessão '${sessionId}' começou.` });
  } catch (error) {
    console.error("Erro ao iniciar sessão:", error);
    res.status(500).json({ error: "Falha ao iniciar a sessão." });
  }
});

export default router;