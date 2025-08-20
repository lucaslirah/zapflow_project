import { getSession, updateSession, clearSession } from '../src/sessions/sessionManager.js';

describe('sessionManager', () => {
  const sender = '99999999999@c.us';

  beforeEach(() => {
    clearSession(sender);
  });

  test('cria nova sessão se não existir', () => {
    const session = getSession(sender);
    expect(session).toEqual({
      media: [],
      text: null,
      timeout: null,
      cardCriado: false,
      triggerMsg: null
    });
  });

  test('atualiza sessão existente com novos dados', () => {
    updateSession(sender, { text: 'teste', cardCriado: true });
    const session = getSession(sender);
    expect(session.text).toBe('teste');
    expect(session.cardCriado).toBe(true);
  });

  test('mantém dados anteriores ao atualizar parcialmente', () => {
    updateSession(sender, { text: 'inicial' });
    updateSession(sender, { cardCriado: true });
    const session = getSession(sender);
    expect(session.text).toBe('inicial');
    expect(session.cardCriado).toBe(true);
  });

  test('clearSession remove sessão sem timeout', () => {
    updateSession(sender, { text: 'teste' });
    clearSession(sender);
    const session = getSession(sender);
    expect(session.text).toBe(null);
  });

  test('clearSession limpa timeout se existir', () => {
    const fakeTimeout = setTimeout(() => {}, 1000);
    updateSession(sender, { timeout: fakeTimeout });
    clearSession(sender);
    const session = getSession(sender);
    expect(session.timeout).toBe(null);
  });

  test('clearSession ignora sender inexistente sem erro', () => {
    expect(() => clearSession('inexistente@c.us')).not.toThrow();
  });
});