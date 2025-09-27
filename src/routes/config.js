// criar endpoints para acessar o banco de dados e realizar operações CRUD
// usar expresse e router
import express from "express";
import db from "../../db/connection.js";

const router = express.Router();

// Endpoint para obter todas as configurações
router.get("/trello", async (req, res) => {
  try {
    const configs = await db("trello_configs")
      .select("*")
      .orderBy("createdAt", "desc");
    res.status(200).json(configs);
  } catch (error) {
    console.error("Erro ao buscar configurações Trello:", error);
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
});

// Endpoint para obter uma configuração por nome
router.get("/trello/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const config = await db("trello_configs").where({ name }).first();
    if (!config) {
      return res.status(404).json({ error: "Configuração não encontrada." });
    }
    res.status(200).json(config);
  } catch (err) {
    console.error("Erro ao buscar configuração:", err);
    res.status(500).json({ error: "Erro interno ao buscar configuração." });
  }
});

// Endpoint para criar uma nova configuração
router.post("/trello", async (req, res) => {
  const { name, key, token, boardId, listId } = req.body;

  // verifica se todos os campos obrigatórios foram fornecidos
  if (!name || !key || !token || !boardId || !listId) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  //verifica se já existe uma configuração com o mesmo nome
  const existingConfig = await db("trello_configs").where({ name }).first();
  if (existingConfig) {
    return res
      .status(400)
      .json({ error: "Já existe uma configuração com esse nome." });
  }

  //insere a nova configuração no banco de dados
  try {
    const [config] = await db("trello_configs")
      .insert({ name, key, token, boardId, listId })
      .returning("*");

    res.status(201).json(config);
  } catch (err) {
    console.error("Erro ao salvar configuração Trello:", err);
    res.status(500).json({ error: "Erro ao salvar configuração" });
  }
});

// Endpoint para deletar uma configuração por ID
router.delete("/trello/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db("trello_configs").where({ id }).del();

    if (deleted) {
      res.status(200).json({ message: "Configuração removida com sucesso" });
    } else {
      res.status(404).json({ error: "Configuração não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao remover configuração Trello:", err);
    res.status(500).json({ error: "Erro ao remover configuração" });
  }
});

export default router;
