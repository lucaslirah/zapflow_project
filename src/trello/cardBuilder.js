import config from '../../config/env.js';
import { searchTagId, createCard, attachImageToCard } from './api.js';

async function createCardWithImages(session) {
    const idEtiqueta = await searchTagId('autorizar dispositivo');

    const cardParams = {
        name: session.text,
        desc: 'Solicitação de autorização de dispositivo',
        idList: config.trello.listId,
        key: config.trello.key,
        token: config.trello.token,
    };

    if (idEtiqueta) cardParams.idLabels = idEtiqueta;

    const card = await createCard(cardParams);

    for (const media of session.media) {
        await attachImageToCard(card.id, media);
    }
}

export { createCardWithImages };