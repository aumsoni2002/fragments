# tests/integration/post-fragments-json.hurl

# POST CALL: /v1/fragments (Sending JSON Data)
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "firstName":"Aum",
  "lastName":"Soni"
}

# 201 Success Response
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 44


[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

# 200 Success Response
HTTP/1.1 200
Content-Type: application/json
Content-Length: 47

[Asserts]
jsonpath "$.firstName" == "Aum"
jsonpath "$.lastName" == "Soni"
