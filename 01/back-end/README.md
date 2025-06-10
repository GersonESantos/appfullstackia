# Aplicativo de Chat com IA Gemini

Este é um aplicativo Node.js simples que utiliza o Express.js para criar um servidor backend. Ele fornece um endpoint de chat que interage com a API Gemini do Google para gerar respostas baseadas na entrada do usuário.

## Funcionalidades

*   **Servidor Express:** Configura um servidor HTTP básico.
*   **Middleware:**
    *   `cors`: Habilita o Cross-Origin Resource Sharing (CORS) para permitir requisições de diferentes origens.
    *   `express.json()`: Analisa o corpo das requisições JSON recebidas.
    *   `express()`: Este parece ser um erro, pois `express()` já foi chamado para criar o `app`. Deveria ser `express.urlencoded({ extended: true })` se a intenção fosse analisar corpos de requisição URL-encoded, ou removido se não for necessário.
*   **Variáveis de Ambiente:** Utiliza o `dotenv` para carregar variáveis de ambiente de um arquivo `.env`. A variável `API_KEY_GEMINI` é essencial para autenticar com a API Gemini.
*   **Endpoints:**
    *   `GET /`: Rota raiz que envia uma mensagem de boas-vindas em HTML.
    *   `POST /chat`:
        *   Recebe uma mensagem do usuário no corpo da requisição (`req.body.message`).
        *   Valida se a mensagem não está vazia.
        *   Envia a mensagem do usuário para a API Gemini (`generativelanguage.googleapis.com`).
        *   Processa a resposta da API e extrai o texto gerado.
        *   Retorna a resposta da IA (ou uma mensagem padrão) como JSON.
        *   Trata erros durante a comunicação com a API Gemini.
*   **Inicialização do Servidor:** Ouve na porta `4000` (ou na porta definida pela variável `PORT`).

## Pré-requisitos

*   Node.js instalado
*   npm (ou yarn) instalado

## Configuração

1.  **Clone o repositório (se aplicável) ou crie os arquivos.**
2.  **Instale as dependências:**
    ```bash
    npm install express cors dotenv
    ```
3.  **Crie um arquivo `.env` na raiz do projeto com a sua chave da API Gemini:**
    ```env
    API_KEY_GEMINI=SUA_CHAVE_API_AQUI
    ```
    Substitua `SUA_CHAVE_API_AQUI` pela sua chave real da API Gemini.

## Como Executar

1.  **Inicie o servidor:**
    ```bash
    node app.js
    ```
    Ou, se você tiver `nodemon` instalado para desenvolvimento:
    ```bash
    nodemon app.js
    ```
2.  O servidor estará rodando em `http://localhost:4000`.

## Uso do Endpoint `/chat`

Envie uma requisição POST para `http://localhost:4000/chat` com um corpo JSON contendo a mensagem do usuário.

**Exemplo de Requisição (usando cURL):**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"message":"Olá, como você está?"}' http://localhost:4000/chat
