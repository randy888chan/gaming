# Quantum Nexus API Documentation

## Overview
This document provides an overview of the Quantum Nexus REST API. For detailed endpoint specifications, see the [OpenAPI documentation](./openapi.yaml).

## Authentication
- All authenticated endpoints require a Bearer token
- Tokens are obtained through Particle Network authentication
- Include token in `Authorization` header: `Bearer <token>`

## Core Endpoints

### User Management
- `POST /users`: Create new user or claim first-play credits
- `GET /users/me`: Get current user profile (authenticated)

### Game Operations
- `POST /games/:id/play`: Submit a game play
- `GET /games/:id/history`: Get game play history

### Polymarket Integration
- `GET /polymarket/markets`: List available prediction markets
- `POST /polymarket/bet`: Place a bet on a market outcome

## Error Handling
- Standard HTTP status codes
- Error response format:
```json
{
  "error": "Error code",
  "message": "Human-readable description"
}
```

## Rate Limiting
- Public endpoints: 5 requests/10 seconds
- Authenticated endpoints: 20 requests/10 seconds

## SDKs
- JavaScript SDK available at `@quantumnexus/sdk`
- Python SDK in development

> **Note:** Always use the latest API version. Current version: **v2**