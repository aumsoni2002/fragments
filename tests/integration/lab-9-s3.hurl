# tests/integration/lab-9-s3.hurl

# Authenticated POST /v1/fragments of a text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`checking if the s3 works or not!`

# Response
HTTP/1.1 201

# Captures url
[Captures]
url: header "Location"

# Authenticated GET /v1/fragments/:id
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "checking if the s3 works or not!"

# Authenticated DELETE /v1/fragments/:id
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

# 4. Authenticated GET /v1/fragments/:id of deleted fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4.1 Response
HTTP/1.1 404
