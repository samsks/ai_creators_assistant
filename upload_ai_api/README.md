# AI Creators Assistant - Backend

AI Creators Assistant é uma aplicação que auxilia criadores de conteúdo com a transcrição e geração de texto automática. Este repositório contém o código do backend da aplicação.

## Tecnologias utilizadas

- Fastify: um framework web eficiente para construção de APIs.
- Prisma: um ORM para manipulação de banco de dados.
- OpenAI: uma biblioteca para interação com a API da OpenAI.

## Estrutura do Projeto

O projeto está estruturado da seguinte forma:

- `src/`: Contém o código fonte do projeto.
- `routes/`: Contém as rotas da aplicação.
- `lib/`: Contém bibliotecas auxiliares.
- `prisma/`: Contém a configuração do Prisma.

## Configuração

Para configurar o projeto, siga os seguintes passos:

1. Clone o repositório para sua máquina local.
2. Instale as dependências com o comando `npm install`.
3. Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e preencha as variáveis de ambiente necessárias.
4. Execute o comando `npm run dev` para iniciar o servidor em modo de desenvolvimento.

## API Endpoints

A API possui os seguintes endpoints:

- `/prompts`: Endpoint para manipulação de prompts.
- `/videos`: Endpoint para manipulação de vídeos.
- `/ai`: Endpoint para interação com a API da OpenAI.

## Contribuição

Contribuições são sempre bem-vindas. Se você encontrar algum problema ou tiver uma sugestão, sinta-se à vontade para abrir uma issue ou um pull request.
