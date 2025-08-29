// criar endpoints para acessar o banco de dados e realizar operações CRUD
// usar expresse e router 
import express from 'express';
import db from '../../db/connection.js';

const router = express.Router();

// Endpoint para obter todas as configurações
router.get('/trello', async (req, res) => {
  try {
    const configs = await db('trello_configs').select('*').orderBy('createdAt', 'desc');
    res.status(200).json(configs);
  } catch (error) {
    console.error('Erro ao buscar configurações Trello:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

export default router;