# 🚀 Backend Setup Guide

<div align="center">

**Complete setup guide for Empire State Walkers backend API**

[![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)

[Quick Start](#-quick-start) • [MongoDB Setup](#-install-mongodb) • [Configuration](#-configure-environment-variables) • [Testing](#-test-the-api) • [Troubleshooting](#-troubleshooting)

</div>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Install MongoDB](#-install-mongodb)
- [Install Dependencies](#-install-backend-dependencies)
- [Configure Environment](#-configure-environment-variables)
- [Start Server](#-start-the-backend-server)
- [Test the API](#-test-the-api)
- [Frontend Integration](#-using-the-frontend-with-backend)
- [Full Stack Testing](#-testing-the-full-stack)
- [Troubleshooting](#-troubleshooting)
- [API Testing](#-api-testing-with-curl)
- [Development Tips](#-development-tips)
- [Production Deployment](#-production-deployment)

---

## ⚡ Quick Start

Get the backend running in 5 minutes:

```bash
# 1. Start MongoDB
brew services start mongodb-community  # macOS
# or: sudo systemctl start mongod      # Linux

# 2. Install dependencies
cd backend
npm install

# 3. Environment is pre-configured (.env exists)

# 4. Start development server
npm run dev

# 5. Test the API
curl http://localhost:5001/api/health
```

---

## 🗄 Install MongoDB

### Option A: Local Installation

<details>
<summary><strong>macOS</strong></summary>

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Verify installation:
```bash
brew services list | grep mongodb
```

</details>

<details>
<summary><strong>Ubuntu/Debian</strong></summary>

```bash
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verify installation:
```bash
sudo systemctl status mongod
```

</details>

<details>
<summary><strong>Windows</strong></summary>

1. Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run installer and follow setup wizard
3. MongoDB runs as a Windows service automatically

Verify installation:
```cmd
net start MongoDB
```

</details>

### Option B: MongoDB Atlas (Cloud - Free Tier)

Perfect for development and production:

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster** (M0 Sandbox - Free Forever)
3. **Get your connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/empirestatewalkers
   ```
4. **Update `.env`** with your Atlas connection string

**Benefits:**
- ✅ No local installation required
- ✅ Free tier includes 512MB storage
- ✅ Automatic backups
- ✅ Production-ready infrastructure
- ✅ Built-in monitoring

---

## 📦 Install Backend Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

**Installed packages include:**
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- express-validator - Input validation
- express-rate-limit - Rate limiting
- helmet - Security headers
- winston - Logging
- morgan - HTTP request logging
- cors - CORS middleware
- csrf-sync - CSRF protection

---

## ⚙️ Configure Environment Variables

The `.env` file is already created with development defaults. For production or MongoDB Atlas, update as needed:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/empirestatewalkers

# JWT Configuration
JWT_SECRET=REPLACE_WITH_SECURE_RANDOM_STRING_USE_OPENSSL_RAND_BASE64_32
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### 🔐 Security: Generate Strong JWT Secret

**⚠️ CRITICAL:** Before deploying to production, generate a cryptographically secure JWT secret:

```bash
# Option 1: Using OpenSSL (Recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234VwX=
```

**Copy the generated string** and replace `JWT_SECRET` in your `.env` file.

**Why this matters:**
- Weak secrets can be brute-forced
- Production requires 256+ bits of entropy
- Never reuse example secrets from documentation

---

## 🏃 Start the Backend Server

### Development Mode (with auto-reload)

Perfect for development with nodemon:

```bash
npm run dev
```

**Features:**
- Auto-restarts on file changes
- Detailed error messages
- Debug logging enabled
- CORS configured for localhost

### Production Mode

Optimized for production deployment:

```bash
npm start
```

**Features:**
- Optimized performance
- Production logging
- HTTPS enforcement
- Security headers enabled

### Expected Output

```
🗄️  MongoDB Connected: localhost
🚀 Server running in development mode on port 5001
📝 Logging enabled with Winston
🛡️  Security features active
```

---

## ✅ Test the API

### Health Check

Verify the API is running:

```bash
curl http://localhost:5001/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Empire State Walkers API is running",
  "timestamp": "2025-11-11T00:00:00.000Z"
}
```

### Test All Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/health` | GET | Health check | No |
| `/api/auth/register` | POST | Register user | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/bookings` | GET | Get user bookings | Yes |
| `/api/contact` | POST | Submit contact | No |

---

## 🎨 Using the Frontend with Backend

### Option 1: Use Existing Configuration (Recommended)

The frontend is already configured to use the backend API. Just start both servers:

```bash
# Terminal 1: Backend (port 5001)
cd backend
npm run dev

# Terminal 2: Frontend (port 8080)
cd ..
python3 -m http.server 8080
```

### Option 2: Update API URL

If you need to change the backend URL, update `frontend-api.js`:

```javascript
// Change this line if using different port/host
const API_URL = 'http://localhost:5001';
```

### Start Frontend

Choose your preferred method:

```bash
# From project root directory

# Option A: Python (most common)
python3 -m http.server 8080

# Option B: Node.js http-server
npx http-server -p 8080

# Option C: PHP
php -S localhost:8080
```

**Access application:** http://localhost:8080

---

## 🧪 Testing the Full Stack

### 1. Register a New Account

1. Navigate to http://localhost:8080
2. Click **"Login"** button in navigation
3. Click **"Register"** tab
4. Fill in registration form:
   - **Name:** Your Name
   - **Email:** your@email.com
   - **Phone:** 555-1234
   - **Password:** Password123 (8+ chars, uppercase, lowercase, number)
5. Click **"Register"**
6. You'll be automatically logged in and redirected to dashboard

### 2. Login

1. Click **"Login"** button
2. Enter your **email** and **password**
3. Click **"Login"**
4. Redirected to personalized dashboard

### 3. Submit Contact Form

1. Go to **Contact** section
2. Fill in your details:
   - Name, email, phone, message
3. Click **"Send Message"**
4. See success confirmation

### 4. Create a Booking

1. From your dashboard, click **"Book a Service"**
2. Fill in booking details:
   - Dog name and breed
   - Service type
   - Date and time
   - Special instructions
3. Submit booking
4. View booking in your dashboard

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

```bash
# Check if MongoDB is running
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Start MongoDB if not running
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Still not working?**
- Check MongoDB is installed: `mongod --version`
- Check logs: `/usr/local/var/log/mongodb/` (macOS)
- Try connecting with MongoDB Compass: `mongodb://localhost:27017`

---

### CORS Error

**Error:**
```
Access to fetch at 'http://localhost:5001/api/...' from origin 'http://localhost:8080'
has been blocked by CORS policy
```

**Solution:**

The backend CORS is configured for `http://localhost:8080`. Ensure:

1. **Frontend runs on port 8080** (not 3000, 5000, etc.)
2. **Backend `.env` has correct CORS_ORIGIN:**
   ```env
   CORS_ORIGIN=http://localhost:8080
   ```
3. **Restart backend server** after changing `.env`

**Multiple frontend ports?** Update `server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080'
];
```

---

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**

```bash
# Find process using port 5001

# macOS/Linux
lsof -ti:5001 | xargs kill -9

# Or find the process first
lsof -i:5001

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process

# Windows (CMD)
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**Alternative:** Change port in `.env`:
```env
PORT=5002
```

---

### Authentication Issues

**Problem:** Can't login or token errors

**Solutions:**

1. **Clear browser storage:**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Verify JWT_SECRET is set:**
   ```bash
   grep JWT_SECRET backend/.env
   ```

3. **Check password requirements:**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number

4. **Rate limiting:** If you see "Too many requests", wait 15 minutes

---

## 🧰 API Testing with cURL

### Register New User

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "password": "Password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get User Info (with cookies)

```bash
curl http://localhost:5001/api/auth/me \
  -b cookies.txt
```

### Create Booking (with cookies)

```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "dogName": "Max",
    "dogBreed": "Golden Retriever",
    "service": "Daily Walk (30 min)",
    "date": "2025-12-15",
    "time": "10:00 AM",
    "duration": "30 min",
    "specialInstructions": "Loves treats!"
  }'
```

### Get User's Bookings

```bash
curl http://localhost:5001/api/bookings \
  -b cookies.txt
```

### Submit Contact Form

```bash
curl -X POST http://localhost:5001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-9876",
    "message": "I would like to book a walk for my dog!"
  }'
```

---

## 💻 Development Tips

### View Database in MongoDB Compass

**MongoDB Compass** provides a visual interface for your database:

1. **Download** [MongoDB Compass](https://www.mongodb.com/products/compass)
2. **Connect to:** `mongodb://localhost:27017`
3. **Select database:** `empirestatewalkers`
4. **Browse collections:**
   - `users` - All registered users
   - `bookings` - All bookings
   - `contacts` - Contact form submissions

**Useful features:**
- Visual query builder
- Index management
- Schema analysis
- Performance insights

---

### View Database with mongosh (CLI)

```bash
# Connect to database
mongosh mongodb://localhost:27017/empirestatewalkers

# View collections
show collections

# View all users (pretty formatted)
db.users.find().pretty()

# Count documents
db.users.countDocuments()
db.bookings.countDocuments()

# Find specific user
db.users.findOne({ email: "test@example.com" })

# Find pending bookings
db.bookings.find({ status: "pending" })

# Exit
exit
```

---

### Reset Database

**Warning:** This deletes all data!

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/empirestatewalkers

# Drop all collections
db.users.drop()
db.bookings.drop()
db.contacts.drop()

# Or drop entire database
db.dropDatabase()
```

---

### Create Admin User

By default, all users are created as regular users. To create an admin:

**Method 1: Update existing user via mongosh**

```bash
mongosh mongodb://localhost:27017/empirestatewalkers

db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Method 2: Quick one-liner**

```bash
mongosh mongodb://localhost:27017/empirestatewalkers \
  --eval 'db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})'
```

**Verify admin status:**

```bash
mongosh mongodb://localhost:27017/empirestatewalkers \
  --eval 'db.users.find({role: "admin"}).pretty()'
```

---

### View Application Logs

Logs are stored in `backend/logs/`:

```bash
# View all logs
tail -f backend/logs/all.log

# View only errors
tail -f backend/logs/error.log

# Search for specific event
grep "login" backend/logs/all.log

# View last 50 lines
tail -n 50 backend/logs/all.log
```

---

## 🚢 Production Deployment

### Pre-Deployment Checklist

Before deploying to production:

- [ ] **MongoDB:** Use MongoDB Atlas or managed MongoDB service
- [ ] **JWT_SECRET:** Generate strong random string (32+ bytes)
- [ ] **NODE_ENV:** Set to `production`
- [ ] **CORS_ORIGIN:** Update to your production frontend URL
- [ ] **HTTPS:** Ensure SSL/TLS certificate is configured
- [ ] **Environment Variables:** Set on hosting platform
- [ ] **Security Features:** Verify helmet, rate limiting, CSRF enabled
- [ ] **Logging:** Configure log rotation and monitoring
- [ ] **Database Backups:** Enable automated backups
- [ ] **Error Tracking:** Set up error monitoring (Sentry, etc.)

### Recommended Hosting Platforms

| Platform | Best For | Free Tier | MongoDB Support |
|----------|----------|-----------|-----------------|
| **Railway** | Modern apps | Limited | ✅ Built-in |
| **Render** | Easy deployment | Yes | ✅ Via Atlas |
| **Heroku** | Quick setup | Limited | ✅ Via Atlas |
| **DigitalOcean** | Full control | No | ✅ Managed DB |
| **AWS/GCP/Azure** | Enterprise | Limited | ✅ Full service |

### Production Environment Variables

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@production-cluster.mongodb.net/empirestatewalkers
JWT_SECRET=YOUR_PRODUCTION_SECRET_FROM_OPENSSL_RAND
JWT_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com
```

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_atlas_uri
railway variables set JWT_SECRET=your_secure_secret

# Deploy
railway up
```

---

## 📚 Additional Resources

- **Backend API Documentation:** [backend/README.md](backend/README.md)
- **Main Project README:** [README.md](../README.md)
- **Security Assessment:** [security_assessment.md](../security_assessment.md)
- **MongoDB Documentation:** [docs.mongodb.com](https://docs.mongodb.com/)
- **Express.js Guide:** [expressjs.com](https://expressjs.com/)
- **Mongoose ODM:** [mongoosejs.com](https://mongoosejs.com/)

---

## 🆘 Need Help?

If you encounter issues not covered in this guide:

1. **Check logs:** `backend/logs/error.log` and `backend/logs/all.log`
2. **Verify environment:** All required variables in `.env`
3. **Test database:** Connect with MongoDB Compass
4. **Review documentation:** See links above
5. **Create an issue:** [GitHub Issues](https://github.com/Rubelefsky/empirestatewalkers/issues)

---

<div align="center">

**🚀 Happy coding!**

Built with Node.js, Express, and MongoDB

[⬆ Back to Top](#-backend-setup-guide)

</div>
