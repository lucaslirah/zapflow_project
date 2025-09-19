// import initializeClient from "./bot/client.js";
import express from "express";
import configRoutes from "./routes/config.js";
import sessionRoutes from "./routes/sessions.js";
import cors from "cors";
// import db from "../db/connection.js";
import { 
  // startWhatsAppSession, 
  stopAllSessions 
} from "./sessions/sessionManager.js";

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

// usar as rotas de configuração
app.use("/config", configRoutes);

// usar as rotas de sessão
app.use("/sessions", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Reconectar sessões ativas do WhatsApp ao iniciar o servidor
// (async () => {
//   const sessions = await db("whatsapp_sessions").select();
//   for (const { sessionId, trelloConfigName } of sessions) {
//     console.log(`[Boot] Reconectando sessão ${sessionId}…`);
//     startWhatsAppSession(sessionId, trelloConfigName);
//   }
// })();

// handlers de shutdown
const graceful = async () => {
  console.log("[Shutdown] Parando todas as sessões...");
  await stopAllSessions();
  server.close(() => process.exit(0));
};

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);


// initializeClient();
