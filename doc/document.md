# Document API Spec

## Upload / Create Document

Endpoint: POST /api/document

Headers:

- Authorization: token

Request Body:

```json
{
  "doc_name": "Hana Widyatari",
  "doc_url": "3131313"
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "doc_name": "Hana Widyatari",
    "doc_url": "3131313",
    "status": "Uploaded",
    "is_permission_remove": false,
    "is_permission_replace": false
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "failed"
}
```

## Replacing / Update Document

Endpoint: PUT /api/document/:documentId

Request Body:

```json
{
  "doc_name": "Hana Widyatari", // optional
  "doc_url": "1211311121" // optional
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "doc_name": "Hana Widyatari",
    "doc_url": "131313133",
    "status": "Uploaded",
    "is_permission_remove": true,
    "is_permission_replace": true
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "failed"
}
```

## Replacing / Update Document : USER ROLE

Endpoint: PUT /api/document/:documentId

Request Body:

```json
{
  "doc_name": "Hana Widyatari", // optional
  "doc_url": "1211311121", // optional
  "role": "admin"
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "doc_name": "Hana Widyatari",
    "doc_url": "131313133",
    "is_permission_remove": false,
    "is_permission_replace": true
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "failed"
}
```

## Get Document

Endpoint: GET /api/document/:documentId

Headers:

- Authorization: token

Response Body (200: Success):

```json
{
  "data": {
    "id": 1,
    "doc_name": "Hana Widyatari",
    "doc_url": "24224242",
    "status": "Uploaded" || "Pending Remove" || "Pending Replace",
    "is_permission_remove": false,
    "is_permission_replace": false
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "failed"
}
```

## Remove Document

Endpoint: DELETE /api/document/:documentId

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

## Search Document

Endpoint: GET /api/documents

Headers:

- Authorization: token

Query Params:

- doc_name: string, optional
- page: number, default 1
- size: number, default 10

Response Body (201: Success):

```json
{
  "data": [
    {
      "id": 1,
      "doc_name": "Hana Widyatari",
      "doc_url": "131313133",
      "status": "Uploaded" || "Pending Remove" || "Pending Replace",
      "is_permission_remove": false, // ini kalau role sebagai "user"
      // Kalau false = gabisa ngeremove
      // Kalau true = bisa remove
      "is_permission_replace": false // ini kalau role sebagai "user"
      // Kalau false = gabisa ngereplace
      // Kalau true = bisa ngereplace

      //Permission akan bernilai true apabila sudah di approve oleh ADMIN ROLE
    },
    {
      "id": 2,
      "doc_name": "doc 1",
      "doc_url": "A131313133",
      "status": "Uploaded",
      "is_permission_remove": true, // ini kalau role sebagai "admin"
      "is_permission_replace": true
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

## UPDATE PERMISSION DOC : USER ROLE

Endpoint: PUT /api/document/:documentId

Request Body:

```json
{
  "is_permission_remove": true,
  "is_permission_replace": true
}
```

Response Body (201: Success):

```json
{
  "data": {
    "id": 1,
    "doc_name": "Hana Widyatari",
    "doc_url": "131313133",
    "is_permission_remove": false,
    "is_permission_replace": true
  }
}
```

Response Body (400: Failed):

```json
{
  "errors": "failed"
}
```
