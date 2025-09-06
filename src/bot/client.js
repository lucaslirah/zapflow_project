import fs from "fs/promises";
import path from "path";
import wweb from "whatsapp-web.js";
import { EventEmitter } from "events"; // Importa o EventEmitter
import handleMessage from "./messageHandler.js";

const { Client, LocalAuth } = wweb;

// A nossa classe herda de EventEmitter para poder emitir eventos
export class WhatsAppClient extends EventEmitter {
  constructor(sessionId, trelloConfig) {
    super(); // Chama o construtor da classe pai (EventEmitter)
    this.sessionId = sessionId;
    this.client = null;
    this.trelloConfig = trelloConfig;
  }

  async initialize() {
    console.log(`[${this.sessionId}] A inicializar sessão...`);
    const sessionPath = path.resolve(
      process.cwd(),
      ".wwebjs_auth",
      `session-${this.sessionId}`
    );

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.sessionId,
        dataPath: sessionPath,
      }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.on("qr", (qr) => {
      console.log(`[${this.sessionId}] QR Code gerado.`);
      this.emit("qr", { sessionId: this.sessionId, qr });
    });

    this.client.on("ready", () => {
      console.log(`[${this.sessionId}] Cliente pronto e conectado!`);
      this.emit("ready", { sessionId: this.sessionId });
    });

    this.client.on("disconnected", async (reason) => {
      console.log(`[${this.sessionId}] Cliente desconectado:`, reason);

      // Limpar dados de autenticação ao desconectar
      try{
        await this.client.destroy();
        console.log(`[${this.sessionId}] Cliente destruído com sucesso.`);
      } catch(error) {
        console.warn(`[${this.sessionId}] Erro ao destruir o cliente (provavelmente já estava fechado):`, error.message);
      }

      try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`[${this.sessionId}] Pasta de sessão limpa com sucesso.`);
      } catch (error) {
        console.error(`[${this.sessionId}] Erro ao limpar a pasta de sessão:`, error);
      }
      
      this.emit("disconnected", { sessionId: this.sessionId, reason });
    });

    // Adicione o seu message handler aqui
    this.client.on("message", (msg) => {
      // configuração do manager
      handleMessage(msg, this.client, this.trelloConfig);
    });

    try {
      await this.client.initialize();
    } catch (error) {
      console.error(`[${this.sessionId}] Falha na inicialização:`, error);
      this.emit("init_failure", { sessionId: this.sessionId, error });
    }
  }
}
