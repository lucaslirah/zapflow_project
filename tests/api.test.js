import { jest } from '@jest/globals';
import axios from 'axios';
import {
  searchTagId,
  createCard,
  attachImageToCard
} from '../src/trello/api.js';

jest.mock('axios');

const mockCreds = {
  key: 'fake-key',
  token: 'fake-token',
  boardId: 'board123',
  listId: 'list456'
};

describe('api.js - Trello integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('searchTagId retorna ID da etiqueta correta', async () => {
    axios.get.mockResolvedValue({
      data: [{ name: 'Autorizar Dispositivo', id: 'label789' }]
    });

    const id = await searchTagId('autorizar dispositivo', mockCreds);
    expect(id).toBe('label789');
  });

  test('searchTagId retorna null se etiqueta não encontrada', async () => {
    axios.get.mockResolvedValue({ data: [] });

    const id = await searchTagId('inexistente', mockCreds);
    expect(id).toBeNull();
  });

  test('searchTagId lida com erro de rede', async () => {
    axios.get.mockRejectedValue(new Error('Erro de rede'));

    const id = await searchTagId('autorizar dispositivo', mockCreds);
    expect(id).toBeNull();
  });

  test('createCard retorna dados do cartão criado', async () => {
    const mockCard = { id: 'card123', name: 'Novo cartão' };
    axios.post.mockResolvedValue({ data: mockCard });

    const result = await createCard({
      name: 'Teste',
      idList: mockCreds.listId,
      key: mockCreds.key,
      token: mockCreds.token
    });

    expect(result).toEqual(mockCard);
  });

  test('createCard lança erro se falhar', async () => {
    axios.post.mockRejectedValue(new Error('Falha na criação'));

    await expect(
      createCard({
        name: 'Teste',
        idList: mockCreds.listId,
        key: mockCreds.key,
        token: mockCreds.token
      })
    ).rejects.toThrow('Falha na criação');
  });

  test('attachImageToCard envia imagem corretamente', async () => {
    axios.post.mockResolvedValue({ data: { id: 'attachment123' } });

    const fakeMedia = {
      mimetype: 'image/jpeg',
      data: Buffer.from('fake').toString('base64')
    };

    await attachImageToCard('card123', fakeMedia, mockCreds);

    expect(axios.post).toHaveBeenCalled();
  });

  test('attachImageToCard lança erro se falhar', async () => {
    axios.post.mockRejectedValue(new Error('Erro ao anexar'));

    const fakeMedia = {
      mimetype: 'image/jpeg',
      data: Buffer.from('fake').toString('base64')
    };

    await expect(attachImageToCard('card123', fakeMedia, mockCreds)).rejects.toThrow('Erro ao anexar');
  });
});