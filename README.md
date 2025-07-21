# Orquestrador de Health Check de Serviços

Este projeto é uma API orquestradora robusta, construída com Node.js e TypeScript, projetada para monitorar a saúde de múltiplos endpoints de forma contínua e automatizada. Ele utiliza um agendador de tarefas para enfileirar verificações de saúde em intervalos regulares, garantindo que os serviços monitorados estejam sempre operacionais.

## ✨ Funcionalidades Principais

- **Agendamento de Tarefas**: Utiliza `node-cron` para verificar e enfileirar tarefas de health check a cada minuto.
- **Processamento Assíncrono**: Emprega um sistema de fila de jobs (como BullMQ) para processar as verificações de saúde de forma assíncrona, sem bloquear a aplicação principal.
- **Gerenciamento de Endpoints**: Armazena e gerencia os endpoints a serem monitorados em um banco de dados (provavelmente MongoDB, com base no uso de `EndpointModel`).
- **Escalabilidade**: A arquitetura baseada em filas permite que o sistema seja escalado para monitorar um grande número de serviços.
- **Configuração Flexível**: Usa variáveis de ambiente (`.env`) para facilitar a configuração em diferentes ambientes (desenvolvimento, produção, etc.).

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js
- **Linguagem**: TypeScript
- **Agendamento**: node-cron
- **Fila de Jobs**: (Inferido) BullMQ ou similar para gerenciar tarefas em segundo plano.
- **Banco de Dados**: (Inferido) MongoDB com Mongoose para modelagem de dados.
- **Variáveis de Ambiente**: dotenv

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em sua máquina local para desenvolvimento e testes.

### Pré-requisitos

Você precisará ter o seguinte software instalado em sua máquina:

- Node.js (versão 18.x ou superior recomendada)
- npm ou yarn
- Um banco de dados MongoDB
- Um servidor Redis (para a fila de jobs)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd dev-health-check/orchestrator-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo chamado `.env` na raiz da pasta `orchestrator-api` e adicione as seguintes variáveis, ajustando os valores conforme necessário.

   ```dotenv
   # .env

   # Configurações do Servidor
   PORT=3001

   # Conexão com o Banco de Dados (MongoDB)
   DATABASE_URL=mongodb://localhost:27017/dev-health-check

   # Conexão com o Redis (para a fila de jobs)
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

### Executando a Aplicação

1. **Compilar o código TypeScript (se necessário):**
   ```bash
   npm run build
   ```

2. **Iniciar o servidor em modo de produção:**
   O servidor iniciará, e o agendador começará a funcionar imediatamente.
   ```bash
   npm start
   ```

3. **Executar em modo de desenvolvimento (com hot-reload):**
   Se você tiver um script `dev` configurado com `ts-node-dev` ou `nodemon`.
   ```bash
   npm run dev
   ```

   npm run dev
   ```

## 🐳 Executando com Docker

Você também pode executar a aplicação usando Docker para um ambiente padronizado e isolado.

### Pré-requisitos

- Docker instalado na sua máquina.

### Build da Imagem

Na raiz do projeto `orchestrator-api`, execute o seguinte comando para construir a imagem Docker:
```bash
docker build -t orchestrator-api .
```

### Executando o Container

Após o build, inicie o container. Certifique-se de que seu arquivo `.env` está configurado corretamente, pois ele será usado para passar as variáveis de ambiente para o container.
```bash
docker run -p 5000:5000 --env-file .env --name orchestrator orchestrator-api
```


## 📂 Estrutura do Projeto

```
/orchestrator-api
├── dist/                   # Código JavaScript compilado
├── node_modules/           # Dependências do projeto
└── src/                    # Código-fonte em TypeScript
    ├── api/                # Lógica da API (rotas, controllers, models)
    │   └── endpoints/
    │       └── endpoint.model.ts # Modelo de dados para os endpoints
    └── jobs/               # Lógica de tarefas em segundo plano
        ├── scheduler.ts    # Agendador que enfileira as tarefas
        ├── queue.ts        # Configuração da fila de jobs
        └── worker.ts       # (Opcional) Processador que executa as tarefas da fila
```


## 📖 Endpoints da API

A API fornece endpoints para gerenciar os serviços a serem monitorados e para consultar os logs de health check.

*(Nota: A implementação desses endpoints precisa ser criada na pasta `src/api/`)*

### Gerenciamento de Serviços (`/endpoints`)

- **`POST /endpoints`**: Adiciona um novo serviço para monitoramento.
  - **Corpo da Requisição:**
    ```json
    {
      "name": "API de Pagamentos",
      "url": "https://api.pagamentos.com/health"
    }
    ```
  - **Resposta de Sucesso (201 Created):**
    ```json
    {
      "id": "60c72b2f9b1d8c001f8e4c6a",
      "name": "API de Pagamentos",
      "url": "https://api.pagamentos.com/health"
    }
    ```

- **`GET /endpoints`**: Lista todos os serviços monitorados.
  - **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "60c72b2f9b1d8c001f8e4c6a",
        "name": "API de Pagamentos",
        "url": "https://api.pagamentos.com/health"
      }
    ]
    ```

### Logs de Health Check (`/logs`)

- **`GET /logs/endpoint/:endpointId`**: Lista os logs de health check para um serviço específico.
  - **Parâmetros da URL:**
    - `endpointId`: O ID do serviço a ser consultado.
  - **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": "60c72b4f9b1d8c001f8e4c6c",
        "status": "Online",
        "statusCode": 200,
        "responseTimeInMs": 120,
        "endpointId": "60c72b2f9b1d8c001f8e4c6a",
        "createdAt": "2023-10-27T10:00:00.000Z"
      }
    ]
    ```


