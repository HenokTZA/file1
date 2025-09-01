# Biometric Device Integration

This document provides comprehensive documentation for integrating biometric devices with the GMS (Gym Management System) platform.

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Data Models](#data-models)
6. [Integration Flow](#integration-flow)
7. [Rate Limiting](#rate-limiting)
8. [Idempotency](#idempotency)
9. [Error Handling](#error-handling)
10. [Troubleshooting](#troubleshooting)

## Overview

The biometric integration allows gym members to check in/out using biometric authentication (face recognition). The system supports multiple biometric devices and provides real-time synchronization of member data.

## System Architecture

The biometric system consists of:
- **Biometric Devices**: Physical devices that capture and process biometric data
- **GMS Backend**: Handles device authentication, data synchronization, and check-in/out processing
- **Database**: Stores member biometric hashes and check-in/out records

## API Endpoints (v1)

### Device Authentication
- `POST /gateway/biometrics/getAccessToken`
  - Authenticates a device and returns a JWT token
  - Required fields: `device_id`, `serial`, `branch_id`

### Device Operations
- `POST /gateway/biometrics/heartbeat`
  - Updates device status and last seen timestamp
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`, `device.rate_limit:heartbeat`

- `POST /gateway/biometrics/checkin`
  - Records a member check-in
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`, `device.rate_limit:attendance`, `device.idempotent:checkin`

- `POST /gateway/biometrics/checkout`
  - Records a member check-out
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`, `device.rate_limit:attendance`, `device.idempotent:checkout`

- `POST /gateway/biometrics/incremental-sync`
  - Synchronizes new or updated member data to the device
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`

- `POST /gateway/biometrics/full-sync`
  - Performs a full synchronization of member data
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`, `device.rate_limit:fullsync`

- `POST /gateway/biometrics/update-biometric`
  - Updates a member's biometric data
  - Middleware: `device.jwt`, `resolve.tenancy.from.device`

## Authentication

Devices authenticate using JWT (JSON Web Tokens):
1. Device sends `device_id` and `serial` to `/gateway/biometrics/getAccessToken`
2. Server validates credentials and returns a JWT token
3. Device includes the token in the `Authorization` header for subsequent requests
4. Tokens does not expire unless revoked or deactivated

## Data Models

### Biometric Device
- `id`: Unique identifier
- `serial`: Device serial number (unique)
- `tenant_id`: Associated tenant
- `branch_id`: Associated branch
- `status`: `inactive` | `active` | `revoked`
- `last_token_jti`: Last issued JWT token ID
- `last_seen_at`: Last communication timestamp
- `ip_address`: Last known IP address
- `firmware_version`: Device firmware version
- `metadata`: Additional device information
- `last_sync_at`: Last successful sync timestamp

### Biometric Checkin
- `id`: Unique identifier
- `member_id`: Associated member
- `branch_id`: Branch where check-in occurred
- `biometric_data`: Encrypted biometric data
- `time`: Check-in/out timestamp
- `type`: `checkin` | `checkout`
- `status`: `success` | `failed` | `blocked`
- `device_id`: Originating device
- `metadata`: Additional check-in data

## Integration Flow

1. **Device Registration** (GMS Admin panel)
   - Admin registers device in GMS admin panel
   - Device is assigned to a specific branch
   - Initial device status is `inactive`

2. **Device Activation** (GMS Admin panel)
   - Admin activates the device
   - Admin can then generate Bearer token

3. **Member Sync** (Device sends full sync request)
   - Member is first synced with device
   - Member biometrics are updated in database

4. **Check-in/Check-out** (Device sends check-in or check-out request)
   - Member presents biometric ( optional)
   - Device verifies against stored hash
   - Check-in/out record is created
   - Server validates and processes the record

5. **Data Communication** (Device and Server)
   - Device -> Server through HTTPS
   - Server -> Device through HTTPS and WebSockets

## Rate Limiting

The API implements rate limiting to prevent abuse:
- [heartbeat]: 30 seconds per device
- [attendance]: 5 requests per second per device
- [fullsync]: 1 request per hour per device

example response for rate limited:
{
    "success": false,
    "error": "rate_limited",
    "message": "Too Many Requests"
}

## Idempotency

Check-in and check-out operations are idempotent:
- Each request includes a header `Idempotency-Key` or `X-Idempotency-Key`
- Duplicate requests with the same key return the original response
- Idempotency window: 10 minutes

## Error Handling

### Common Error Responses

```json
{
    "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}

example response for validation error: 
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "member_id": [
            "The member id field is required."
        ]
    }
}

example response for inactive client disconnect ( no reply to ping or activity timeout )
{
    "event": "pusher:error",
    "data": "{\"code\":4201,\"message\":\"Pong reply not received in time\"}"
}

mesage for pong : 
{
  "event": "pusher:pong",
  "data": {}
}
```

### Process for connecting to websocket: 

1. websocket url: ws://localhost:8080/app/qtujeg7rzxgarhplbtal?protocol=7&client=js&version=8.4.0&flash=false
2. Get the socket id from the response 
```json
{
    "event": "pusher:connection_established",
    "data": "{\"socket_id\":\"272554510.512361049\",\"activity_timeout\":10}"
}
```
3. Use the socket id and authenticate for channel at {{base_url}}/broadcasting/auth
Send Device Bearer token in the header
payload should be in form : 
```json
{
    "socket_id" : "272554510.512361049",
    "channel_name" : "private-tenant.1.branch.1" //Connects to tenant 1 and branch 1
}
```
4. Use the response auth and establish the connection in ws
```json
{
    "auth": "qtujeg7rzxgarhplbtal:5a494d396e5348c37d48304ce26cb241197ea93b4d78fd04bfc2ad40e33d00e6"
}
```
Message:
```json
  "event": "pusher:subscribe",
  "data": {
    "channel": "private-tenant.1.branch.1",
    "auth": "qtujeg7rzxgarhplbtal:5a494d396e5348c37d48304ce26cb241197ea93b4d78fd04bfc2ad40e33d00e6"
  }
}
```
Response:
```json
{
    "event": "pusher_internal:subscription_succeeded",
    "data": "{}",
    "channel": "private-tenant.1.branch.1"
}
```
You are now subscribed to tenant 1 and branch 1





