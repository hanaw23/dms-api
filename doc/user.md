# User API Spec

## Register User

Endpoint: POST /api/user

Request Body:

```json
{
  "username": "Hana Widyatari",
  "password": "pas123",
  "name": "hanaw",
  "role": "admin"
}
```

Response Body (201: Success):

```json
{
  "data": {
    "userId": 1,
    "username": "Hana Widyatari",
    "name": "hanaw",
    "role": "admin"
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "username already registered"
}
```

## Login User

Endpoint: POST /api/user/login

Request Body:

```json
{
  "username": "Hana Widyatari",
  "password": "pas123"
}
```

Response Body (201: Success):

```json
{
  "data": {
    "userId": 1,
    "username": "Hana Widyatari",
    "name": "hanaw",
    "token": "session_id_generated"
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "username or password is wrong"
}
```

## Get User

Endpoint: GET /api/user/current

Headers:

- Authorization: token

Response Body (200: Success):

```json
{
  "data": {
    "userId": 1,
    "username": "Hana Widyatari",
    "name": "hanaw",
    "role": "admin"
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Unautorized"
}
```

## Update User

Endpoint: PATCH /api/user/current

Headers:

- Authorization: token

Request Body:

```json
{
  "name": "Hana Widyatari", // optional
  "password": "pas123" // optional
}
```

Response Body (201: Success):

```json
{
  "data": {
    "userId": 1,
    "username": "Hana Widyatari",
    "name": "hanaw",
    "role": "admin"
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Failed"
}
```

## Logout User

Endpoint: DELETE /api/user/current

Headers:

- Authorization: token

Response Body (201: Success):

```json
{
  "data": true
}
```

Response Body (400: Failed):

```json
{
  "errors": "Failed to logout"
}
```

## Get Admin Users

Endpoint: GET /api/users/admin

Headers:

- Authorization: token

Query Params:

- userId: string, mandatory
- page: number, default 1
- size: number, default 10

Response Body if role is Admin (200: Success):

```json
{
  "data": []
}
```

Response Body if role is User (200: Success):

```json
{
  "data": [
    { "userId": 1, "username": "Hana Widyatari", "name": "hanaw" },
    { "userId": 2, "username": "hai", "name": "helow" }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 1,
    "size": 10
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Unautorized"
}
```
