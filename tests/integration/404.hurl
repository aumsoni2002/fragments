# tests/integration/404.hurl

# 404 Not Found Test
GET http://localhost:8080/no-such-route

# 404 Response
# ############
HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "not found"