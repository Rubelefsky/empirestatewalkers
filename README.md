# Empire State Walkers

Professional dog walking and pet sitting services - Full-stack web application for Manhattan, NYC.

## Overview

Empire State Walkers is a modern, full-stack web application for a professional dog walking and pet care service based in Manhattan. The application features a minimalist design, production-ready security with rate limiting and comprehensive input validation, RESTful backend API with MongoDB integration, JWT authentication, advanced booking management, and a responsive user interface.

## Quick Start

Get the application running in 5 minutes:

```bash
# 1. Ensure MongoDB is running
brew services start mongodb-community  # macOS
# or: sudo systemctl start mongod      # Linux

# 2. Clone and setup backend
cd empirestatewalkers/backend
npm install
cp .env.example .env
# Edit .env if needed (default settings work for local development)

# 3. Start backend server (port 5001)
npm run dev

# 4. In a new terminal, start frontend server (port 8080)
cd ..
python3 -m http.server 8080

# 5. Open browser to http://localhost:8080
```

**Test Registration:**
- Click "Login" → "Register"
- Password must be 8+ characters with uppercase, lowercase, and number
- Example: `Password123`

## Features

### Core Functionality
- **Minimalist, Responsive Design**: Clean, modern UI optimized for desktop, tablet, and mobile devices
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing and rate limiting
- **Comprehensive Input Validation**: Server-side validation on all endpoints using express-validator
- **Advanced Booking System**: Full CRUD operations with automated pricing, ownership verification, and status tracking
- **Customer Dashboard**: Personalized dashboard for managing bookings and account information
- **Contact Management**: Backend-integrated contact form with admin message tracking and status updates
- **Production-Ready API**: RESTful backend with rate limiting, error handling, and security best practices
- **Role-Based Access Control**: User and admin roles with middleware-protected routes
- **Rate Limiting**: Brute-force protection with configurable request limits per endpoint

### Services Offered
- **Daily Walks**: 30-60 minute walks ($25-35)
- **Pet Sitting**: In-home care and companionship ($40/visit)
- **Emergency Visits**: Same-day availability ($50/visit)
- **Additional Services**: Basic grooming, training, transportation, and photo sessions

## Technology Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Custom styles with Tailwind CSS framework
- **JavaScript**: Vanilla JS with API integration
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Font Awesome**: Icon library for UI elements

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Secure password hashing with salt rounds
- **CORS**: Cross-origin resource sharing with configurable origins
- **express-validator**: Comprehensive input validation and sanitization
- **express-rate-limit**: Rate limiting middleware for brute-force protection

## Project Structure

```
empirestatewalkers/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Custom CSS styles with Tailwind
│   └── frontend-api.js     # Frontend with full API integration
├── backend/
│   ├── config/
│   │   ├── database.js     # MongoDB connection configuration
│   │   └── services.js     # Service pricing configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic with field filtering
│   │   ├── bookingController.js # Booking CRUD with ownership verification
│   │   └── contactController.js # Contact form handling
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication & role-based authorization
│   │   ├── errorHandler.js # Global error handler with JWT/Mongoose support
│   │   └── validators.js   # Input validation rules for all endpoints
│   ├── models/
│   │   ├── User.js         # User schema with password hashing
│   │   ├── Booking.js      # Booking schema with pricing
│   │   └── Contact.js      # Contact schema with status tracking
│   ├── routes/
│   │   ├── authRoutes.js   # Auth endpoints with rate limiting
│   │   ├── bookingRoutes.js # Booking endpoints with validation
│   │   └── contactRoutes.js # Contact endpoints
│   ├── utils/
│   │   └── generateToken.js # JWT token generator
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Express server with middleware setup
│   └── README.md           # Backend documentation
└── README.md               # This file
```

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager
- Modern web browser

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/Rubelefsky/empirestatewalkers.git
cd empirestatewalkers
```

#### 2. Backend Setup

Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers

# JWT Authentication
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

**Note**: Port 5001 is used instead of 5000 because macOS AirPlay Receiver uses port 5000 by default.

#### 3. Database Setup

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
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `.env` with your Atlas connection string

#### 4. Start the Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5001`

