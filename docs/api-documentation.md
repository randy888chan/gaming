# Quantum Nexus API Documentation

## Introduction
This document details the API endpoints and interfaces for the Quantum Nexus gaming platform. All APIs follow RESTful conventions and return JSON responses.

## Authentication
All API endpoints require authentication via Particle Network token passed in the `Authorization` header.

## Endpoints

### 1. First Play Free API
- **Endpoint**: `/api/first-play-free`
- **Method**: POST
- **Description**: Claims first free play for new users
- **Request Body**:
  ```json
  {
    "token": "particle_authentication_token"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "creditAmount": 0.001
  }
  ```

### 2. Smart Bet API
- **Endpoint**: `/api/smart-bet`
- **Method**: POST
- **Description**: Gets AI-powered bet suggestions
- **Request Body**:
  ```json
  {
    "gameId": "dice",
    "riskProfile": "medium"
  }
  ```
- **Response**:
  ```json
  {
    "suggestion": {
      "amount": 0.0005,
      "multiplier": 2.5,
      "confidence": "high"
    }
  }
  ```

### 3. Game Status API
- **Endpoint**: `/api/game-status/{gameId}`
- **Method**: GET
- **Description**: Gets current game status and odds
- **Response**:
  ```json
  {
    "gameId": "dice",
    "status": "active",
    "players": 42,
    "minBet": 0.001,
    "maxBet": 0.1
  }
  ```

## Error Handling
All errors return standardized responses:
```json
{
  "error": "Invalid authentication token",
  "code": 401
}
```

## Rate Limiting
- 100 requests/minute per IP address
- 1000 requests/minute per authenticated user

## Versioning
API versioning is handled through the URL path: `/v1/api/...`