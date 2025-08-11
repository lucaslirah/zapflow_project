# 🚀 ZapFlow Project

**ZapFlow** é um sistema de automação que conecta o WhatsApp ao Trello, permitindo que usuários enviem informações estruturadas e imagens via WhatsApp, que são então processadas e transformadas em cartões organizados no Trello.

---

## 📦 Funcionalidades

- Recebimento de mensagens e mídias via WhatsApp
- Reconhecimento de dados estruturados (nome, conta, CPF)
- Criação automática de cartões no Trello com etiquetas e anexos
- Gerenciamento de sessões por usuário com timeout
- Fluxo seguro e escalável para múltiplos tipos de solicitação

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **whatsapp-web.js**
- **Trello API**
- **dotenv**
- **axios**
- **FormData**

---



---

## 🧪 Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/zapflow_project.git
   cd zapflow_project
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com suas credenciais do Trello e sessão do WhatsApp.

4. Inicie o projeto:
   ```bash
   node src/index.js
   ```

---

## 📌 Próximos Passos

- Refatorar a estrutura de pastas para melhor separação de responsabilidades
- Implementar testes automatizados
- Adicionar suporte a múltiplos fluxos de entrada
- Criar documentação técnica detalhada

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---
