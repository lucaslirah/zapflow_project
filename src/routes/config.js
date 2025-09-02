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

// Endpoint para criar uma nova configuração
router.post("/trello", async (req, res) => {
  const { name, key, token, boardId, listId } = req.body;

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
