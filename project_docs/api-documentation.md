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