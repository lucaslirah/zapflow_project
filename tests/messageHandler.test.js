// tests/messageHandler.test.js
import { jest } from '@jest/globals';
import handleMessage from '../src/bot/messageHandler.js';

describe('handleMessage (ESM)', () => {
  let mockClient;
  let mockMsg;

  beforeEach(() => {
    mockClient = {
      sendText: jest.fn(),
      sendImage: jest.fn(),
    };

    mockMsg = {
      body: '',
      from: '123456789@c.us',
    };
  });

  test('responde com texto simples', async () => {
    mockMsg.body = 'Oi';

    await handleMessage(mockMsg, mockClient);

    expect(mockClient.sendText).toHaveBeenCalledWith(
      mockMsg.from,
      expect.stringMatching(/Olá|Oi|Bem-vindo/)
    );
  });

  test('responde com imagem quando solicitado', async () => {
    mockMsg.body = 'me manda uma imagem';

    await handleMessage(mockMsg, mockClient);

    expect(mockClient.sendImage).toHaveBeenCalled();
  });

  test('ignora mensagens vazias', async () => {
    mockMsg.body = '';

    await messageHandler(mockMsg, mockClient);

    expect(mockClient.sendText).not.toHaveBeenCalled();
    expect(mockClient.sendImage).not.toHaveBeenCalled();
  });
});