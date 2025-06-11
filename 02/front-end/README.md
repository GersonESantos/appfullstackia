# Componente de Chat React (`App.jsx`)

Este é um componente React funcional chamado `App` que implementa uma interface de chat simples. Ele permite que os usuários enviem mensagens para um backend (presumivelmente um chatbot de IA) e exibe a conversa.

## Funcionalidades

*   **Exibição de Mensagens:** Mostra uma lista de mensagens trocadas entre o usuário e o bot.
*   **Entrada de Usuário:** Fornece um campo de texto para o usuário digitar suas mensagens.
*   **Envio de Mensagens:**
    *   Envia a mensagem do usuário para um endpoint de backend (`http://localhost:4000/chat`) via uma requisição POST.
    *   Atualiza a interface com a mensagem do usuário imediatamente.
    *   Permite o envio de mensagens clicando no botão "Enviar" ou pressionando a tecla "Enter".
*   **Feedback de Carregamento:** Exibe um indicador "Digitando..." enquanto aguarda a resposta do bot.
*   **Tratamento de Erro:** Mostra uma mensagem de erro na interface caso a comunicação com o backend falhe.

## Estrutura do Componente

### Estado (State)

O componente utiliza o hook `useState` para gerenciar três pedaços de estado:

*   `messages`: Um array de objetos, onde cada objeto representa uma mensagem no chat. Cada objeto de mensagem tem as propriedades:
    *   `sender`: String que indica quem enviou a mensagem ('user' ou 'bot').
    *   `text`: String contendo o conteúdo da mensagem.
    *   Inicializado como: `[]` (array vazio).
*   `input`: Uma string que armazena o valor atual do campo de entrada de texto do usuário.
    *   Inicializado como: `''` (string vazia).
*   `loading`: Um booleano que indica se o aplicativo está aguardando uma resposta do backend.
    *   Inicializado como: `false`.

### Funções Principais

1.  **`sendMessage = async () => { ... }`**
    *   **Validação:** Verifica se o campo `input` não está vazio (após remover espaços em branco). Se estiver vazio, a função retorna sem fazer nada.
    *   **Mensagem do Usuário:** Cria um objeto `userMessage` e o adiciona ao estado `messages`.
    *   **Limpeza e Carregamento:** Limpa o campo `input` e define `loading` como `true`.
    *   **Requisição API:**
        *   Usa `axios.post` para enviar uma requisição para `http://localhost:4000/chat`.
        *   O corpo da requisição contém `{ message: input }`.
        *   **Sucesso:** Se a requisição for bem-sucedida, cria um objeto `botMessage` com a resposta do backend (`response.data.reply`) e o adiciona ao estado `messages`.
        *   **Erro:** Se ocorrer um erro durante a requisição, adiciona uma mensagem de erro genérica (`{ sender: 'bot', text: 'Erro ao se conectar com a IA.' }`) ao estado `messages`.
    *   **Finalização:** No bloco `finally`, define `loading` de volta para `false`, independentemente do resultado da requisição.

2.  **`handleKeyPress = (e) => { ... }`**
    *   Esta função é um manipulador de eventos para o evento `onKeyDown` no campo de entrada.
    *   Verifica se a tecla pressionada foi "Enter". Se sim, chama a função `sendMessage()`.

### Renderização (JSX)

O componente renderiza a seguinte estrutura HTML:

*   Um contêiner principal (`<div className="chat-container">`).
*   Um título (`<h1 className="chat-title">`).
*   Uma área para exibir as mensagens (`<div className="messages-area">`):
    *   Mapeia o array `messages` para renderizar cada mensagem.
    *   Cada mensagem (`<div className="message">`) tem classes CSS condicionais (`user-message` ou `bot-message`) baseadas no remetente.
    *   Exibe o remetente ("Você" ou "Gemini") e o texto da mensagem.
    *   Se `loading` for `true`, exibe um indicador de carregamento (`<div className="loading-indicator">Digitando...</div>`).
*   Uma área de entrada (`<div className="input-area">`):
    *   Um campo de input (`<input type="text">`) vinculado ao estado `input` e com os manipuladores `onChange` e `onKeyDown`.
    *   Um botão "Enviar" (`<button className="send-button">`) que chama `sendMessage` ao ser clicado.

## Uso

Para usar este componente:

1.  Certifique-se de ter o `axios` instalado no seu projeto React (`npm install axios` ou `yarn add axios`).
2.  Importe o componente no arquivo desejado: `import App from './App';`
3.  Renderize o componente: `<App />`
4.  Verifique se o backend está rodando em `http://localhost:4000` e esperando requisições POST no endpoint `/chat`.
5.  O arquivo `App.css` (importado como `./App.css`) deve conter os estilos para a interface do chat.

## Dependências

*   `react` (para `useState`)
*   `axios` (para fazer requisições HTTP)

## Possíveis Melhorias

*   **Chaves Únicas:** Usar um ID único para a `key` no `messages.map()` em vez do índice `i`, especialmente se as mensagens puderem ser reordenadas ou excluídas. Um `uuid` ou um ID retornado pela API seria mais robusto.
*   **Tratamento de Erro Detalhado:** Em vez de uma mensagem de erro genérica, poderia exibir informações mais específicas do erro retornado pela API, se disponível.
*   **Variável de Ambiente para URL da API:** Mover a URL `http://localhost:4000/chat` para uma variável de ambiente para facilitar a configuração em diferentes ambientes (desenvolvimento, produção).
*   **Componentização:** Para chats mais complexos, as partes da interface (como `MessageItem`, `MessageInput`) poderiam ser divididas em componentes menores.
*   **Scroll Automático:** Implementar scroll automático para a mensagem mais recente na área de mensagens.

