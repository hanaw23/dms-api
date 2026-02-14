# Permissions Message API Spec

## Check Permission REPLACE/REMOVE if ROLE === USER

Endpoint: POST /api/check/doc

Headers:

- Authorization: token

Request Body:

```json
{
  "userId": 1,
  "documentId": 1,
  "adminId": 3,
  "is_replace": true, // true apabila untuk replace optional
  "is_remove": false // true apabila untuk remove optional
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "documentId": 1,
    "adminId": 3,
    "userName": "user_1",
    "adminName": "admin_1",
    "is_replace": true,
    "is_remove": false
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Failed"
}
```

## GET CHECK Permission REPLACE/REMOVE Document if ROLE === ADMIN

Endpoint: GET /api/check/docs

Headers:

- Authorization: token

Query Params:

- userId: number, masukan userId admin, mandatory, kalau userId nya user maka data akan di return array kosong
- page: number, default 1
- size: number, default 10

Response Body (201: Success):

```json
{
  "data": [
    {
      "id": 1,
      "documentId": 1,
      "userId": 1,
      "userName": "user_1",
      "is_replace": true,
      "is_remove": false
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 20,
    "size": 10
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Failed"
}
```

## TBD: Approve Permission REPLACE/REMOVE Document if ROLE === ADMIN

Endpoint: POST /api/approved/docs

Headers:

- Authorization: token

Request Body:

```json
{
  "userId": 1,
  "documentId": 1,
  "is_replace": true, // true apabila untuk replace optional
  "is_remove": true // true apabila untuk remove optional
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "documentId": 1,
    "adminId": 3,
    "userName": "user_1",
    "adminName": "admin_1",
    "is_replace": true,
    "is_remove": true
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "Failed"
}
```
