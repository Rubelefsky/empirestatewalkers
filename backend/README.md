# 🔌 Empire State Walkers - Backend API

<div align="center">

**RESTful API backend for the Empire State Walkers dog walking and pet care service**

[![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=json-web-tokens&logoColor=white)](https://jwt.io/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Endpoints](#-api-endpoints) • [Security](#-security-features)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Server](#-running-the-server)
- [API Endpoints](#-api-endpoints)
  - [Authentication Routes](#authentication-routes-apiauth)
  - [Booking Routes](#booking-routes-apibookings)
  - [Contact Routes](#contact-routes-apicontact)
  - [Health Check](#health-check)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Security Features](#-security-features)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

- 🔐 **User Authentication** - JWT-based secure authentication
- 🔒 **Password Security** - bcrypt hashing with 10 salt rounds
- 📅 **Booking Management** - Complete CRUD operations for service bookings
- 📧 **Contact Form** - Submit and manage customer inquiries
- 👑 **Role-Based Access Control** - User and Admin roles with protected routes
- 🗄️ **MongoDB Integration** - Mongoose ODM with schema validation
- ✅ **Input Validation** - Comprehensive validation with express-validator
- 🛡️ **Security Headers** - Helmet.js for secure HTTP headers
- ⏱️ **Rate Limiting** - Brute-force protection on all endpoints
- 📝 **Comprehensive Logging** - Winston + Morgan logging system
- 🔄 **CSRF Protection** - Double-submit cookie pattern
- 🚫 **Error Handling** - Global error handler with detailed responses

---

## 🛠 Tech Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | v14+ | JavaScript runtime environment |
| **Framework** | Express.js | v4.18.2 | Web application framework |
| **Database** | MongoDB | v4.4+ | NoSQL database |
| **ODM** | Mongoose | v8.0.0 | MongoDB object modeling |

### Security & Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| **JWT** | jsonwebtoken v9.0.2 | Token-based authentication |
| **bcryptjs** | v2.4.3 | Password hashing |
| **helmet** | v8.1.0 | Security headers |
| **csrf-sync** | v4.2.1 | CSRF protection |
| **express-rate-limit** | v8.2.1 | Rate limiting |

### Validation & Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **express-validator** | v7.0.1 | Input validation & sanitization |
| **winston** | v3.18.3 | Application logging |
| **morgan** | Latest | HTTP request logging |
| **cors** | v2.8.5 | Cross-origin resource sharing |
| **dotenv** | Latest | Environment variable management |

---

## 📋 Prerequisites

Before running the backend, ensure you have:

- ✅ **Node.js** v14 or higher ([Download](https://nodejs.org/))
- ✅ **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- ✅ **npm or yarn** - Package manager (comes with Node.js)
- ✅ **Git** - Version control ([Download](https://git-scm.com/))

---

## 🚀 Installation

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`.

### Step 3: Configure Environment Variables

Create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers

# JWT Configuration
JWT_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING_USE_OPENSSL_RAND_BASE64_32
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

**⚠️ Security Note:** Generate a strong JWT secret for production:

```bash
# Generate secure secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🏃 Running the Server

### Development Mode (Recommended)

With auto-reload using nodemon:

```bash
npm run dev
```

**Console output:**
```
🗄️  MongoDB Connected: localhost
🚀 Server running in development mode on port 5001
📝 Logging enabled with Winston
🛡️  Security features active
```

### Production Mode

Optimized for deployment:

```bash
npm start
```

The server will start on **http://localhost:5001** (or the PORT specified in `.env`)

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-123-4567",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "role": "user",
    "memberSince": "2025-11-11T00:00:00.000Z"
  }
}
```

**Note:** JWT token is set as httpOnly cookie automatically.

---

#### Login User

Authenticate existing user.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "role": "user",
    "memberSince": "2025-11-11T00:00:00.000Z"
  }
}
```

---

#### Get Current User

Get authenticated user's information.

```http
GET /api/auth/me
Cookie: token=<jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "role": "user",
    "memberSince": "2025-11-11T00:00:00.000Z"
  }
}
```

---

#### Update User Details

Update authenticated user's information.

```http
PUT /api/auth/updatedetails
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "phone": "555-999-8888"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "johnupdated@example.com",
    "phone": "555-999-8888",
    "role": "user"
  }
}
```

---

### Booking Routes (`/api/bookings`)

#### Get User's Bookings

Retrieve all bookings for authenticated user.

```http
GET /api/bookings
Cookie: token=<jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "dogName": "Max",
      "dogBreed": "Golden Retriever",
      "service": "Daily Walk (30 min)",
      "date": "2025-11-15T00:00:00.000Z",
      "time": "10:00 AM",
      "duration": "30 min",
      "specialInstructions": "Max loves treats!",
      "status": "pending",
      "price": 25,
      "createdAt": "2025-11-11T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Single Booking

Retrieve a specific booking by ID.

```http
GET /api/bookings/:id
Cookie: token=<jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "dogName": "Max",
    "dogBreed": "Golden Retriever",
    "service": "Daily Walk (30 min)",
    "date": "2025-11-15T00:00:00.000Z",
    "time": "10:00 AM",
    "status": "pending",
    "price": 25
  }
}
```

---

#### Create Booking

Create a new service booking.

```http
POST /api/bookings
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "dogName": "Max",
  "dogBreed": "Golden Retriever",
  "service": "Daily Walk (30 min)",
  "date": "2025-11-15",
  "time": "10:00 AM",
  "duration": "30 min",
  "specialInstructions": "Max loves treats!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "dogName": "Max",
    "dogBreed": "Golden Retriever",
    "service": "Daily Walk (30 min)",
    "date": "2025-11-15T00:00:00.000Z",
    "time": "10:00 AM",
    "duration": "30 min",
    "specialInstructions": "Max loves treats!",
    "status": "pending",
    "price": 25,
    "createdAt": "2025-11-11T00:00:00.000Z"
  }
}
```

**Price Calculation:**
| Service | Price |
|---------|-------|
| Daily Walk (30 min) | $25 |
| Daily Walk (60 min) | $35 |
| Pet Sitting | $40 |
| Emergency Visit | $50 |

---

#### Update Booking

Update an existing booking (users can update most fields, admins can update all).

```http
PUT /api/bookings/:id
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "time": "11:00 AM",
  "specialInstructions": "Updated instructions"
}
```

**Admin-only fields:** `status`, `price`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "time": "11:00 AM",
    "specialInstructions": "Updated instructions"
  }
}
```

---

#### Delete Booking

Delete a booking (only the booking owner or admin).

```http
DELETE /api/bookings/:id
Cookie: token=<jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

#### Get All Bookings (Admin Only)

Retrieve all bookings with pagination.

```http
GET /api/bookings/admin/all?page=1&limit=50
Cookie: token=<admin_jwt_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [
    { /* booking objects */ }
  ]
}
```

---

### Contact Routes (`/api/contact`)

#### Submit Contact Form

Submit a contact inquiry (public endpoint).

```http
POST /api/contact
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-987-6543",
  "message": "I'd like to book a walk for my dog!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you within 2 hours.",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-987-6543",
    "message": "I'd like to book a walk for my dog!",
    "status": "new",
    "createdAt": "2025-11-11T00:00:00.000Z"
  }
}
```

**Rate Limit:** 3 submissions per hour per IP

---

#### Get All Contact Messages (Admin Only)

Retrieve all contact messages with pagination.

```http
GET /api/contact?page=1&limit=50
Cookie: token=<admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 75,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-987-6543",
      "message": "I'd like to book a walk for my dog!",
      "status": "new",
      "createdAt": "2025-11-11T00:00:00.000Z"
    }
  ]
}
```

---

#### Update Contact Message Status (Admin Only)

Update the status of a contact message.

```http
PUT /api/contact/:id
Cookie: token=<admin_jwt_token>
Content-Type: application/json