#### 5. Frontend Setup

The frontend is already configured to use the full API integration via `frontend-api.js`.

Serve the frontend using a local development server:
```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js with npx
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Navigate to `http://localhost:8080` in your browser.

**Important**: Ensure the `CORS_ORIGIN` in your backend `.env` file matches your frontend URL (default: `http://localhost:8080`). In development mode, CORS is configured to allow all origins for easier testing.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/updatedetails` - Update user details (protected)

### Bookings (`/api/bookings`)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:id` - Get single booking (protected)
- `POST /api/bookings` - Create new booking (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `DELETE /api/bookings/:id` - Delete booking (protected)
- `GET /api/bookings/admin/all` - Get all bookings (admin only)

### Contact (`/api/contact`)
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin only)
- `PUT /api/contact/:id` - Update message status (admin only)

### Health Check
- `GET /api/health` - API health check

For detailed API documentation, see [backend/README.md](backend/README.md)

## Usage

### For Customers

1. **Browse Services**: Navigate through the site to view available services and pricing
2. **Register/Login**: Create an account or login to access the booking system
3. **Book a Service**: Fill out the booking form with your pet's details and preferred time
4. **Manage Bookings**: Access your dashboard to view and manage your bookings
5. **Update Profile**: Update your contact information from the dashboard

### For Developers

#### Testing API Endpoints

Use tools like Postman, Insomnia, or Thunder Client:

```bash
# Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'

# Create booking (requires auth token)
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dogName": "Max",
    "dogBreed": "Golden Retriever",
    "service": "Daily Walk (30 min)",
    "date": "2025-01-15",
    "time": "10:00 AM",
    "duration": "30 min"
  }'
```

## Database Models

### User
- name, email (unique), phone, password (hashed)
- memberSince, role (user/admin)

### Booking
- user (ref), dogName, dogBreed, service
- date, time, duration, specialInstructions
- status (pending/confirmed/completed/cancelled)
- price

### Contact
- name, email, phone, message
- status (new/in-progress/resolved)
- createdAt

## Working with MongoDB

### Accessing MongoDB Shell

```bash
# Connect to your database
mongosh mongodb://localhost:27017/empirestatewalkers
```

### Common Database Operations

**View Collections:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.getCollectionNames()"
```

**View All Users:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.users.find().pretty()"
```

**Count Users:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.users.countDocuments()"
```

**Find User by Email:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.users.findOne({email: 'user@example.com'})"
```

**Make User an Admin:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.users.updateOne({email: 'user@example.com'}, {\$set: {role: 'admin'}})"
```

**Delete a User:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "db.users.deleteOne({email: 'user@example.com'})"
```

**View Database Statistics:**
```bash
mongosh mongodb://localhost:27017/empirestatewalkers --quiet --eval "
  print('Total Users: ' + db.users.countDocuments());
  print('Total Bookings: ' + db.bookings.countDocuments());
  print('Total Contacts: ' + db.contacts.countDocuments());
"
```

**Export Collection to JSON:**
```bash
mongoexport --db=empirestatewalkers --collection=users --out=users_backup.json --pretty
```

**Import Collection from JSON:**
```bash
mongoimport --db=empirestatewalkers --collection=users --file=users_backup.json
```

**Backup Entire Database:**
```bash
mongodump --db=empirestatewalkers --out=/path/to/backup
```

**Restore Database:**
```bash
mongorestore --db=empirestatewalkers /path/to/backup/empirestatewalkers
```

### Interactive MongoDB Shell Commands

Once connected with `mongosh mongodb://localhost:27017/empirestatewalkers`:

```javascript
// View all users
db.users.find().pretty()

// Find users by criteria
db.users.find({role: "admin"})
db.users.find({name: /Brandon/i})  // Case-insensitive search

// Sort users by creation date
db.users.find().sort({createdAt: -1})

// Select specific fields only
db.users.find({}, {name: 1, email: 1, _id: 0})

// View all bookings
db.bookings.find().pretty()

// Find bookings for a specific user
db.bookings.find({user: ObjectId("user_id_here")})

// Find pending bookings
db.bookings.find({status: "pending"})

// Update booking status
db.bookings.updateOne(
  {_id: ObjectId("booking_id_here")},
  {$set: {status: "confirmed"}}
)

// View all contact submissions
db.contacts.find().pretty()

// Exit shell
exit
```

