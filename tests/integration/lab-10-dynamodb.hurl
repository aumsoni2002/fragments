# test/integration/lab-10-dynamodb.hurl

# POST /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "service":"DynamoDB"
}

# Response
HTTP/1.1 201

# Capture
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# GET /v1/fragments/:id/info
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"

# POST /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**`

# Response
HTTP/1.1 201

# Capture
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# GET /v1/fragments/:id/info
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"

# GET /v1/fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# DELETE /v1/fragments/:id
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

# 7. GET /v1/fragments/:id
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 404

# GET /v1/fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# Response
HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}