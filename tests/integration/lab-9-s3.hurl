# tests/integration/lab-9-s3.hurl

# 1. Authenticated POST /v1/fragments of a text fragment
########################################################
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 1.1 Response
# ============
HTTP/1.1 201

# 1.2 Captures url
# ================
[Captures]
url: header "Location"

# 2. Authenticated GET /v1/fragments/:id
########################################
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 2.1 Response
# ============
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 3. Authenticated DELETE /v1/fragments/:id
###########################################
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# 3.1 Response
# ============
HTTP/1.1 200

# 4. Authenticated GET /v1/fragments/:id of deleted fragment
############################################################
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4.1 Response
# ============
HTTP/1.1 404