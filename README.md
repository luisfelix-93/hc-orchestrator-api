# Orquestrador de Health Check de Serviços

Este projeto é uma API orquestradora robusta, construída com Node.js e TypeScript, projetada para monitorar a saúde de múltiplos endpoints de forma contínua e automatizada. Ele utiliza um agendador de tarefas para enfileirar verificações de saúde em intervalos regulares, garantindo que os serviços monitorados estejam sempre operacionais.

## ✨ Funcionalidades Principais

- **Agendamento de Tarefas**: Utiliza `node-cron` para verificar e enfileirar tarefas de health check a cada minuto.
- **Processamento Assíncrono**: Emprega BullMQ, um sistema de fila de jobs robusto baseado em Redis, para processar as verificações de saúde de forma assíncrona.
- **Gerenciamento de Endpoints**: Armazena e gerencia os endpoints a serem monitorados em um banco de dados MongoDB.
- **Escalabilidade**: A arquitetura baseada em filas e o processamento otimizado de jobs permitem que o sistema seja escalado para monitorar um grande número de serviços com baixo consumo de memória.
- **Suíte de Testes Completa**: Inclui testes unitários e de integração para garantir a confiabilidade e a manutenibilidade do código.

## ⚙️ Otimização do Agendador

O agendador de tarefas (`src/jobs/scheduler.ts`) é um componente crítico. Para garantir que ele opere de forma eficiente e escalável, foram implementadas as seguintes otimizações:

- **Processamento com Cursor**: Em vez de carregar todos os endpoints do banco de dados para a memória de uma só vez (`EndpointModel.find()`), o sistema utiliza um **cursor**. Isso permite processar os endpoints um a um, como um fluxo, mantendo o uso de memória baixo e constante, independentemente do número de endpoints.
- **Projeção de Dados**: A consulta ao banco de dados seleciona apenas os campos estritamente necessários (`url` e `_id`), reduzindo a carga na rede e o tempo de processamento.
- **Prevenção de Sobreposição**: O agendador possui uma lógica de "lock" que impede a execução de uma nova tarefa se a anterior ainda estiver em andamento, evitando o erro de `missed execution`.

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB com Mongoose
- **Fila de Jobs**: BullMQ com Redis
- **Agendamento**: node-cron
- **Testes**: Jest, Supertest, `mongodb-memory-server`
- **Variáveis de Ambiente**: dotenv

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em sua máquina local para desenvolvimento e testes.

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm
- MongoDB
- **Redis** (essencial para a fila de jobs e para a execução dos testes de integração)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/luisfelix-93/hc-orchestrator-api
   cd dev-health-check/orchestrator-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

   ```dotenv
   # .env

   # Porta da API
   API_PORT=5000

   # Conexão com o MongoDB
   MONGO_URI=mongodb://localhost:27017/health-check-db

   # Conexão com o Redis
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   # Padrão cron para o agendador (a cada 1 minuto)
   CRON_SCHEDULE=*/1 * * * *
   ```

### Executando a Aplicação

1. **Compilar o código TypeScript:**
   ```bash
   npm run build
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

## ✅ Testes

O projeto possui uma suíte de testes completa para garantir a qualidade do código.

**Importante:** Para executar os testes de integração, é necessário ter um **servidor Redis rodando localmente** na porta configurada (padrão: 6379).

Para rodar todos os testes (unitários e de integração), execute:

```bash
npm test
```

- **Testes Unitários**: Focam em testar funções e classes de forma isolada. Eles utilizam mocks para simular dependências externas (como banco de dados e filas) e estão localizados em `__tests__/unit`.
- **Testes de Integração**: Testam a interação entre diferentes partes do sistema, como a API, o banco de dados (usando uma versão em memória) e a fila de jobs. Estão localizados em `__tests__/integration`.

## 🐳 Executando com Docker

Para um ambiente padronizado, você pode usar o Docker.

1.  **Build da Imagem:**
    ```bash
    docker build -t orchestrator-api .
    ```

2.  **Executando o Container:**
    (Certifique-se de que seu arquivo `.env` está criado na raiz do projeto)
    ```bash
    docker run -p 5000:5000 --env-file .env --name orchestrator orchestrator-api
    ```

## 📂 Estrutura do Projeto

```
/orchestrator-api
├── __tests__/              # Suíte de testes
│   ├── integration/        # Testes de integração
│   └── unit/               # Testes unitários
├── dist/                   # Código JavaScript compilado
├── node_modules/           # Dependências
└── src/                    # Código-fonte em TypeScript
    ├── api/                # Lógica da API (rotas, controllers, services, models)
    ├── config/             # Configuração da aplicação
    ├── jobs/               # Lógica de tarefas em segundo plano
    │   ├── scheduler.ts    # Agendador que enfileira as tarefas
    │   ├── queue.ts        # Configuração da fila BullMQ
    │   └── results.worker.ts # Worker que processa os resultados
    ├── lib/                # Módulos de suporte (ex: database.ts)
    ├── app.ts              # Configuração do Express
    └── index.ts            # Ponto de entrada da aplicação
```

## 📖 Endpoints da API

### Gerenciamento de Serviços (`/endpoints`)

- **`POST /endpoints`**: Adiciona um novo serviço para monitoramento.
- **`GET /endpoints`**: Lista todos os serviços monitorados.
- **`GET /endpoints/:id`**: Busca um serviço por ID.
- **`DELETE /endpoints/:id`**: Remove um serviço.

### Logs de Health Check (`/logs`)

- **`GET /logs`**: Lista os últimos 200 logs de todas as verificações.
- **`GET /logs/endpoint/:endpointId`**: Lista os últimos 200 logs para um serviço específico.