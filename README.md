# Empire State Walkers

Professional dog walking and pet sitting services - Full-stack web application for Manhattan, NYC.

## Overview

Empire State Walkers is a modern, full-stack web application for a professional dog walking and pet care service based in Manhattan. The application features a minimalist design, comprehensive backend API with MongoDB integration, JWT authentication, booking management, and a responsive user interface.

## Features

### Core Functionality
- **Minimalist, Responsive Design**: Clean, modern UI optimized for desktop, tablet, and mobile devices
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Booking Management System**: Full CRUD operations for managing dog walking and pet sitting bookings
- **Customer Dashboard**: Personalized dashboard for managing bookings and account information
- **Contact Form**: Backend-integrated contact form with message tracking
- **RESTful API**: Comprehensive backend API with proper error handling and validation
- **Role-Based Access Control**: User and admin roles with protected routes

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
- **JWT**: Token-based authentication
- **bcryptjs**: Secure password hashing
- **CORS**: Cross-origin resource sharing
- **express-validator**: Input validation and sanitization

## Project Structure

```
empirestatewalkers/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Custom CSS styles
│   ├── script.js           # Basic frontend functionality
│   └── frontend-api.js     # Frontend with full API integration
├── backend/
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── bookingController.js # Booking management
│   │   └── contactController.js # Contact form handling
│   ├── middleware/
│   │   ├── auth.js         # Authentication middleware
│   │   └── errorHandler.js # Global error handler
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Booking.js      # Booking schema
│   │   └── Contact.js      # Contact schema
│   ├── routes/
│   │   ├── authRoutes.js   # Auth endpoints
│   │   ├── bookingRoutes.js # Booking endpoints
│   │   └── contactRoutes.js # Contact endpoints
│   ├── utils/
│   │   └── generateToken.js # JWT token generator
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Dependencies
│   ├── server.js           # Entry point
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
PORT=5000
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

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

The server will run on `http://localhost:5000`

#### 5. Frontend Setup

Open a new terminal and navigate back to the project root:
```bash
cd ..
```

Serve the frontend using a local development server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js with npx
npx http-server

# Using PHP
php -S localhost:8000
```

Navigate to `http://localhost:8000` in your browser.

**Note**: To use the full API integration, replace `script.js` with `frontend-api.js` in `index.html`, or update the script source:
```html
<script src="frontend-api.js"></script>
```

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
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Create booking (requires auth token)
curl -X POST http://localhost:5000/api/bookings \
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
- status (new/read/responded)
- createdAt

## Security Features

- **Password Security**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Token-based auth with configurable expiration
- **Protected Routes**: Middleware-based route protection
- **Role-Based Access**: User and admin role separation
- **Input Validation**: Express-validator for request validation
- **CORS Configuration**: Controlled cross-origin access
- **Error Handling**: Centralized error handling middleware

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
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_production_secret
PORT=5000
```

Don't forget to update CORS origin in `backend/server.js` to your production frontend domain.

### Frontend Deployment

Deploy to:
- **Netlify**: Easy static site deployment
- **Vercel**: Optimized for frontend
- **GitHub Pages**: Free hosting
- **AWS S3 + CloudFront**: Enterprise CDN solution

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
- Ensure MongoDB is running
- Check `.env` file exists and has correct values
- Verify all dependencies are installed: `npm install`
- Check port 5000 is not already in use

### Frontend can't connect to API
- Ensure backend server is running on port 5000
- Check API_URL in `frontend-api.js` matches backend URL
- Verify CORS settings in `backend/server.js`
- Check browser console for detailed error messages

### Authentication issues
- Clear browser localStorage and cookies
- Verify JWT_SECRET is set in backend `.env`
- Check token hasn't expired (default: 30 days)
- Ensure password meets minimum requirements

## Support

For technical support or business inquiries:
- Email: walk@esw.dog
- GitHub Issues: [Create an issue](https://github.com/Rubelefsky/empirestatewalkers/issues)
