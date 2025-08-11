require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const FormData = require('form-data');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

const sessions = new Map();

// Analisador flexível
function analisarMensagem(texto) {
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
    if (!conta && (/conta|numero/.test(linha) || /^\d{8,12}$/.test(linha))) {
      const contaTexto = linha.replace(/(conta|numero)[:\-]?\s*/i, '').trim();
      if (/^\d{8,12}$/.test(contaTexto)) conta = contaTexto;
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

// Busca etiqueta no Trello
async function buscarIdEtiqueta(nomeEtiqueta) {
  try {
    const res = await axios.get(
      `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/labels`,
      {
        params: {
          key: process.env.TRELLO_KEY,
          token: process.env.TRELLO_TOKEN
        }
      }
    );

    const etiqueta = res.data.find(label => label.name.toLowerCase() === nomeEtiqueta.toLowerCase());
    return etiqueta ? etiqueta.id : null;
  } catch (err) {
    console.error('Erro ao buscar etiquetas:', err);
    return null;
  }
}

// Fluxo principal
client.on('message', async msg => {
  const sender = msg.from;
  const texto = msg.body || '';
  const session = sessions.get(sender) || { media: [], text: null, timeout: null, cardCriado: false, triggerMsg: null };

  const dados = analisarMensagem(texto);

  if (dados.incompleto) {
    await msg.reply('❓ Qual seria a solicitação?');
    return;
  }

  if (dados.valido) {
    session.text = texto;
    session.triggerMsg = msg; // Armazena a mensagem original para referência
    sessions.set(sender, session);
    await msg.reply('✅ Solicitação reconhecida. Pode enviar as 4 imagens: frente, verso, selfie e print do erro.');

    if (session.timeout) clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
      sessions.delete(sender);
    }, 10 * 60 * 1000);

    return;
  }

  // Recebimento de imagens
  if (msg.hasMedia && session.text) {
    const media = await msg.downloadMedia();
    if (media && media.mimetype.startsWith('image')) {
      session.media.push(media);

      if (session.timeout) clearTimeout(session.timeout);
      session.timeout = setTimeout(() => {
        sessions.delete(sender);
      }, 10 * 60 * 1000);

      await msg.reply(`Imagem ${session.media.length}/4 recebida.`);

      if (session.media.length === 4 && !session.cardCriado) {
        session.cardCriado = true; // Marca que o cartão já foi criado para evitar duplicação
        try {
          const idEtiqueta = await buscarIdEtiqueta('autorizar dispositivo');

          const cardParams = {
            name: session.text,
            desc: 'Solicitação de autorização de dispositivo',
            idList: process.env.TRELLO_LIST_ID,
            key: process.env.TRELLO_KEY,
            token: process.env.TRELLO_TOKEN
          };

          if (idEtiqueta) cardParams.idLabels = idEtiqueta;

          const cardRes = await axios.post('https://api.trello.com/1/cards', null, { params: cardParams });
          const cardId = cardRes.data.id;

          for (const media of session.media) {
            const form = new FormData();
            form.append('file', Buffer.from(media.data, 'base64'), {
              filename: 'imagem.jpg',
              contentType: media.mimetype
            });

            await axios.post(`https://api.trello.com/1/cards/${cardId}/attachments`, form, {
              headers: { ...form.getHeaders() },
              params: {
                key: process.env.TRELLO_KEY,
                token: process.env.TRELLO_TOKEN
              }
            });
          }
          //responder somente à solicitação original
          if (session.triggerMsg) {
            await session.triggerMsg.reply('✅ Cartão criado com sucesso no Trello!');
          }
          
        } catch (err) {
          console.error('Erro ao criar cartão ou anexar imagens:', err);
          await msg.reply('⚠️ Erro ao processar solicitação.');

        } finally {
          if (session.timeout) clearTimeout(session.timeout);
          sessions.delete(sender);
        }
      }
    }
  }
});

// Eventos de conexão
client.on('ready', () => {
  console.log('✅ WhatsApp pronto!');
});

client.on('qr', qr => {
  console.log('📱 Escaneie este QR code para conectar o WhatsApp');
  qrcode.generate(qr, { small: true });
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', reason => {
  console.log('🔌 Desconectado:', reason);
});

client.initialize();