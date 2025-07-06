# API Documentation

## First Play Free Endpoint

### `POST /api/first-play-free`

This endpoint is used to grant a new user a one-time credit for their first play.

#### Request
The request must be a `POST` with a JSON body containing:
```json
{
  "userToken": "string"
}
```

#### Responses
- **200 OK** (Success):
  ```json
  {
    "success": true,
    "creditAmount": 0.001
  }
  ```
- **200 OK** (Already claimed):
  ```json
  {
    "success": false,
    "error": "First play free already claimed."
  }
  ```
- **400 Bad Request** (Missing token):
  ```json
  {
    "success": false,
    "error": "User token is required."
  }
  ```
- **401 Unauthorized** (Invalid token):
  ```json
  {
    "success": false,
    "error": "Invalid or expired token."
  }
  ```
- **500 Internal Server Error** (Configuration issue):
  ```json
  {
    "success": false,
    "error": "Server configuration error"
  }
  ```

#### Implementation Details
- Token verification using Particle Network JWT
- Database operations on `user_preferences` table
- Credit amount configurable via `CreditConfigService`
- Default credit amount: 0.001

## Tournament Management Endpoints

### Overview
The tournament management API provides a comprehensive set of endpoints for creating, reading, updating, and deleting tournaments, as well as managing teams and matches within those tournaments. All endpoints are designed to interact with the Cloudflare D1 database.

**Authentication:** These endpoints currently do not require explicit authentication. Future iterations may introduce authentication mechanisms.

### `GET /api/v1/tournaments`
This endpoint retrieves a list of all tournaments or a specific tournament by ID.

#### Request
- `GET /api/v1/tournaments`: Retrieves all tournaments.
- `GET /api/v1/tournaments?id={tournamentId}`: Retrieves a specific tournament by its ID.

#### Responses
- **200 OK** (Success - All tournaments):
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "format": "string",
      "status": "string",
      "createdAt": "datetime"
    }
  ]
  ```
- **200 OK** (Success - Specific tournament):
  ```json
  {
    "id": "string",
    "name": "string",
    "format": "string",
    "status": "string",
    "createdAt": "datetime"
  }
  ```
- **200 OK** (Not Found - Specific tournament):
  ```json
  null
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Database not configured."
  }
  ```

### `POST /api/v1/tournaments`
This endpoint creates a new tournament.

#### Request
The request must be a `POST` with a JSON body containing:
```json
{
  "name": "string",
  "format": "string",
  "status": "string"
}
```

#### Responses
- **201 Created**:
  ```json
  {
    "message": "Tournament created successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: name, format, status"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to create tournament"
  }
  ```

### `PUT /api/v1/tournaments`
This endpoint updates an existing tournament.

#### Request
The request must be a `PUT` with a JSON body containing:
```json
{
  "id": "string",
  "name": "string (optional)",
  "format": "string (optional)",
  "status": "string (optional)"
}
```

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Tournament updated successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: id and at least one of name, format, status"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to update tournament"
  }
  ```

### `DELETE /api/v1/tournaments`
This endpoint deletes a tournament by ID.

#### Request
The request must be a `DELETE` with a query parameter:
- `DELETE /api/v1/tournaments?id={tournamentId}`

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Tournament deleted successfully"
  }
  ```
- **400 Bad Request** (Missing ID):
  ```json
  {
    "error": "Missing required field: id"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to delete tournament"
  }
  ```

### `GET /api/v1/tournaments/teams`
This endpoint retrieves a list of all teams, teams for a specific tournament, or a specific team by ID.

#### Request
- `GET /api/v1/tournaments/teams`: Retrieves all teams.
- `GET /api/v1/tournaments/teams?id={teamId}`: Retrieves a specific team by its ID.
- `GET /api/v1/tournaments/teams?tournament_id={tournamentId}`: Retrieves teams for a specific tournament.

#### Responses
- **200 OK** (Success - All teams):
  ```json
  [
    {
      "id": "string",
      "tournament_id": "string",
      "name": "string",
      "players": "JSON array of user wallet addresses"
    }
  ]
  ```
- **200 OK** (Success - Specific team):
  ```json
  {
    "id": "string",
    "tournament_id": "string",
    "name": "string",
    "players": "JSON array of user wallet addresses"
  }
  ```
- **200 OK** (Not Found - Specific team):
  ```json
  null
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Database not configured."
  }
  ```

### `POST /api/v1/tournaments/teams`
This endpoint creates a new team.

#### Request
The request must be a `POST` with a JSON body containing:
```json
{
  "tournament_id": "string",
  "name": "string",
  "players": "JSON array of user wallet addresses (optional)"
}
```

#### Responses
- **201 Created**:
  ```json
  {
    "message": "Team created successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: tournament_id, name"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to create team"
  }
  ```

### `PUT /api/v1/tournaments/teams`
This endpoint updates an existing team.

#### Request
The request must be a `PUT` with a JSON body containing:
```json
{
  "id": "string",
  "name": "string (optional)",
  "players": "JSON array of user wallet addresses (optional)"
}
```

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Team updated successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: id and at least one of name, players"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to update team"
  }
  ```

