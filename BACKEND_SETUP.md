# Backend Setup Guide

This guide will help you set up and run the Empire State Walkers backend API.

## Quick Start

### 1. Install MongoDB

**Option A: Local Installation**

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

**Option B: MongoDB Atlas (Cloud - Free Tier)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/empirestatewalkers`)
4. Use this in your `.env` file

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

The `.env` file is already created with development defaults. For production or MongoDB Atlas, update:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/empirestatewalkers

JWT_SECRET=esw_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4. Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

### 5. Test the API

Visit: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "Empire State Walkers API is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Using the Frontend with Backend

### Option 1: Replace script.js (Recommended)

```bash
# Backup original
mv script.js script-original.js

# Use API-enabled version
mv frontend-api.js script.js
```

### Option 2: Update index.html

Change the script tag in `index.html`:
```html
<!-- Old -->
<script src="script.js"></script>

<!-- New -->
<script src="frontend-api.js"></script>
```

### Start Frontend

```bash
# From the root directory
python -m http.server 3000
# OR
npx http-server -p 3000
```

Visit: http://localhost:3000

## Testing the Full Stack

1. **Register a new account**
   - Click "Login" button
   - Click "Register"
   - Fill in details and submit

2. **Login**
   - Use your email and password
   - You'll be redirected to dashboard

3. **Submit a contact form**
   - Go to Contact section
   - Fill and submit

4. **Create a booking** (requires booking form in frontend)

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```bash
# Check if MongoDB is running
# macOS
brew services list

# Linux
sudo systemctl status mongod

# Start MongoDB if not running
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### CORS Error

**Error:** `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution:** The backend CORS is configured to allow `http://localhost:3000`. Make sure:
1. Frontend runs on port 3000
2. Backend CORS config in `server.js` includes your frontend URL

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill process on port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response, then:

### Get User Info
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "dogName": "Max",
    "dogBreed": "Golden Retriever",
    "service": "Daily Walk (30 min)",
    "date": "2025-01-15",
    "time": "10:00 AM",
    "duration": "30 min",
    "specialInstructions": "Loves treats!"
  }'
```

## Development Tips

### View Database in MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Select `empirestatewalkers` database
4. Browse collections: `users`, `bookings`, `contacts`

### Reset Database

```bash
# Connect to MongoDB shell
mongosh

# Use database
use empirestatewalkers

# Drop all collections
db.users.drop()
db.bookings.drop()
db.contacts.drop()
```

### Create Admin User

Currently, all users are created as regular users. To create an admin:

1. Register normally through the API
2. Connect to MongoDB and update:

```bash
mongosh
use empirestatewalkers
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Production Deployment

See `backend/README.md` for detailed deployment instructions.

Quick checklist:
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origin to your production domain
- [ ] Use HTTPS
- [ ] Set up environment variables on hosting platform
- [ ] Enable security features (rate limiting, helmet, etc.)

## Need Help?

- Backend API docs: See `backend/README.md`
- MongoDB docs: https://docs.mongodb.com/
- Express docs: https://expressjs.com/
- Mongoose docs: https://mongoosejs.com/
