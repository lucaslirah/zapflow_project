import wweb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import handleMessage from './messageHandler.js';

function initializeClient() {// Configuração do cliente WhatsApp
    const { Client, LocalAuth } = wweb;
    const client = new Client({
    authStrategy: new LocalAuth()
    });

    // Eventos de conexão
    client.on('qr', qr => {
    console.log('📱 Escaneie este QR code para conectar o WhatsApp');
    qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
    console.log('✅ WhatsApp pronto!');
    });

    client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
    });

    client.on('disconnected', reason => {
    console.log('🔌 Desconectado:', reason);
    });

    client.on('message', msg => handleMessage(msg, client));

    console.log('🔄 Inicializando cliente WhatsApp...');
    client.initialize();
}

export default initializeClient;