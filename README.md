# 🐕 Empire State Walkers

<div align="center">

**Professional dog walking and pet care services for Manhattan, NYC**

[![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-endpoints) • [Security](#-security)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
  - [Dashboard Features](#dashboard-features)
- [Quick Start](#-quick-start)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Security](#-security)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🎯 Overview

Empire State Walkers is a modern, full-stack web application for a professional dog walking and pet care service. Built with security-first principles, the application features JWT authentication, comprehensive input validation, rate limiting, and a responsive UI optimized for all devices.

**Service Area:** Manhattan (Upper East/West Side, Midtown, Lower East/West Side) and Queens (Astoria, Long Island City)

## ✨ Features

### Core Functionality
- 🎨 **Minimalist Design** - Clean, responsive UI with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Input Validation** - Comprehensive server-side validation with express-validator
- 📅 **Booking System** - Full CRUD operations with automated pricing and status tracking
- 👤 **User Dashboard** - Personalized booking management with create, edit, and cancel capabilities
- 👑 **Admin Dashboard** - Comprehensive admin interface with booking oversight and contact message management
- 📊 **Real-time Statistics** - Live booking stats with status breakdowns (pending, confirmed, completed)
- 📧 **Contact Management** - Integrated contact form with admin tracking and status updates
- 🛡️ **Rate Limiting** - Brute-force protection on all endpoints
- 🔒 **Role-Based Access** - User and admin roles with protected routes

### Services Offered
| Service | Duration | Price |
|---------|----------|-------|
| Daily Walk | 30 minutes | $25 |
| Daily Walk | 60 minutes | $35 |
| Pet Sitting | Per visit | $40 |
| Emergency Visit | Same-day | $50 |
| Additional Services | - | Custom pricing |

*Additional services include grooming, training, transportation, and photo sessions*

### Dashboard Features

**User Dashboard** (`index.html`)
- 📝 **Create Bookings** - Interactive modal form with service selection, date/time pickers, and special instructions
- ✏️ **Edit Bookings** - Modify pending bookings with full form validation
- ❌ **Cancel Bookings** - Cancel bookings with confirmation dialog
- 📋 **View Bookings** - See all your bookings with visual status indicators
- 👤 **Account Info** - View email, member since date, and total booking count
- 🎨 **Responsive Design** - Optimized for mobile, tablet, and desktop

**Admin Dashboard** (`admin.html`)
- 📊 **Statistics Overview** - Real-time cards showing total, pending, confirmed, and completed bookings
- 📋 **All Bookings View** - See bookings from all users with filtering by status
- ✅ **Status Management** - Update booking status (pending → confirmed → completed)
- 🔍 **Detailed Views** - Modal dialogs with comprehensive booking and customer information
- 💬 **Contact Messages** - View and manage contact form submissions with status tracking
- 🗂️ **Tab Navigation** - Switch between bookings and messages tabs
- 🔐 **Admin-Only Access** - Accessible only to users with admin role

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# 1. Ensure MongoDB is running
brew services start mongodb-community  # macOS
# or: sudo systemctl start mongod      # Linux

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env if needed (defaults work locally)

# 3. Start backend (port 5001)
npm run dev

# 4. In a new terminal, start frontend (port 8080)
cd ..
python3 -m http.server 8080

# 5. Open http://localhost:8080
```

**Test Login:** Register with password format: `Password123` (8+ chars, uppercase, lowercase, number)

**Access Dashboards:**
- **User Dashboard:** Log in at `http://localhost:8080` and click "Dashboard" link
- **Admin Dashboard:** Navigate to `http://localhost:8080/admin.html` (requires admin role)
- **Make user admin:** See [Database](#-database) section for MongoDB command

## 🛠 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles with Tailwind CSS
- **JavaScript** - Vanilla JS with fetch API
- **Tailwind CSS** - Utility-first CSS framework (CDN)
- **Font Awesome** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing (10 salt rounds)
- **express-validator** - Input validation and sanitization
- **express-rate-limit** - Rate limiting middleware
- **helmet** - Security headers
- **winston** - Logging
- **morgan** - HTTP request logger

## 📦 Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Modern web browser

### Step 1: Clone Repository
```bash
git clone https://github.com/Rubelefsky/empirestatewalkers.git
cd empirestatewalkers
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5001                           # Port 5001 (5000 conflicts with macOS AirPlay)
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers

# JWT Authentication
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### Step 3: Database Setup

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env`

### Step 4: Start Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5001`

### Step 5: Frontend Setup
```bash
# From project root
python3 -m http.server 8080
# or: npx http-server -p 8080
# or: php -S localhost:8080
```

Navigate to `http://localhost:8080`

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/updatedetails` | Yes | Update user details |

### Bookings (`/api/bookings`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Yes | Get user's bookings |
| GET | `/api/bookings/:id` | Yes | Get single booking |
| POST | `/api/bookings` | Yes | Create booking |
| PUT | `/api/bookings/:id` | Yes | Update booking |
| DELETE | `/api/bookings/:id` | Yes | Delete booking |
| GET | `/api/bookings/admin/all` | Admin | Get all bookings |

### Contact (`/api/contact`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | No | Submit contact form |
| GET | `/api/contact` | Admin | Get all messages |
| PUT | `/api/contact/:id` | Admin | Update message status |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | API health check |

**Example Usage:**
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"555-1234","password":"Password123"}'

# Create booking
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"dogName":"Max","dogBreed":"Golden Retriever","service":"Daily Walk (30 min)","date":"2025-01-15","time":"10:00 AM"}'
```

For detailed API documentation, see [backend/README.md](backend/README.md)

## 🗄 Database

### Data Models

**User Schema**
- name, email (unique), phone, password (hashed)
- memberSince, role (user/admin)

**Booking Schema**
- user (ref), dogName, dogBreed, service
- date, time, duration, specialInstructions
- status (pending/confirmed/completed/cancelled), price

**Contact Schema**
- name, email, phone, message
- status (new/in-progress/resolved), createdAt

### MongoDB Operations

**Quick Database Commands:**
```bash
# View all collections
mongosh mongodb://localhost:27017/empirestatewalkers --eval "db.getCollectionNames()"

# Count users
mongosh mongodb://localhost:27017/empirestatewalkers --eval "db.users.countDocuments()"

# Make user an admin
mongosh mongodb://localhost:27017/empirestatewalkers --eval \
  "db.users.updateOne({email: 'user@example.com'}, {\$set: {role: 'admin'}})"

# View database statistics
mongosh mongodb://localhost:27017/empirestatewalkers --eval "
  print('Users: ' + db.users.countDocuments());
  print('Bookings: ' + db.bookings.countDocuments());
  print('Contacts: ' + db.contacts.countDocuments());
"

# Backup database
mongodump --db=empirestatewalkers --out=/path/to/backup

# Restore database
mongorestore --db=empirestatewalkers /path/to/backup/empirestatewalkers
```

**Interactive Shell:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers

# Inside shell:
db.users.find().pretty()                    // View all users
db.bookings.find({status: "pending"})        // Find pending bookings
db.users.find({role: "admin"})              // Find admin users
```

## 🛡 Security

### Authentication & Authorization
- **Password Security** - bcrypt hashing with 10 salt rounds
- **JWT Authentication** - Token-based auth with 30-day expiration
- **Protected Routes** - Middleware-based route protection
- **Role-Based Access** - User/admin separation with authorization checks

### Input Validation
All endpoints enforce strict validation:

**User Registration:**
- Name: 2-50 characters
- Email: Valid format, normalized to lowercase
- Phone: Valid phone format
- Password: 8+ characters with uppercase, lowercase, and number

**Booking Creation:**
- Dog Name/Breed: 2-50 characters
- Service: Must match predefined services
- Date: Must be today or future date (YYYY-MM-DD)
- Time: Valid time format (HH:MM AM/PM)
- Special Instructions: Max 500 characters

**Contact Form:**
- Name: 2-50 characters
- Email: Valid format
- Message: 10-1000 characters

### Rate Limiting
- **General API:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 login attempts per 15 minutes per IP
- Successful auth requests don't count toward limit

### Additional Security
- **Helmet.js** - Secure HTTP headers
- **CORS** - Configurable origin via environment variable
- **Field Filtering** - Passwords excluded from API responses
- **Error Handling** - No stack traces in production
- **404 Handler** - Catches undefined routes

## 🚢 Deployment

### Backend Deployment

**Recommended Platforms:**
- **Railway** - Modern platform with MongoDB support
- **Render** - Free tier available
- **Heroku** - With MongoDB Atlas integration
- **DigitalOcean** - VPS with full control

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret_key
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-production-domain.com
```

⚠️ **Important:** Always update `CORS_ORIGIN` to match your production frontend URL

### Frontend Deployment

**Recommended Platforms:**
- **Netlify** - Easy static site deployment
- **Vercel** - Optimized for frontend
- **GitHub Pages** - Free hosting
- **AWS S3 + CloudFront** - Enterprise CDN

## 🔧 Troubleshooting

### Backend Won't Start
- ✓ Ensure MongoDB is running: `brew services start mongodb-community`
- ✓ Check `.env` file exists with correct values
- ✓ Verify dependencies installed: `npm install`
- ✓ Check port 5001 is not in use
- **macOS:** Port 5000 conflicts with AirPlay Receiver (use 5001 or disable AirPlay in System Settings)

### Frontend Can't Connect to API
- ✓ Backend server running on port 5001
- ✓ `API_URL` in `frontend-api.js` matches backend URL
- ✓ `CORS_ORIGIN` in backend `.env` matches frontend URL
- ✓ Check browser console for detailed errors

### Authentication Issues
- ✓ Clear browser localStorage and cookies
- ✓ Verify `JWT_SECRET` is set in backend `.env`
- ✓ Check token hasn't expired (30-day default)
- ✓ Password meets requirements (8+ chars, uppercase, lowercase, number)
- ✓ If "Too many requests" error, wait 15 minutes (rate limit)

## 📂 Project Structure

```
empirestatewalkers/
├── frontend/
│   ├── index.html              # Main HTML file with user dashboard
│   ├── admin.html              # Admin dashboard interface
│   ├── admin.js                # Admin dashboard functionality
│   ├── admin.css               # Admin-specific styles
│   ├── styles.css              # Custom CSS styles
│   └── frontend-api.js         # Frontend with full API integration
├── backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   ├── services.js         # Service pricing configuration
│   │   ├── logger.js           # Winston logger setup
│   │   └── morganStream.js     # Morgan HTTP logger stream
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── bookingController.js # Booking CRUD operations
│   │   └── contactController.js # Contact form handling
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication & authorization
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── validators.js       # Input validation rules
│   │   └── validateObjectId.js # MongoDB ObjectId validator
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Booking.js          # Booking schema
│   │   └── Contact.js          # Contact schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints with rate limiting
│   │   ├── bookingRoutes.js    # Booking endpoints with validation
│   │   └── contactRoutes.js    # Contact endpoints
│   ├── utils/
│   │   └── generateToken.js    # JWT token generator
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Express server entry point
│   └── README.md               # Backend documentation
└── README.md                   # This file
```

## 🔄 Recent Updates

### November 2025: Comprehensive Dashboard Implementation
- ✅ **User Dashboard** - Full booking management with create, edit, and cancel capabilities
- ✅ **Admin Dashboard** - Complete admin interface at `/admin.html` with:
  - Real-time statistics (total, pending, confirmed, completed bookings)
  - All-user booking view with status filtering
  - Booking status management workflow
  - Contact message tracking with status updates
  - Tab-based navigation between bookings and messages
- ✅ **Enhanced UI** - Modal dialogs, status badges, and responsive design
- ✅ **XSS Protection** - Secure DOM manipulation throughout
- ✅ **Date Validation** - Prevention of past-date bookings

### November 2025: Security Hardening & Production Readiness
- ✅ Fixed all HIGH severity security vulnerabilities (100% elimination)
- ✅ Upgraded to secure dependency versions (helmet 8.1.0, winston 3.18.3, csrf-sync 4.2.1)
- ✅ Added comprehensive logging with Winston
- ✅ Implemented HTTP request logging with Morgan
- ✅ Enhanced rate limiting configuration
- ✅ Fixed registration bug with password validation standardization
- ✅ Changed default port from 5000 to 5001 (macOS AirPlay compatibility)
- ✅ Added MongoDB query examples and database management guide
- ✅ Improved error messages and validation feedback

## 🚧 Future Enhancements

- [ ] Email notifications (SendGrid/Nodemailer)
- [ ] Payment processing (Stripe integration)
- [ ] SMS notifications (Twilio)
- [ ] Photo upload for pet profiles (AWS S3)
- [ ] Real-time updates (Socket.io)
- [ ] Automated testing suite (Jest/Mocha)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Caching with Redis
- [ ] Walk tracking with GPS
- [ ] Review and rating system
- [ ] Push notifications
- [ ] Calendar view for bookings
- [ ] Export booking data (CSV/PDF)

## 🤝 Contributing

This is a private project. For inquiries about modifications or features, please contact the owner.

## 📞 Contact

- **Phone:** (555) 123-4567
- **Email:** walk@esw.dog
- **Hours:** 7am - 9pm daily
- **GitHub Issues:** [Create an issue](https://github.com/Rubelefsky/empirestatewalkers/issues)

## 📄 License

Copyright © 2025 Empire State Walkers. All rights reserved.

---

<div align="center">

**Built with ❤️ for Manhattan's four-legged friends**

[⬆ Back to Top](#-empire-state-walkers)

</div>
