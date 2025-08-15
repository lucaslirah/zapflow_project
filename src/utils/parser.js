// Analisador flexível
function analyseMessage(texto) {
  const normalizado = texto.toLowerCase().replace(/[^\w\s]/gi, '');
  const linhas = normalizado.split('\n').map(l => l.trim()).filter(Boolean);

  const temTitulo = linhas.some(l => l.includes('autorizar dispositivo'));

  let nome = null;
  let conta = null;
  let cpf = null;

  for (const linha of linhas) {
    // Nome com ou sem rótulo
    if (!nome && (/nome/.test(linha) || /^[a-zà-ÿ\s]{5,}$/.test(linha))) {
      const partes = linha.replace(/nome[:\-]?\s*/i, '').trim().split(/\s+/);
      if (partes.length >= 2 && partes.every(p => isNaN(p))) {
        nome = partes.join(' ');
      }
    }

// Conta com ou sem rótulo
    if (
      !conta &&
      (
        /conta|numero/.test(linha) ||
        /^\d{8,12}$/.test(linha) ||
        // Aceita formatos de telefone comuns
        /^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/.test(linha)
      )
    ) {
      const contaTexto = linha.replace(/(conta|numero)[:\-]?\s*/i, '').trim();
      // Aceita número puro, telefone com ou sem DDD, com hífen, espaço ou parênteses
      if (
        /^\d{8,12}$/.test(contaTexto) ||
        /^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/.test(contaTexto)
      ) conta = contaTexto;
    }

    // CPF com ou sem rótulo
    if (!cpf && (/cpf/.test(linha) || /^\d{11}$/.test(linha))) {
      const cpfTexto = linha.replace(/cpf[:\-]?\s*/i, '').trim();
      if (/^\d{11}$/.test(cpfTexto)) cpf = cpfTexto;
    }
  }

  const valido = temTitulo && nome && conta && cpf;
  const incompleto = nome && conta && cpf && !temTitulo;

  return { valido, incompleto, nome, conta, cpf };
}

export default analyseMessage;