## Input Validation Requirements

All API endpoints enforce strict validation rules to ensure data integrity and security:

### User Registration
- **Name**: Required, 2-50 characters
- **Email**: Required, valid email format, normalized (lowercase)
- **Phone**: Required, valid phone format
- **Password**: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Booking Creation/Update
- **Dog Name**: Required, 2-50 characters
- **Dog Breed**: Required, 2-50 characters
- **Service**: Required, must be one of:
  - "Daily Walk (30 min)" - $25
  - "Daily Walk (60 min)" - $35
  - "Pet Sitting" - $40
  - "Emergency Visit" - $50
  - "Other" - Custom pricing
- **Date**: Required, must be today or future date (format: YYYY-MM-DD)
- **Time**: Required, valid time format (HH:MM AM/PM)
- **Duration**: Optional, 2-50 characters
- **Special Instructions**: Optional, maximum 500 characters
- **Status**: Optional for updates, one of: pending, confirmed, completed, cancelled

### Contact Form
- **Name**: Required, 2-50 characters
- **Email**: Required, valid email format
- **Phone**: Optional, valid phone format if provided
- **Message**: Required, 10-1000 characters

All validation errors return a 400 status code with detailed error messages indicating which fields failed validation and why.

## Security Features

### Authentication & Authorization
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Token-based auth with configurable expiration (default: 30 days)
- **Protected Routes**: Middleware-based route protection with JWT verification
- **Role-Based Access Control**: User and admin role separation with authorization middleware

### Input Protection
- **Comprehensive Input Validation**: Express-validator on all endpoints with detailed rules:
  - Email validation and normalization
  - Password strength requirements (8+ chars, uppercase, lowercase, number)
  - Phone number format validation
  - Date validation (prevents past date bookings)
  - Message length limits (10-1000 characters)
  - Service type enum validation

### Rate Limiting
- **Brute-Force Protection**: Express-rate-limit middleware
  - General API: 100 requests per 15 minutes per IP
  - Auth endpoints: 5 login attempts per 15 minutes per IP
  - Skips counting successful authentication requests

### Data Protection
- **Field Filtering**: Sensitive data (passwords) excluded from API responses
- **Error Handling**: Centralized error handler with production/development modes
  - No stack traces in production
  - Specific handling for JWT, Mongoose, and validation errors
  - Generic error messages to prevent information leakage

### Network Security
- **CORS Configuration**: Configurable origin via environment variable
- **404 Handler**: Catches undefined routes
- **Uncaught Exception Handler**: Graceful error handling for unexpected errors

## Service Area

Currently serving:
- Upper East Side, Manhattan
- Upper West Side, Manhattan
- Midtown, Manhattan
- Lower East Side, Manhattan
- Lower West Side, Manhattan
- Astoria, Queens
- Long Island City, Queens

## Contact Information

- **Phone**: (555) 123-4567
- **Email**: walk@esw.dog
- **Hours**: Available 7am - 9pm daily

## Deployment

### Backend Deployment

Recommended platforms:
- **Railway**: Modern platform with MongoDB support
- **Render**: Free tier available
- **Heroku**: With MongoDB Atlas integration
- **DigitalOcean**: VPS with full control
- **AWS/GCP/Azure**: Enterprise solutions

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret_key
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-production-frontend-domain.com
```

**Important**: Always update `CORS_ORIGIN` to match your production frontend URL for security.

### Frontend Deployment

Deploy to:
- **Netlify**: Easy static site deployment
- **Vercel**: Optimized for frontend
- **GitHub Pages**: Free hosting
- **AWS S3 + CloudFront**: Enterprise CDN solution

## Recent Updates

### November 2025: Registration Bug Fix & Configuration Updates

**Bug Fixes:**
- Fixed registration failure due to password validation mismatch:
  - Frontend form required minimum 6 characters
  - Backend validator required minimum 8 characters with complexity rules
  - User model required minimum 6 characters
  - **Resolution**: Standardized all validation to 8 characters minimum with uppercase, lowercase, and number requirements
- Added HTML5 pattern validation on registration form with user-friendly error messages
- Enhanced frontend error handling to display detailed validation errors from backend

**Configuration Changes:**
- Changed default backend port from 5000 to 5001 to avoid conflicts with macOS AirPlay Receiver
- Updated frontend API URL to `http://localhost:5001/api`
- Updated CORS configuration to allow all origins in development mode for easier testing
- Updated all documentation and examples to reflect new port configuration

