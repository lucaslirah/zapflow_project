import analyseMessage from '../utils/parser.js';
import { getSession, updateSession, clearSession } from '../sessions/sessionManager.js';
import { createCardWithImages } from '../trello/cardBuilder.js';

// fluxo principal
async function handleMessage(msg, client){
    const sender = msg.from;
    const text = msg.body || '';
    const session = getSession(sender);
    const data = analyseMessage(text);

    if (data.incompleto) {
        await msg.reply('❓ Qual seria a solicitação?');
        return;
    }

    if (data.valido) {

        updateSession(sender, { text, triggerMsg: msg, cardCriado: false, media: [] }); 

        await msg.reply('✅ Solicitação reconhecida. Pode enviar as 4 imagens: frente, verso, selfie e print do erro.');

        return;
    }

    // Recebimento de imagens
    if (msg.hasMedia && session.text) {
        const media = await msg.downloadMedia();

        if (media && media.mimetype.startsWith('image')) {
            session.media.push(media);

            updateSession(sender, session);

            await msg.reply(`Imagem ${session.media.length}/4 recebida.`);

            if (session.media.length === 4 && !session.cardCriado) {
                session.cardCriado = true; // Marca que o cartão já foi criado para evitar duplicação
                await createCardWithImages(session);
                await msg.reply('✅ Cartão criado com sucesso no Trello!');
                clearSession(sender); // Limpa a sessão após criar o cartão
            }
        }
    }
}

export default handleMessage;