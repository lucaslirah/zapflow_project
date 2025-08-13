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

## ⚙️ Configuração da API do Trello

Antes de executar o projeto, você precisa obter as credenciais da API do Trello para que o script consiga criar e atualizar cartões. Siga os passos abaixo:

### 1. Obter a Chave da API (TRELLO_KEY)
- Acesse: [https://trello.com/app-key](https://trello.com/app-key)
- Faça login com sua conta Trello.
- Copie a chave exibida (API Key).

### 2. Gerar o Token de Acesso (TRELLO_TOKEN)
- Na mesma página, clique no link para gerar o token.
- Autorize o acesso para o seu aplicativo.
- Copie o token gerado.

### 3. Obter o ID do Quadro (TRELLO_BOARD_ID)
- Abra o quadro do Trello que você vai usar.
- Na URL, copie o trecho que aparece após `/b/`. Exemplo:
```

[https://trello.com/b/abcdefgh/nome-do-quadro](https://trello.com/b/abcdefgh/nome-do-quadro)

```
Aqui, `abcdefgh` é o seu BOARD_ID.

### 4. Obter o ID da Lista (TRELLO_LIST_ID)
- Para listar as listas do quadro, faça uma requisição à API:

```

GET [https://api.trello.com/1/boards/{BOARD\_ID}/lists?key={TRELLO\_KEY}\&token={TRELLO\_TOKEN}](https://api.trello.com/1/boards/{BOARD_ID}/lists?key={TRELLO_KEY}&token={TRELLO_TOKEN})

````

- Essa chamada retorna um JSON com as listas e seus IDs.
- Copie o ID da lista onde deseja criar os cartões.

---

## 💡 Usando Variáveis de Ambiente

É recomendado não deixar suas chaves diretamente no código. Use variáveis de ambiente para armazenar essas informações com segurança.

### Exemplo de variáveis no Linux/macOS (bash):

```bash
export TRELLO_KEY="sua_chave_aqui"
export TRELLO_TOKEN="seu_token_aqui"
export TRELLO_BOARD_ID="seu_board_id"
export TRELLO_LIST_ID="sua_list_id"
````

### Exemplo no Windows PowerShell:

```powershell
setx TRELLO_KEY "sua_chave_aqui"
setx TRELLO_TOKEN "seu_token_aqui"
setx TRELLO_BOARD_ID "seu_board_id"
setx TRELLO_LIST_ID "sua_list_id"
```

### Como usar no código (Node.js):

```javascript
const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BOARD_ID = process.env.TRELLO_BOARD_ID;
const LIST_ID = process.env.TRELLO_LIST_ID;
```

---

## 📝 Arquivo `.env` (recomendado)

Você pode criar um arquivo `.env` para armazenar essas variáveis localmente. Use o pacote `dotenv` para carregar:

**.env**

```
TRELLO_KEY=sua_chave_aqui
TRELLO_TOKEN=seu_token_aqui
TRELLO_BOARD_ID=seu_board_id
TRELLO_LIST_ID=sua_list_id
```

No código, carregue assim:

```javascript
require('dotenv').config();
```

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