### `DELETE /api/v1/tournaments/teams`
This endpoint deletes a team by ID.

#### Request
The request must be a `DELETE` with a query parameter:
- `DELETE /api/v1/tournaments/teams?id={teamId}`

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Team deleted successfully"
  }
  ```
- **400 Bad Request** (Missing ID):
  ```json
  {
    "error": "Missing required field: id"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to delete team"
  }
  ```

### `GET /api/v1/tournaments/matches`
This endpoint retrieves a list of all matches, matches for a specific tournament, or a specific match by ID.

#### Request
- `GET /api/v1/tournaments/matches`: Retrieves all matches.
- `GET /api/v1/tournaments/matches?id={matchId}`: Retrieves a specific match by its ID.
- `GET /api/v1/tournaments/matches?tournament_id={tournamentId}`: Retrieves matches for a specific tournament.

#### Responses
- **200 OK** (Success - All matches):
  ```json
  [
    {
      "id": "string",
      "tournament_id": "string",
      "round": "integer",
      "match_number": "integer",
      "team1_id": "string",
      "team2_id": "string",
      "score1": "integer",
      "score2": "integer",
      "winner_id": "string",
      "next_match_id": "string"
    }
  ]
  ```
- **200 OK** (Success - Specific match):
  ```json
  {
    "id": "string",
    "tournament_id": "string",
    "round": "integer",
    "match_number": "integer",
    "team1_id": "string",
    "team2_id": "string",
    "score1": "integer",
    "score2": "integer",
    "winner_id": "string",
    "next_match_id": "string"
  }
  ```
- **200 OK** (Not Found - Specific match):
  ```json
  null
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Database not configured."
  }
  ```

### `POST /api/v1/tournaments/matches`
This endpoint creates a new match.

#### Request
The request must be a `POST` with a JSON body containing:
```json
{
  "tournament_id": "string",
  "round": "integer",
  "match_number": "integer",
  "team1_id": "string (optional)",
  "team2_id": "string (optional)"
}
```

#### Responses
- **201 Created**:
  ```json
  {
    "message": "Match created successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: tournament_id, round, match_number"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to create match"
  }
  ```

### `PUT /api/v1/tournaments/matches`
This endpoint updates an existing match.

#### Request
The request must be a `PUT` with a JSON body containing:
```json
{
  "id": "string",
  "team1_id": "string (optional)",
  "team2_id": "string (optional)",
  "score1": "integer (optional)",
  "score2": "integer (optional)",
  "winner_id": "string (optional)",
  "next_match_id": "string (optional)"
}
```

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Match updated successfully"
  }
  ```
- **400 Bad Request** (Missing fields):
  ```json
  {
    "error": "Missing required fields: id and at least one field to update"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to update match"
  }
  ```

### `DELETE /api/v1/tournaments/matches`
This endpoint deletes a match by ID.

#### Request
The request must be a `DELETE` with a query parameter:
- `DELETE /api/v1/tournaments/matches?id={matchId}`

#### Responses
- **200 OK**:
  ```json
  {
    "message": "Match deleted successfully"
  }
  ```
- **400 Bad Request** (Missing ID):
  ```json
  {
    "error": "Missing required field: id"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Failed to delete match"
  }
  ```