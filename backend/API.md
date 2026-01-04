# CloudBox API Documentation

**Base URL:** `http://localhost:5000`  
**API Version:** 1.0.0  
**Base Path:** `/user`

---

## Table of Contents
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)

---

## Authentication

### JWT Bearer Token
Most endpoints require authentication via JWT (JSON Web Token).

**Token can be sent in two ways:**

1. **Cookie (Preferred):**
   - Cookie Name: `accessToken`
   - Type: HttpOnly, Secure
   - Automatically sent by browser

2. **Authorization Header:**
   ```
   Authorization: Bearer <token>
   ```

**Token Structure:**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "exp": 1234567890
}
```

**Environment Variables Required:**
- `JWT_SECRET` - Secret key for token signing
- `JWT_EXPIRY` - Token expiration time (e.g., "7d")

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

or

```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 202 | Accepted - Request accepted |
| 401 | Unauthorized - Authentication failed or missing |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## API Endpoints

### 1. POST /user/register

**URL:** `http://localhost:5000/user/register`

**Description:** Create a new user account with optional profile picture upload

**Authentication:** Not required (Public endpoint)

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name (trimmed) |
| email | string | Yes | User's email (unique, lowercase, trimmed) |
| password | string | Yes | User's password (will be hashed) |
| role | string | No | User role: "user" or "admin" (default: "user") |
| profilePic | file | No | Profile picture image file |

**Example Request:**
```
POST http://localhost:5000/user/register
Content-Type: multipart/form-data

name: John Doe
email: john@example.com
password: SecurePass123
role: user
profilePic: [image file]
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePic": "https://res.cloudinary.com/xxx/image/upload/v123/profile_pics/xyz.jpg",
    "createdAt": "2026-01-03T10:30:00.000Z",
    "updatedAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "User already exists with this email",
  "success": false
}
```

---

### 2. POST /user/login

**URL:** `http://localhost:5000/user/login`

**Description:** Authenticate user and receive access token

**Authentication:** Not required (Public endpoint)

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Example Request:**
```json
POST http://localhost:5000/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (202):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePic": "https://res.cloudinary.com/xxx/image/upload/v123/profile_pics/xyz.jpg",
    "createdAt": "2026-01-03T10:30:00.000Z",
    "updatedAt": "2026-01-03T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:** `accessToken` (HttpOnly, Secure)

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "success": false
}
```

---

### 3. POST /user/logout

**URL:** `http://localhost:5000/user/logout`

**Description:** Logout user and clear authentication token

**Authentication:** Required (JWT)

**Request Body:** None

**Example Request:**
```
POST http://localhost:5000/user/logout
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "John Doe Logged out"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "success": false
}
```

---

### 4. GET /user/

**URL:** `http://localhost:5000/user/`

**Description:** Retrieve all users (list)

**Authentication:** Required (JWT)

**Query Parameters:** None

**Example Request:**
```
GET http://localhost:5000/user/
Authorization: Bearer <token>
```

**Success Response (201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/xxx/image/upload/v123/profile_pics/xyz.jpg",
      "createdAt": "2026-01-03T10:30:00.000Z",
      "updatedAt": "2026-01-03T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin",
      "profilePic": null,
      "createdAt": "2026-01-02T08:15:00.000Z",
      "updatedAt": "2026-01-02T08:15:00.000Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "success": false
}
```

---

### 5. GET /user/:id

**URL:** `http://localhost:5000/user/:id`

**Description:** Retrieve a specific user by ID

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the user |

**Example Request:**
```
GET http://localhost:5000/user/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Success Response (202):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profilePic": "https://res.cloudinary.com/xxx/image/upload/v123/profile_pics/xyz.jpg",
    "createdAt": "2026-01-03T10:30:00.000Z",
    "updatedAt": "2026-01-03T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "success": false
}
```

---

### 6. PUT /user/:id

**URL:** `http://localhost:5000/user/:id`

**Description:** Update user information with optional profile picture upload

