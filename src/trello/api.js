import axios from 'axios';

const TRELLO_BASE = 'https://api.trello.com/1';

export async function searchTagId(tagName, { boardId, key, token }) {
  try {
    const res = await axios.get(`${TRELLO_BASE}/boards/${boardId}/labels`, {
      params: { key, token }
    });

    const etiqueta = res.data.find(label => label.name.toLowerCase() === tagName.toLowerCase());
    return etiqueta ? etiqueta.id : null;
  } catch (err) {
    console.error('Erro ao buscar etiquetas:', err);
    return null;
  }
}

export async function createCard(params) {
  try {
    const res = await axios.post(`${TRELLO_BASE}/cards`, null, { params });
    return res.data;
  } catch (err) {
    console.error('Erro ao criar cartão:', err);
    throw err;
  }
}

export async function attachImageToCard(cardId, media, { key, token }) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', Buffer.from(media.data, 'base64'), {
    filename: 'imagem.jpg',
    contentType: media.mimetype
  });

  try {
    await axios.post(`${TRELLO_BASE}/cards/${cardId}/attachments`, form, {
      headers: form.getHeaders(),
      params: { key, token }
    });
  } catch (err) {
    console.error('Erro ao anexar imagem:', err);
    throw err;
  }
}