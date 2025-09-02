import initializeClient from "./bot/client.js";
// iniciar o servidor express
import express from "express";
import configRoutes from "./routes/config.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// usar as rotas de configuração
app.use("/config", configRoutes);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

initializeClient();
