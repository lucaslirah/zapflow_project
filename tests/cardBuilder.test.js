// tests/cardBuilder.test.js
import { createCardWithImages } from '../src/trello/cardBuilder.js';
import {describe, it, expect, beforeEach, jest} from '@jest/globals'
import * as api from '../src/trello/api.js';
import config from '../config/env.js';

jest.mock('../src/trello/api.js');

describe('createCardWithImages', () => {
  const mockSession = {
    text: 'Solicitação de Autorizar dispositivo',
    media: [
      { mimetype: 'image/png', data: 'image-data-1' },
      { mimetype: 'image/jpeg', data: 'image-data-2' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria cartão com etiqueta e anexa imagens', async () => {
    api.searchTagId.mockResolvedValue('label123');
    api.createCard.mockResolvedValue({ id: 'card456' });
    api.attachImageToCard.mockResolvedValue(true);

    await createCardWithImages(mockSession);

    expect(api.searchTagId).toHaveBeenCalledWith('autorizar dispositivo', expect.objectContaining({
        boardId: expect.any(String),
        key: expect.any(String),
        token: expect.any(String)
      })
    );
    expect(api.createCard).toHaveBeenCalledWith(expect.objectContaining({
      name: mockSession.text,
      idLabels: 'label123',
      idList: config.trello.listId,
    }));
    expect(api.attachImageToCard).toHaveBeenCalledTimes(2);
    expect(api.attachImageToCard).toHaveBeenCalledWith(
      'card456',
      mockSession.media[0],
      expect.objectContaining({ key: expect.any(String), token: expect.any(String) })
    );
    expect(api.attachImageToCard).toHaveBeenCalledWith(
      'card456',
      mockSession.media[1],
      expect.objectContaining({ key: expect.any(String), token: expect.any(String) })
    );
  });

  it('cria cartão sem etiqueta se não encontrada', async () => {
    api.searchTagId.mockResolvedValue(null);
    api.createCard.mockResolvedValue({ id: 'card789' });

    await createCardWithImages(mockSession);

    expect(api.createCard).toHaveBeenCalledWith(expect.not.objectContaining({ idLabels: expect.anything() }));
  });

  it('não anexa imagens se session.media estiver vazio', async () => {
    const sessionSemMedia = { ...mockSession, media: [] };
    api.searchTagId.mockResolvedValue('label123');
    api.createCard.mockResolvedValue({ id: 'card000' });

    await createCardWithImages(sessionSemMedia);

    expect(api.attachImageToCard).not.toHaveBeenCalled();
  });
});