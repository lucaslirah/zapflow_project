import { jest } from '@jest/globals';
import handleMessage from '../src/bot/messageHandler.js';
import * as parser from '../src/utils/parser.js';
import * as sessionManager from '../src/sessions/sessionManager.js';
import * as cardBuilder from '../src/trello/cardBuilder.js';

jest.mock('../src/utils/parser.js');
jest.mock('../src/sessions/sessionManager.js');
jest.mock('../src/trello/cardBuilder.js');

describe('messageHandler', () => {
  let mockMsg;

  beforeEach(() => {
    mockMsg = {
      from: '99999999999@c.us',
      body: '',
      hasMedia: false,
      reply: jest.fn(),
      downloadMedia: jest.fn()
    };

    sessionManager.getSession.mockReturnValue({
      media: [],
      text: null,
      cardCriado: false
    });

    sessionManager.updateSession.mockImplementation(() => {});
    sessionManager.clearSession.mockImplementation(() => {});
    cardBuilder.createCardWithImages.mockResolvedValue();

    jest.clearAllMocks();
  });

  test('responde com dúvida se dados estão incompletos', async () => {
    parser.default.mockReturnValue({ incompleto: true, valido: false });

    mockMsg.body = 'Lucas Lira\n00100001245\n60832730300';

    await handleMessage(mockMsg);

    expect(mockMsg.reply).toHaveBeenCalledWith('❓ Qual seria a solicitação?');
  });

  test('reconhece dados válidos e inicia sessão', async () => {
    parser.default.mockReturnValue({ valido: true, incompleto: false });

    mockMsg.body = 'autorizar dispositivo\nLucas Lira\n00100001245\n60832730300';

    await handleMessage(mockMsg);

    expect(sessionManager.updateSession).toHaveBeenCalled();
    expect(mockMsg.reply).toHaveBeenCalledWith(
      '✅ Solicitação reconhecida. Pode enviar as 4 imagens: frente, verso, selfie e print do erro.'
    );
  });

  test('recebe imagem e responde com progresso', async () => {
    const fakeMedia = {
      mimetype: 'image/jpeg',
      data: Buffer.from('fake').toString('base64')
    };

    parser.default.mockReturnValue({ valido: false, incompleto: false });

    mockMsg.hasMedia = true;
    mockMsg.downloadMedia.mockResolvedValue(fakeMedia);

    sessionManager.getSession.mockReturnValue({
      media: [],
      text: 'autorizar dispositivo\nLucas Lira\n00100001245\n60832730300',
      cardCriado: false
    });

    await handleMessage(mockMsg);

    expect(mockMsg.reply).toHaveBeenCalledWith('Imagem 1/4 recebida.');
  });

  test('cria cartão após 4 imagens e responde com sucesso', async () => {
    const fakeMedia = {
      mimetype: 'image/jpeg',
      data: Buffer.from('fake').toString('base64')
    };

    parser.default.mockReturnValue({ valido: false, incompleto: false });

    mockMsg.hasMedia = true;
    mockMsg.downloadMedia.mockResolvedValue(fakeMedia);

    const session = {
      media: [fakeMedia, fakeMedia, fakeMedia],
      text: 'autorizar dispositivo\nLucas Lira\n00100001245\n60832730300',
      cardCriado: false,
      triggerMsg: mockMsg
    };

    sessionManager.getSession.mockReturnValue(session);

    await handleMessage(mockMsg);

    expect(cardBuilder.createCardWithImages).toHaveBeenCalledWith(expect.objectContaining({ media: expect.any(Array) }));
    expect(mockMsg.reply).toHaveBeenCalledWith('✅ Cartão criado com sucesso no Trello!');
    expect(sessionManager.clearSession).toHaveBeenCalledWith(mockMsg.from);
  });

  test('ignora mídia se download falhar (media === null)', async () => {
  parser.default.mockReturnValue({ valido: false, incompleto: false });

  mockMsg.hasMedia = true;
  mockMsg.downloadMedia.mockResolvedValue(null); // simula falha no download

  sessionManager.getSession.mockReturnValue({
    media: [],
    text: 'autorizar dispositivo\nLucas Lira\n00100001245\n60832730300',
    cardCriado: false
  });

  await handleMessage(mockMsg);

  expect(mockMsg.reply).not.toHaveBeenCalled(); // não deve responder
  expect(sessionManager.updateSession).not.toHaveBeenCalled();
});

test('ignora mídia se tipo não for imagem', async () => {
  const fakeMedia = {
    mimetype: 'application/pdf', // tipo inválido
    data: Buffer.from('fake').toString('base64')
  };

  parser.default.mockReturnValue({ valido: false, incompleto: false });

  mockMsg.hasMedia = true;
  mockMsg.downloadMedia.mockResolvedValue(fakeMedia);

  sessionManager.getSession.mockReturnValue({
    media: [],
    text: 'autorizar dispositivo\nLucas Lira\n00100001245\n60832730300',
    cardCriado: false
  });

  await handleMessage(mockMsg);

  expect(mockMsg.reply).not.toHaveBeenCalled(); // não deve responder
  expect(sessionManager.updateSession).not.toHaveBeenCalled();
});
});