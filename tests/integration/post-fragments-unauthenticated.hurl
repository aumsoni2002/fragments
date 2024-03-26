# tests/integration/post-fragments-unauthenticated.hurl

# POST /v1/fragments (Unauthenticated User)
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`This is a fragment!`

# 401 Unauthorized Response
HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
