# AI Chat Server

## Architectural Decisions

This project is built on **Strapi** for rapid backend prototyping, providing built-in user registration and authentication functionality out of the box.

### AI Implementation Architecture

The system incorporates **two AI implementations**:

1. **Dify-based AI** (Self-deployable)
   - AI calls are routed through the server for centralized management
   - User-AI chat records are logged and stored on the server
   - Provides full conversation history tracking
   - Whe use this, please import Dify/AI RTC Demo.yml to your dify console, and modify .env file.

2. **ElevenLabs Conversation AI Agent**
   - Direct client-to-ElevenLabs communication
   - Real-time voice conversation capabilities
   - Bypasses server for direct AI interaction

### Data Model Design

Two core data tables are established:

- **AI Character Table**
  - Defines AI role characteristics and behavior
  - Contains `prompt` field as system prompt for AI models
  - Stores `agentId` for ElevenLabs Conversation AI Agent identification
  - Ensures behavioral consistency by maintaining synchronized prompts between server configuration and ElevenLabs Agent

- **Conversation Table**
  - Records user-AI interaction history
  - Tracks conversation metadata and context
  - Enables conversation continuity and analysis

### Architecture Benefits

- **Rapid Development**: Strapi's auto-generated APIs accelerate backend development
- **Scalable AI**: Dual AI implementation strategy for different use cases
- **Data Consistency**: Centralized prompt management ensures AI behavior uniformity
- **Flexible Integration**: Supports both server-mediated and direct AI communication patterns

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

## setup

### prepare dependancis
run `npm install`

### config your env
modify .env or .env.development as your need

### import data
to run this project, you should import demo data
run(with pass: fig)
`npx strapi import export_20250814101021.tar.gz.enc`


### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

