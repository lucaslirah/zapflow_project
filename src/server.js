import { createClient } from "./bot/clientInstance.js";
// import initializeClient from "./bot/client.js";
import express from "express";
import configRoutes from "./routes/config.js";
import sessionRoutes from "./routes/sessions.js";

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// usar as rotas de configuração
app.use("/config", configRoutes);

// usar as rotas de sessão
app.use("/sessions", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// initializeClient();
