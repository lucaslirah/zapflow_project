import config from '../../config/env.js';
import axios from 'axios';
import FormData from 'form-data';

// Busca etiqueta no Trello
async function searchTagId(nomeEtiqueta) {
  try {
    const res = await axios.get(
      `https://api.trello.com/1/boards/${config.trello.boardId}/labels`,
      {
        params: {
          key: config.trello.key,
          token: config.trello.token
        }
      }
    );

    const etiqueta = res.data.find(label => label.name.toLowerCase() === nomeEtiqueta.toLowerCase());
    return etiqueta ? etiqueta.id : null;
  } catch (err) {
    console.error('Erro ao buscar etiquetas:', err);
    return null;
  }
}

// Cria cartão no Trello
async function createCard(params) {
  try {
    const res = await axios.post('https://api.trello.com/1/cards', null, { params });
    return res.data;
  } catch (err) {
    console.error('Erro ao criar cartão:', err);
    throw err;
  }
}

// Anexa imagem ao cartão
async function attachImageToCard(cardId, media) {
  const form = new FormData();
  form.append('file', Buffer.from(media.data, 'base64'), {
    filename: 'imagem.jpg',
    contentType: media.mimetype
  });

  await axios.post(`https://api.trello.com/1/cards/${cardId}/attachments`, form, {
    headers: { ...form.getHeaders() },
    params: {
      key: config.trello.key,
      token: config.trello.token,
    }
  });
}

export {
    searchTagId,
    createCard,
    attachImageToCard
}
