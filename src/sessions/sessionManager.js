const sessions = new Map();

export function getSession(sender) {
  return (
    sessions.get(sender) || {
      media: [],
      text: null,
      timeout: null,
      cardCriado: false,
      triggerMsg: null,
    }
  );
}

export function updateSession(sender, sessionData) {
  sessions.set(sender, { ...getSession(sender), ...sessionData });
}

export function clearSession(sender) {
  if (sessions.has(sender)) {
    const session = sessions.get(sender);
    if (session.timeout) clearTimeout(session.timeout);
    sessions.delete(sender);
  }
}
