# 🚀 ZapFlow - Backend API

![GitHub language count](https://img.shields.io/github/languages/count/lucaslirah/zapflow_project?color=%23027d00)
![GitHub top language](https://img.shields.io/github/languages/top/lucaslirah/zapflow_project?color=%23027d00)
![GitHub last commit](https://img.shields.io/github/last-commit/lucaslirah/zapflow_project)
![License](https://img.shields.io/github/license/lucaslirah/zapflow_project)

Uma API robusta construída em Node.js para gerenciar sessões do WhatsApp Web, permitindo a criação de automações e integrações de forma simples e escalável.

---

## 📝 Visão Geral do Projeto

O **ZapFlow** é o backend de uma solução completa para automação de conversas no WhatsApp. Esta API RESTful gerencia o ciclo de vida de múltiplas sessões do WhatsApp, desde a autenticação via QR Code até o monitoramento de status, tudo de forma programática. Foi projetada para ser consumida por um painel de controle (frontend) ou qualquer outra aplicação que necessite interagir com o WhatsApp.

## ✨ Funcionalidades Principais

-   **Gerenciamento de Sessões:** Inicie, reinicie e verifique o status de múltiplas sessões de WhatsApp de forma independente.
-   **Autenticação via QR Code:** Gere QR Codes para autenticação e os disponibilize através de um endpoint da API.
-   **Gerenciamento de Configurações:** Salve e gerencie configurações de integração (como chaves de API do Trello), associando-as a sessões específicas.
-   **Estrutura Escalável:** A arquitetura do projeto é modular, facilitando a adição de novas funcionalidades e integrações.
-   **Persistência de Dados:** Utiliza um banco de dados SQLite para armazenar configurações e informações relevantes, com migrações gerenciadas pelo Knex.js.

## 💻 Tecnologias e Ferramentas

Este projeto foi construído utilizando tecnologias modernas do ecossistema JavaScript, com foco em performance e boas práticas de desenvolvimento.

| Tecnologia             | Descrição                                                                         |
| :--------------------- | :---------------------------------------------------------------------------------- |
| **Node.js** | Ambiente de execução JavaScript no servidor.                                        |
| **Express.js** | Framework minimalista para a criação da API RESTful, rotas e middlewares.           |
| **Puppeteer** | Biblioteca da Google para controlar um navegador Chrome/Chromium de forma programática. |
| **whatsapp-web.js**| Biblioteca que utiliza o Puppeteer para interagir com a API do WhatsApp Web. |
| **PostgreSQL** | Banco de dados relacional objeto, robusto e altamente escalável. |
| **AWS RDS** | Serviço de banco de dados gerenciado da Amazon para o PostgreSQL. |
| **Knex.js** | SQL Query Builder para Node.js, utilizado para gerenciar o banco de dados e migrações. |
| **Dotenv** | Módulo para carregar variáveis de ambiente de um arquivo `.env`.                    |
| **CORS** | Middleware para habilitar o Cross-Origin Resource Sharing em requisições.           |
| **Nodemon** | Ferramenta que reinicia o servidor automaticamente durante o desenvolvimento.       |

## 💡 Arquitetura e Boas Práticas

A API do ZapFlow foi desenvolvida seguindo princípios de software que garantem um código limpo, organizado e de fácil manutenção.

-   **Separação de Responsabilidades:** O código é organizado em camadas (Routes, Controllers, Services/Bot), onde cada parte tem uma única responsabilidade.
-   **Automação Realista de Navegador:** A interação com o WhatsApp Web é realizada através do **Puppeteer**, que controla uma instância do Chromium em segundo plano. Isso garante uma automação robusta e fidedigna, simulando as ações de um usuário real.
-   **Banco de Dados Robusto e Escalável:** Utiliza um banco de dados **PostgreSQL**, hospedado no serviço **AWS RDS**, para garantir a persistência e a integridade dos dados.
-   **Gerenciamento de Banco de Dados com Migrations:** O `Knex.js` é utilizado para versionar a estrutura do banco de dados, garantindo consistência entre ambientes.
-   **Segurança com Variáveis de Ambiente:** Dados sensíveis são gerenciados através de um arquivo `.env`.
-   **Código Assíncrono Moderno:** Uso extensivo de `async/await` para lidar com operações de I/O.

## 🚀 Como Instalar e Rodar o Projeto

Este projeto foi preparado para ser executado em dois ambientes distintos: um de **desenvolvimento** rápido com um banco de dados local (SQLite) e um de **produção** mais robusto (PostgreSQL). Siga o guia que melhor se adapta à sua necessidade.

---

### Opção 1: Ambiente de Desenvolvimento Rápido (com SQLite)

Ideal para testar a aplicação rapidamente, sem a necessidade de configurar um banco de dados externo.

1.  **Clone o repositório e acesse a pasta:**
    ```bash
    git clone [https://github.com/lucaslirah/zapflow_project.git](https://github.com/lucaslirah/zapflow_project.git)
    cd zapflow_project
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    -   Copie o arquivo `.env.example` para `.env`. Para o SQLite, a configuração padrão geralmente já é suficiente.
    ```bash
    cp .env.example .env
    ```

4.  **Rode as migrações do banco de dados:**
    -   Este comando criará um arquivo `zapflow.db` na pasta `db/` com todas as tabelas necessárias.
    ```bash
    npx knex migrate:latest
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    ✅ Pronto! A API estará rodando em modo de desenvolvimento, usando o banco de dados SQLite local.

---

### Opção 2: Ambiente de Produção (com PostgreSQL na AWS RDS)

Configuração recomendada para deploy ou para simular um ambiente de produção real, utilizando o PostgreSQL.

1.  **Clone o repositório e acesse a pasta:**
    ```bash
    git clone [https://github.com/lucaslirah/zapflow_project.git](https://github.com/lucaslirah/zapflow_project.git)
    cd zapflow_project
    ```

2.  **Instale as dependências, incluindo o driver do PostgreSQL:**
    ```bash
    npm install
    npm install pg
    ```

3.  **Configure as variáveis de ambiente:**
    -   Copie o arquivo `.env.example` para `.env`.
    -   Preencha as variáveis com as credenciais do seu banco de dados PostgreSQL da AWS RDS.

    **Exemplo de `.env` para PostgreSQL:**
    ```env
    PORT=3001
    APP_URL=http://localhost:3001

    # Credenciais do Banco de Dados PostgreSQL (AWS RDS)
    DB_CLIENT=pg
    DB_HOST=seu-endpoint-do-rds.rds.amazonaws.com
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_DATABASE=nome_do_seu_banco
    DB_PORT=5432
    ```

4.  **Verifique seu `knexfile.js`:**
    -   Garanta que a configuração de `production` no seu `knexfile.js` está lendo as variáveis de ambiente. Exemplo:
    ```javascript
    // knexfile.js
    production: {
      client: process.env.DB_CLIENT,
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false } // Adicione esta linha para conexões com a AWS RDS
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: `${__dirname}/src/database/migrations`
      }
    }
    ```

5.  **Rode as migrações no ambiente de produção:**
    -   Este comando irá se conectar ao seu banco na AWS e configurar as tabelas.
    ```bash
    npx knex migrate:latest --env production
    ```

6.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```
    ✅ Pronto! Sua API estará rodando conectada ao banco de dados PostgreSQL na AWS RDS.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (v16 ou superior)
-   [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
-   Acesso às credenciais do banco de dados (para a opção com PostgreSQL).

> **Nota Importante sobre o Puppeteer:**
> A biblioteca `whatsapp-web.js` fará o download automático de uma versão compatível do Chromium na primeira vez que você instalar as dependências (`npm install`). Este download pode ter entre 170MB e 280MB. Em alguns sistemas operacionais (especialmente servidores Linux sem interface gráfica), pode ser necessário instalar dependências adicionais para o Chromium funcionar corretamente.

## Endpoints da API

Abaixo estão os principais endpoints disponíveis na API.

### Configurações do Trello (`/config`)

| Método | Endpoint         | Descrição                                 |
| :----- | :--------------- | :---------------------------------------- |
| `GET`  | `/`              | Lista todas as configurações salvas.      |
| `GET`  | `/:name`         | Busca uma configuração pelo nome.         |
| `POST` | `/`              | Cria uma nova configuração.               |
| `PUT`  | `/:id`           | Atualiza uma configuração existente.      |
| `DELETE`| `/:id`          | Deleta uma configuração.                  |

**Exemplo de corpo para `POST /config`:**
```json
{
  "name": "trello-pessoal",
  "key": "sua_api_key",
  "token": "seu_api_token",
  "boardId": "id_do_quadro",
  "listId": "id_da_lista"
}
```

### Sessões do WhatsApp (`/sessions`)

| Método | Endpoint               | Descrição                                                              |
| :----- | :--------------------- | :--------------------------------------------------------------------- |
| `POST` | `/start`               | Inicia uma nova sessão de WhatsApp.                                    |
| `POST` | `/reset/:sessionId`    | Desconecta e limpa os dados de uma sessão para uma nova autenticação.  |
| `GET`  | `/status/:sessionId`   | Verifica o status atual de uma sessão (ex: `starting`, `connected`).   |
| `GET`  | `/qr/:sessionId`       | Obtém o QR Code (em base64) para autenticar uma sessão.                |

**Exemplo de corpo para `POST /sessions/start`:**
```json
{
  "sessionId": "bot-pessoal",
  "trelloConfigName": "trello-pessoal"
}
```

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ por **Lucas Lira**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lucaslirah)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-lira-dev/)
