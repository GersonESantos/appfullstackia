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

## O que é e para que serve o `app.js`?

O arquivo `app.js` é um **servidor backend** construído com Node.js e a framework Express.js. Sua principal finalidade é atuar como uma ponte entre uma interface de usuário (frontend) e a API de inteligência artificial do Google Gemini.

**Principais Funcionalidades:**

1.  **Servidor Web:**
    *   Utiliza o Express.js para criar um servidor HTTP que escuta por requisições em uma porta específica (definida como `PORT`, com padrão 4000).

2.  **Middleware:**
    *   `cors`: Permite que o servidor receba requisições de diferentes origens (domínios), o que é essencial quando o frontend e o backend estão hospedados separadamente.
    *   `express.json()`: Habilita o servidor a interpretar corpos de requisição no formato JSON.
    *   `express()`: Esta linha (`app.use(express())`) parece ser um erro de digitação ou redundância, pois `app` já é uma instância do Express. Se a intenção fosse parsear dados de formulário URL-encoded, deveria ser `express.urlencoded({ extended: true })`.

3.  **Gerenciamento de Variáveis de Ambiente:**
    *   Usa o pacote `dotenv` para carregar variáveis de ambiente de um arquivo `.env`. A variável `API_KEY_GEMINI` é crucial, pois armazena a chave de API necessária para autenticar e interagir com o serviço Gemini.

4.  **Definição de Rotas (Endpoints):**
    *   **`GET /`**: Uma rota raiz simples que envia uma mensagem de boas-vindas em HTML quando acessada.
    *   **`POST /chat`**: Este é o endpoint principal para a funcionalidade de chat.
        *   **Recebe Mensagens:** Espera uma requisição POST contendo uma mensagem do usuário no corpo (`req.body.message`).
        *   **Validação:** Verifica se a mensagem recebida não está vazia.
        *   **Interação com a IA Gemini:**
            *   Constrói a URL para a API do Gemini, incluindo a `API_KEY_GEMINI`.
            *   Envia a mensagem do usuário para o modelo `gemini-2.0-flash` da API Gemini usando uma requisição `fetch` do tipo POST.
            *   Formata o corpo da requisição para o padrão esperado pela API Gemini.
        *   **Processamento da Resposta:**
            *   Aguarda a resposta da API Gemini.
            *   Extrai o texto da resposta gerada pela IA (`data.candidates?.[0]?.content?.parts?.[0]?.text`).
        *   **Envio da Resposta ao Cliente:** Retorna a resposta da IA (ou uma mensagem padrão, caso não haja resposta) para o cliente em formato JSON.
        *   **Tratamento de Erros:** Captura e trata possíveis erros durante a comunicação com a API Gemini ou se a mensagem do usuário estiver vazia, retornando respostas de erro apropriadas com códigos de status HTTP.

5.  **Inicialização do Servidor:**
    *   Inicia o servidor para escutar na porta configurada, exibindo uma mensagem no console quando estiver pronto.

**Em resumo, `app.js` serve como o cérebro intermediário da aplicação de chat:** ele não é a IA em si, mas é responsável por receber as perguntas do usuário, enviá-las para a IA do Gemini, obter as respostas e devolvê-las ao usuário de forma organizada e segura.