**Improvements:**
- Added client-side password strength validation before API submission
- Improved error messages to show which fields failed validation and why
- Added MongoDB query examples and database management guide
- Enhanced troubleshooting section with macOS-specific issues

**Testing:**
- Verified registration endpoint with valid credentials
- Tested password validation rejection for weak passwords
- Confirmed user data is properly stored in MongoDB with bcrypt-hashed passwords
- Validated CORS functionality across different origins

### Previous Refactor: Security & Code Quality Improvements

Major updates focused on production-readiness, security hardening, and code maintainability:

**Security Enhancements:**
- Added rate limiting middleware (express-rate-limit) to prevent brute-force attacks
- Implemented comprehensive input validation on all endpoints using express-validator
- Enhanced error handler with specific JWT and Mongoose error handling
- Added field filtering to prevent password leakage in API responses
- Configured CORS via environment variable for better security control
- Added 404 handler and uncaught exception handler

**Code Quality Improvements:**
- Extracted service pricing to configuration file (`backend/config/services.js`)
- Created validation middleware module (`backend/middleware/validators.js`)
- Simplified controller logic with helper functions
- Fixed User model pre-hook bug (missing return statement)
- Removed deprecated Mongoose connection options
- Updated Contact model status enum (new/in-progress/resolved)
- Improved code consistency and reduced duplication

**Frontend Improvements:**
- Removed insecure `script.js` file that stored passwords in plain text
- Updated `index.html` to use only secure `frontend-api.js`

**Developer Experience:**
- Updated `.env.example` with all configuration options
- Enhanced error messages for better debugging
- Consistent code style across all files
- Better structured validation error responses

## Future Enhancements

### Planned Features
- [ ] Email notifications (SendGrid/Nodemailer)
- [ ] Payment processing (Stripe integration)
- [ ] SMS notifications (Twilio)
- [ ] Photo upload for pet profiles (AWS S3)
- [ ] Real-time updates (Socket.io)
- [ ] Admin dashboard interface
- [ ] Automated testing suite
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting and request throttling
- [ ] Caching with Redis
- [ ] Walk tracking with GPS integration
- [ ] Review and rating system
- [ ] Real-time availability calendar
- [ ] Push notifications

## Contributing

This is a private project. For inquiries about modifications or features, please contact the owner.

## License

Copyright © 2025 Empire State Walkers. All rights reserved.

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- Check `.env` file exists and has correct values
- Verify all dependencies are installed: `npm install`
- Check port 5001 is not already in use
- **macOS Issue**: If port 5000 is in use, it's likely AirPlay Receiver. Either:
  - Use port 5001 (recommended, already configured)
  - Disable AirPlay Receiver in System Settings > General > AirDrop & Handoff

### Frontend can't connect to API
- Ensure backend server is running on port 5001
- Check API_URL in `frontend-api.js` matches backend URL (`http://localhost:5001/api`)
- Verify `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check browser console for detailed error messages
- In development, CORS allows all origins for easier testing

### Authentication issues
- Clear browser localStorage and cookies
- Verify JWT_SECRET is set in backend `.env`
- Check token hasn't expired (default: 30 days)
- Ensure password meets requirements (8+ chars, uppercase, lowercase, number)
- If getting "Too many requests" error, wait 15 minutes (rate limit protection)

## Support

For technical support or business inquiries:
- Email: walk@esw.dog
- GitHub Issues: [Create an issue](https://github.com/Rubelefsky/empirestatewalkers/issues)
