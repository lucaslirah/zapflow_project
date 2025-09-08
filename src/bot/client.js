import fs from "fs/promises";
import path from "path";
import wweb from "whatsapp-web.js";
import { EventEmitter } from "events"; // Importa o EventEmitter
import handleMessage from "./messageHandler.js";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const { Client, LocalAuth } = wweb;

puppeteer.use(StealthPlugin());

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

    //Iniciar o navegador camuflado primeiro
    const browser = await puppeteer.launch({
      // headless: false,
      // executablePath:
      //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log(`[${this.sessionId}] Navegador camuflado iniciado.`);

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.sessionId,
        dataPath: sessionPath,
      }),
      puppeteer: {
        browserWSEndpoint: browser.wsEndpoint(), // Conecta ao navegador existente
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

      try {
        // 1. ESSENCIAL: Chamar destroy() PRIMEIRO para salvar a sessão no disco.
        await this.client.destroy();
        console.log(`[${this.sessionId}] Sessão salva com sucesso.`);
      } catch (e) {
        console.error(
          `[${this.sessionId}] Erro ao destruir o cliente:`,
          e.message
        );
      }

      try {
        // 2. Fechar o navegador que iniciámos manualmente.
        await browser.close();
        console.log(`[${this.sessionId}] Navegador fechado.`);
      } catch (e) {
        console.error(
          `[${this.sessionId}] Erro ao fechar o navegador:`,
          e.message
        );
      }

      // 3. LÓGICA CONDICIONAL: Apenas limpa a pasta se o logout foi feito pelo utilizador.
      // Isto permite que a sessão seja restaurada se o servidor apenas reiniciar.
      if (reason === "LOGOUT" || reason === "UNPAIRED") {
        try {
          await fs.rm(sessionPath, { recursive: true, force: true });
          console.log(
            `[${this.sessionId}] Pasta de sessão limpa devido a logout.`
          );
        } catch (error) {
          console.error(
            `[${this.sessionId}] Erro ao limpar a pasta de sessão:`,
            error
          );
        }
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
      await browser.close(); // Garante que o navegador feche em caso de erro
      this.emit("init_failure", { sessionId: this.sessionId, error });
    }
  }
}
