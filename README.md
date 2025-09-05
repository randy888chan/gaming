# Gamba Demo

![image](https://github.com/BankkRoll/Gamba-V2-Next.js/assets/106103625/286c4710-c817-4157-9f1d-c5719cb58558)

> This is a mirrored repo from the [gamba monorepo](https://github.com/gamba-labs/gamba/tree/main/apps/demo).

A demo frontend featuring multiple casino games built on Gamba.

Simply provide your own wallet address to the `<Gamba />` provider and start collecting fees on every bet made on your platform.

## Quick Setup

1. [Fork this repository](https://github.com/gamba-labs/platform/generate).

2. [Connect your forked repo and deploy on Vercel](https://vercel.com/new).

3. Set up your Environment variables in the .env file. (Use .env.example as reference)

## Rewritten in Next.js

This version of the Gamba Demo has been rewritten using Next.js instead of Vite for improved performance and functionality.

## 🤖 Stigmergy Integration

This project is integrated with Stigmergy for AI-powered development coordination.

### Quick Start

1. **Start Stigmergy**: `npm run stigmergy:start`
2. **Use with Roo Code**: The MCP server (`mcp-server.js`) enables seamless integration
3. **Coordinate tasks**: Use natural language commands through Roo Code for project coordination

### Commands

- `npm run stigmergy:start` - Start Stigmergy for this project
- `npm run stigmergy:stop` - Stop Stigmergy processes
- `npm run mcp:test` - Test MCP server functionality

### Configuration

- Global settings: `/Users/user/Documents/GitHub/Stigmergy/.env`
- Project overrides: `.env.stigmergy.example` (copy to `.env` to activate)

The integration works universally without requiring project-specific modifications.
