import config from "../config/env.js";
import { searchTagId, createCard, attachImageToCard } from "./api.js";

export async function createCardWithImages(session) {
  const { key, token, boardId, listId } = config.trello;

  const idEtiqueta = await searchTagId("autorizar dispositivo", {
    boardId,
    key,
    token,
  });

  const cardParams = {
    name: session.text,
    desc: "Solicitação de autorização de dispositivo",
    idList: listId,
    key,
    token,
  };

  if (idEtiqueta) cardParams.idLabels = idEtiqueta;

  const card = await createCard(cardParams);

  for (const media of session.media) {
    await attachImageToCard(card.id, media, { key, token });
  }
}
