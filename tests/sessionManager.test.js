import { getSession, updateSession, clearSession } from '../src/sessions/sessionManager.js';

describe('Gerenciador de sessões', () => {
  const sender = '99999999999@c.us';

  it('cria nova sessão se não existir', () => {
    const session = getSession(sender);
    expect(session).toHaveProperty('media');
    expect(session.media).toEqual([]);
  });

  it('atualiza sessão existente', () => {
    updateSession(sender, { text: 'teste' });
    const session = getSession(sender);
    expect(session.text).toBe('teste');
  });

  it('limpa sessão corretamente', () => {
    clearSession(sender);
    const session = getSession(sender);
    expect(session.text).toBe(null);
  });
});