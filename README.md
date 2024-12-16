# AI Agent Sandbox

## Overview

A chat application where generative AI retrieves Tools through an MCP server and utilizes them to provide output.

## Setup

1. Install dependencies

```shell
npm install
```

1. Set Anthropic API Key

```shell
cp ./server/.env.example .env
```

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

1. Set OpenWeather API Key

```shell
cp ./mcp-server/.env.example .env
```

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

1. Run Applications

```shell
npm run dev -w mcp-server
npm run dev -w server
npm run dev -w client
```
