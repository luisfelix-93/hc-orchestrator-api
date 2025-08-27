# Orquestrador de Health Check de Serviços

Este projeto é uma API orquestradora robusta, construída com Node.js e TypeScript, projetada para monitorar a saúde de múltiplos endpoints de forma contínua e automatizada. Ele utiliza **BullMQ** para agendar e processar verificações de saúde em filas, garantindo um sistema de monitoramento eficiente e escalável.

## ✨ Funcionalidades Principais

- **Agendamento e Fila de Jobs**: Utiliza **BullMQ** com Redis para tudo:
    - Um **job repetível** agenda a verificação de todos os endpoints em intervalos configuráveis.
    - As tarefas de health check são processadas de forma assíncrona por **workers**, garantindo que a API principal não seja bloqueada.
- **Gerenciamento de Endpoints**: Armazena e gerencia os endpoints a serem monitorados em um banco de dados MongoDB.
- **Escalabilidade**: A arquitetura baseada em workers desacoplados e o processamento otimizado de jobs permitem que o sistema seja escalado para monitorar um grande número de serviços com baixo consumo de memória.
- **Suíte de Testes Completa**: Inclui testes unitários e de integração atualizados para garantir a confiabilidade e a manutenibilidade do código.

## ⚙️ Otimizações Implementadas

Para garantir que o sistema opere de forma eficiente e escalável, foram implementadas as seguintes otimizações:

- **Cache com Redis**: Para minimizar a carga no banco de dados, a lista de endpoints é armazenada em cache no Redis. O tempo de expiração é configurável (padrão de 5 minutos). O worker agendador primeiro consulta o Redis e, somente se o cache estiver expirado, ele busca os dados do MongoDB. O cache é invalidado automaticamente sempre que um endpoint é criado ou removido.
- **Workers Desacoplados**: O sistema é dividido em workers com responsabilidades únicas:
    - **Scheduler Worker**: Responsável apenas por disparar o processo de verificação em intervalos regulares.
    - **Results Worker**: Responsável por receber os resultados dos health checks e salvá-los no banco de dados.
- **Inserção de Logs em Lote**: O `Results Worker` não salva os logs no banco de dados um por um. Ele acumula os resultados em um **buffer** e os insere em lote usando `insertMany`. Isso reduz drasticamente o número de operações de escrita no banco de dados, melhorando significativamente o desempenho sob alta carga.

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB com Mongoose
- **Fila de Jobs e Agendamento**: BullMQ com Redis
- **Testes**: Jest, Supertest, `mongodb-memory-server`
- **Variáveis de Ambiente**: dotenv

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em sua máquina local para desenvolvimento e testes.

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm
- MongoDB
- **Redis** (essencial para a fila de jobs)

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

   # TTL do cache de endpoints em segundos (padrão: 300s = 5 minutos)
   REDIS_CACHE_TTL=300

   # Intervalo do agendador em milissegundos (padrão: 60000ms = 1 minuto)
   CRON_SCHEDULER=60000
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
   A aplicação iniciará a API, o agendador e os workers automaticamente.

## ✅ Testes

O projeto possui uma suíte de testes completa e atualizada para garantir a qualidade do código.

Para rodar todos os testes (unitários e de integração), execute:

```bash
npm test
```

- **Testes Unitários**: Focam em testar funções e classes de forma isolada, usando mocks para simular dependências. Estão localizados em `__tests__/unit`.
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
    │   ├── scheduler.worker.ts # Worker que agenda as tarefas de verificação
    │   ├── queue.ts          # Configuração das filas BullMQ
    │   └── results.worker.ts # Worker que processa e salva os resultados
    ├── lib/                # Módulos de suporte (ex: database.ts, redis.ts)
    ├── app.ts              # Configuração do Express
    └── index.ts            # Ponto de entrada da aplicação (inicia API e workers)
```

## 📖 Endpoints da API

### Gerenciamento de Serviços (`/api/endpoints`)

- **`POST /api/endpoints`**: Adiciona um novo serviço para monitoramento.
- **`GET /api/endpoints`**: Lista todos os serviços monitorados.
- **`GET /api/endpoints/:id`**: Busca um serviço por ID.
- **`DELETE /api/endpoints/:id`**: Remove um serviço.

### Logs de Health Check (`/api/logs`)

- **`GET /api/logs`**: Lista os últimos 200 logs de todas as verificações.
- **`GET /api/logs/:endpointId`**: Lista os logs para um serviço específico com paginação.
    -   **Query Params**:
        -   `page` (opcional): Número da página (padrão: 1).
        -   `limit` (opcional): Quantidade de logs por página (padrão: 100).