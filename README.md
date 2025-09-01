{
	"info": {
		"_postman_id": "bf5965b1-2d42-466a-8f6f-3b9ada96d9a5",
		"name": "Biometrics-API",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "45035544",
		"_collection_link": "https://gms-devteam.postman.co/workspace/GMS-DevTeam-Workspace~4e909513-a435-4784-8f6b-c6c5fbe59c69/collection/45035544-bf5965b1-2d42-466a-8f6f-3b9ada96d9a5?action=share&source=collection_link&creator=45035544"
	},
	"item": [
		{
			"name": "heartbeat",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "Authorization",
						"value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbXlmaXRsaWZlbGIuY29tL2xhbmRsb3JkL2Jpb21ldHJpYy1kZXZpY2VzLzEvaXNzdWUtdG9rZW4iLCJpYXQiOjE3NTYwMzExOTQsIm5iZiI6MTc1NjAzMTE5NCwianRpIjoiSXlkTHRUWFFmNnloNXJvdyIsInN1YiI6IjEiLCJwcnYiOiI2YTBjYjgwZmE3ZmZiNGUyYjFjZjNhZDQ5YjlmYzExM2I1ODA3MzBjIiwidHlwIjoiZGV2aWNlIiwidGVuYW50X2lkIjo3LCJicmFuY2hfaWQiOjEsInNlcmlhbCI6ImE3Zjg0NDk4MzI1NGY0MjQifQ.dfRT1tSuoU6RibrHpvuSGt01TtP7BftBYpfc9CAfAlo",
						"type": "text"
					},
					{
						"key": "Content-Type",
						"value": "application/json",
						"type": "text"
					},
					{
						"key": "Authorization",
						"value": "{{bearer_tocken}}",
						"type": "text"
					}
				],
				"body": {
					"mode": "raw",
					"raw": "{\r\n  \"device_id\": \"dev-1001\",\r\n  \"serial\": \"a7f844983254f424\",\r\n  \"branch_id\": 1,\r\n  \"firmware_version\": \"1.0.0\"\r\n}\r\n",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "http://myfitlifelb.com/api/v1/gateway/biometrics/heartbeat",
					"protocol": "http",
					"host": [
						"myfitlifelb",
						"com"
					],
					"path": [
						"api",
						"v1",
						"gateway",
						"biometrics",
						"heartbeat"
					]
				}
			},
			"response": []
		},
		{
			"name": "getAccessToken-incorrect",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "{\r\n  \"device_id\": \"dev-1001\",\r\n  \"serial\": \"a7f844983254f424\",\r\n  \"branch_id\": 1\r\n}\r\n",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "http://myfitlifelb.com/api/v1/gateway/biometrics/getAccessToken",
					"protocol": "http",
					"host": [
						"myfitlifelb",
						"com"
					],
					"path": [
						"api",
						"v1",
						"gateway",
						"biometrics",
						"getAccessToken"
					]
				}
			},
			"response": []
		},
		{
			"name": "AuthBrodcast",
			"request": {
				"method": "POST",
				"header": [],
				"url": {
					"raw": "{{base_url}}/broadcasting/auth",
					"host": [
						"{{base_url}}"
					],
					"path": [
						"broadcasting",
						"auth"
					]
				}
			},
			"response": []
		},
		{
			"name": "getBearerTocken",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "{\r\n    \"device_id\": \"a7f844983254f424\"\r\n}",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "http://myfitlifelb.com/api/v1/gateway/biometrics/getAccessToken",
					"protocol": "http",
					"host": [
						"myfitlifelb",
						"com"
					],
					"path": [
						"api",
						"v1",
						"gateway",
						"biometrics",
						"getAccessToken"
					]
				}
			},
			"response": []
		}
	]
}