{
  "status": "responded"
}
```

**Valid statuses:** `new`, `in-progress`, `resolved`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "responded",
    "updatedAt": "2025-11-11T12:00:00.000Z"
  }
}
```

---

### Health Check

Check API status (public endpoint).

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Empire State Walkers API is running",
  "timestamp": "2025-11-11T00:00:00.000Z"
}
```

---

## 🗄 Database Models

### User Model

**Schema:**
```javascript
{
  name: String,                    // Required, 2-50 characters
  email: String,                   // Required, unique, validated
  phone: String,                   // Required, phone format
  password: String,                // Required, hashed with bcrypt
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  memberSince: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:** `email` (unique)

**Hooks:**
- Pre-save: Password hashing with bcrypt
- toJSON: Password field excluded from responses

---

### Booking Model

**Schema:**
```javascript
{
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  dogName: String,                 // Required, 2-50 characters
  dogBreed: String,                // Required, 2-50 characters
  service: {
    type: String,
    enum: [
      'Daily Walk (30 min)',
      'Daily Walk (60 min)',
      'Pet Sitting',
      'Emergency Visit'
    ],
    required: true
  },
  date: Date,                      // Required, future date
  time: String,                    // Required, format: HH:MM AM/PM
  duration: String,                // Optional
  specialInstructions: String,     // Optional, max 500 characters
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: Number,                   // Auto-calculated based on service
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:** `user`, `date`, `status`

---

### Contact Model

**Schema:**
```javascript
{
  name: String,                    // Required, 2-50 characters
  email: String,                   // Required, validated
  phone: String,                   // Optional
  message: String,                 // Required, 10-1000 characters
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:** `email`, `status`, `createdAt`

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** stored in **httpOnly cookies** for authentication.

### Authentication Flow

1. **Registration/Login:** User provides credentials
2. **Token Generation:** Server creates JWT with user ID and role
3. **Cookie Storage:** Token stored in httpOnly cookie (JavaScript cannot access)
4. **Automatic Inclusion:** Browser sends cookie with every request
5. **Token Verification:** Middleware validates token and attaches user to request

### Token Configuration

```javascript
{
  httpOnly: true,           // Prevents XSS attacks
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 30 days           // Token expiration
}
```

### Protected Routes

All routes requiring authentication use the `protect` middleware:

```javascript
router.get('/api/bookings', protect, getBookings);
```

Admin routes use additional `authorize` middleware:

```javascript
router.get('/api/bookings/admin/all', protect, authorize('admin'), getAllBookings);
```

---

## ⚠️ Error Handling

All errors return consistent JSON responses:

### Error Response Format

```json
{
  "success": false,
  "message": "Error description here"
}
```

### HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Validation errors, invalid input |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Valid auth, insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Server Error | Internal server error |

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Rate Limit (429):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## 🛡 Security Features

### Authentication & Authorization

- ✅ **JWT Authentication** - Token-based auth with httpOnly cookies
- ✅ **bcrypt Password Hashing** - 10 salt rounds
- ✅ **Role-Based Access Control** - User/Admin roles
- ✅ **Protected Routes** - Middleware-based protection
- ✅ **Token Expiration** - 30-day default expiration

### Input Validation

- ✅ **express-validator** - Comprehensive validation rules
- ✅ **Input Sanitization** - Trim, normalize, escape
- ✅ **Email Validation** - Format and normalization
- ✅ **Password Complexity** - 8+ chars, uppercase, lowercase, number
- ✅ **Date/Time Validation** - ISO8601 format
- ✅ **Length Limits** - Prevent buffer overflow
- ✅ **Type Checking** - Strict type validation

### Security Middleware

- ✅ **Helmet.js** - Secure HTTP headers
  - Content-Security-Policy
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
- ✅ **CORS** - Explicit origin whitelist
- ✅ **Rate Limiting** - Brute-force protection
  - General API: 100 req/15 min
  - Auth endpoints: 5 req/15 min
  - Contact form: 3 req/hour
- ✅ **CSRF Protection** - Double-submit cookie pattern
- ✅ **HTTPS Enforcement** - Production redirect to HTTPS
- ✅ **Mass Assignment Protection** - Field whitelisting
- ✅ **ObjectId Validation** - Prevent invalid MongoDB queries

### Logging & Monitoring

- ✅ **Winston Logger** - Structured logging with levels
- ✅ **Morgan** - HTTP request logging
- ✅ **Security Events** - Login attempts, failed auth, CORS violations
- ✅ **Error Logs** - Separate error log file
- ✅ **Audit Trail** - Complete request/response logging

---

## 📂 Project Structure

```
backend/
├── config/
│   ├── database.js           # MongoDB connection with retry logic
│   ├── services.js           # Service pricing configuration
│   ├── logger.js             # Winston logger setup
│   └── morganStream.js       # Morgan HTTP logger stream
├── controllers/
│   ├── authController.js     # Registration, login, user management
│   ├── bookingController.js  # Booking CRUD with authorization
│   └── contactController.js  # Contact form handling with pagination
├── middleware/
│   ├── auth.js               # JWT authentication & authorization
│   ├── errorHandler.js       # Global error handler
│   ├── validators.js         # Input validation rules
│   └── validateObjectId.js   # MongoDB ObjectId validator
├── models/
│   ├── User.js               # User schema with bcrypt hooks
│   ├── Booking.js            # Booking schema with auto-pricing
│   └── Contact.js            # Contact schema with status tracking
├── routes/
│   ├── authRoutes.js         # Auth endpoints with rate limiting
│   ├── bookingRoutes.js      # Booking endpoints with validation
│   └── contactRoutes.js      # Contact endpoints with protection
├── utils/
│   └── generateToken.js      # JWT token generator utility
├── logs/                     # Log files (auto-created)
│   ├── all.log              # All logs
│   └── error.log            # Error logs only
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Application entry point
└── README.md                # This file
```

---

## 💻 Development

### Running MongoDB Locally

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```cmd
net start MongoDB
```

### Using MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Whitelist your IP address
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Testing API Endpoints

**Recommended Tools:**
- [Postman](https://www.postman.com/) - Full-featured API client
- [Insomnia](https://insomnia.rest/) - Lightweight REST client
- [Thunder Client](https://www.thunderclient.com/) - VS Code extension
- **cURL** - Command-line testing

**Example cURL:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "password": "Password123"
  }'

# Use cookies in subsequent requests
curl http://localhost:5001/api/auth/me -b cookies.txt
```

### Viewing Logs

```bash
# All logs
tail -f logs/all.log

# Errors only
tail -f logs/error.log

# Search logs
grep "login" logs/all.log
```

---

## 🚢 Deployment

### Environment Variables for Production

**Required for production:**

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=<your_production_mongodb_uri>
JWT_SECRET=<secure_random_string_from_openssl>
JWT_EXPIRE=30d
CORS_ORIGIN=<your_production_frontend_url>
```

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### Deployment Platforms

| Platform | Pros | Cons | MongoDB Support |
|----------|------|------|-----------------|
| **Railway** | Modern, easy deploy | Paid after trial | ✅ Built-in |
| **Render** | Free tier, auto-deploy | Cold starts on free | ✅ Via Atlas |
| **Heroku** | Easy setup, add-ons | Paid plans | ✅ Via Atlas |
| **DigitalOcean** | Full control, cheap VPS | Manual setup | ✅ Managed DB |
| **AWS/Azure/GCP** | Enterprise features | Complex setup | ✅ Full service |

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Update `CORS_ORIGIN` to production URL
- [ ] Enable HTTPS on hosting platform
- [ ] Configure log rotation
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable database backups
- [ ] Test all endpoints in production
- [ ] Monitor performance and errors

---

## 🔮 Future Enhancements

### Priority Features

- [ ] **Email Notifications** - SendGrid/Nodemailer integration
  - Welcome emails
  - Booking confirmations
  - Status updates
- [ ] **Payment Processing** - Stripe integration
  - Online booking payments
  - Subscription plans
  - Refund handling
- [ ] **SMS Notifications** - Twilio integration
  - Booking reminders
  - Status updates
  - Emergency notifications

### Additional Features

- [ ] **Photo Uploads** - AWS S3 integration for pet profiles
- [ ] **Real-Time Updates** - Socket.io for live notifications
- [ ] **Admin Dashboard** - Comprehensive management interface
- [ ] **Automated Testing** - Jest/Mocha test suites
- [ ] **API Documentation** - Swagger/OpenAPI specification
- [ ] **Caching** - Redis for performance optimization
- [ ] **GPS Tracking** - Real-time walk tracking
- [ ] **Review System** - Customer ratings and feedback
- [ ] **Push Notifications** - Mobile app notifications
- [ ] **Multi-language** - i18n internationalization

---

## 📄 License

Copyright © 2025 Empire State Walkers. All rights reserved.

---

## 🆘 Support

For issues, questions, or feature requests:

- **Email:** hello@empirestatewalkers.com
- **GitHub Issues:** [Create an issue](https://github.com/Rubelefsky/empirestatewalkers/issues)
- **Documentation:** [Main README](../README.md) | [Setup Guide](../BACKEND_SETUP.md)

---

<div align="center">

**🐕 Built with ❤️ for Manhattan's four-legged friends**

[⬆ Back to Top](#-empire-state-walkers---backend-api)

</div>