**Authentication:** Required (JWT)

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the user |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated user's full name |
| email | string | No | Updated user's email |
| password | string | No | Updated user's password |
| role | string | No | Updated user role: "user" or "admin" |
| profilePic | file | No | New profile picture image file |

**Example Request:**
```
PUT http://localhost:5000/user/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: John Updated
email: johnupdated@example.com
profilePic: [image file]
```

**Success Response (202):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "johnupdated@example.com",
    "role": "user",
    "profilePic": "https://res.cloudinary.com/xxx/image/upload/v456/profile_pics/new.jpg",
    "createdAt": "2026-01-03T10:30:00.000Z",
    "updatedAt": "2026-01-03T11:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

**Error Response (500):**
```json
{
  "statusCode": 500,
  "message": "Failed to upload image to Cloudinary",
  "success": false
}
```

**Notes:**
- All fields are optional - only send fields you want to update
- If uploading a new profile picture, the old one will be automatically deleted from Cloudinary
- Password will be automatically hashed before saving

---

### 7. DELETE /user/:id

**URL:** `http://localhost:5000/user/:id`

**Description:** Delete a user account

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the user |

**Request Body:** None

**Example Request:**
```
DELETE http://localhost:5000/user/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

**Notes:**
- Deletes the user's profile picture from Cloudinary automatically
- This action is irreversible

---

## Data Models

### User Model

**MongoDB Schema:**

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Auto-generated MongoDB ID |
| name | String | Required, trimmed |
| email | String | Required, unique, lowercase, trimmed |
| password | String | Required, hashed with bcrypt (10 rounds) - Never returned in responses |
| role | String | Enum: ["user", "admin"], default: "user" |
| profilePic | String | Cloudinary URL or null |
| createdAt | Date | Auto-generated timestamp |
| updatedAt | Date | Auto-updated timestamp |

**User Response Format:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "profilePic": "https://res.cloudinary.com/xxx/image/upload/v123/profile_pics/xyz.jpg",
  "createdAt": "2026-01-03T10:30:00.000Z",
  "updatedAt": "2026-01-03T10:30:00.000Z"
}
```

### Model Methods

**1. `comparePassword(password: string): Promise<boolean>`**
- Compares plain text password with hashed password
- Used during login authentication
- Returns `true` if password matches, `false` otherwise

**2. `generateToken(): string`**
- Creates a JWT token with user ID, email, and name
- Token expiry configured via `JWT_EXPIRY` environment variable
- Returns JWT string

### Validation Rules

| Field | Validation |
|-------|------------|
| name | Required, trimmed, must be non-empty string |
| email | Required, must be valid email format, unique in database, converted to lowercase |
| password | Required, minimum 6 characters recommended, hashed automatically on save |
| role | Must be either "user" or "admin", defaults to "user" if not provided |
| profilePic | Must be valid image file (JPEG, PNG, etc.), uploaded to Cloudinary |

---

## File Upload Specifications

### Multer Configuration
- **Storage:** Disk storage at `./public/temp`
- **Filename:** Original filename preserved
- **Field Name:** `profilePic` (single file)
- **Accepted Formats:** All image types (JPEG, PNG, GIF, WebP, etc.)

### Cloudinary Integration
- **Upload Folder:** `profile_pics`
- **Behavior:** 
  - Local temp file deleted after successful upload
  - Old profile picture deleted before uploading new one
  - Returns full Cloudinary URL with public_id

---

## Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Authentication:** Token-based authentication with httpOnly cookies
- **Password Protection:** Password field never returned in API responses
- **CORS:** Enabled for cross-origin requests

---

## Quick Reference

| Method | URL | Authentication | Description |
|--------|-----|----------------|-------------|
| POST | `/user/register` | No | Create new user account |
| POST | `/user/login` | No | Login and get access token |
| DELETE | `/user/logout` | Yes | Logout user |
| GET | `/user/` | Yes | Get all users |
| GET | `/user/:id` | Yes | Get user by ID |
| PUT | `/user/:id` | Yes | Update user information |
| DELETE | `/user/:id` | Yes | Delete user account |

---

**API Version:** 1.0.0  
**Last Updated:** January 3, 2026
