# Empire State Walkers - Backend API

RESTful API backend for the Empire State Walkers dog walking and pet care service.

## Features

- User authentication with JWT
- Secure password hashing with bcrypt
- Booking management system
- Contact form submissions
- Role-based access control (User/Admin)
- MongoDB database integration
- Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Prerequisites

Before running the backend, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/empirestatewalkers
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-123-4567",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "memberSince": "2025-01-01T00:00:00.000Z",
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "memberSince": "2025-01-01T00:00:00.000Z",
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Update User Details
```http
PUT /api/auth/updatedetails
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "phone": "555-999-8888"
}
```

### Booking Routes (`/api/bookings`)

#### Get User's Bookings
```http
GET /api/bookings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "booking_id",
      "user": "user_id",
      "dogName": "Max",
      "dogBreed": "Golden Retriever",
      "service": "Daily Walk (30 min)",
      "date": "2025-01-15T00:00:00.000Z",
      "time": "10:00 AM",
      "duration": "30 min",
      "specialInstructions": "Max loves treats!",
      "status": "pending",
      "price": 25,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Booking
```http
GET /api/bookings/:id
Authorization: Bearer {token}
```

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "dogName": "Max",
  "dogBreed": "Golden Retriever",
  "service": "Daily Walk (30 min)",
  "date": "2025-01-15",
  "time": "10:00 AM",
  "duration": "30 min",
  "specialInstructions": "Max loves treats!"
}
```

#### Update Booking
```http
PUT /api/bookings/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed",
  "time": "11:00 AM"
}
```

#### Delete Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer {token}
```

#### Get All Bookings (Admin Only)
```http
GET /api/bookings/admin/all
Authorization: Bearer {admin_token}
```

### Contact Routes (`/api/contact`)

#### Submit Contact Form
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

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you within 2 hours.",
  "data": {
    "_id": "contact_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-987-6543",
    "message": "I'd like to book a walk for my dog!",
    "status": "new",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get All Contact Messages (Admin Only)
```http
GET /api/contact
Authorization: Bearer {admin_token}
```

#### Update Contact Message Status (Admin Only)
```http
PUT /api/contact/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "responded"
}
```

### Health Check
```http
GET /api/health
```

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  memberSince: Date,
  role: String (enum: ['user', 'admin'])
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: User),
  dogName: String,
  dogBreed: String,
  service: String (enum),
  date: Date,
  time: String,
  duration: String,
  specialInstructions: String,
  status: String (enum: ['pending', 'confirmed', 'completed', 'cancelled']),
  price: Number
}
```

### Contact Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  message: String,
  status: String (enum: ['new', 'read', 'responded'])
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Tokens are returned upon successful registration or login and expire after 30 days (configurable).

## Error Handling

All errors return JSON responses with this structure:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected routes requiring authentication
- Role-based access control
- Input validation
- CORS configuration
- Secure HTTP headers

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookingController.js # Booking management
│   └── contactController.js # Contact form handling
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Global error handler
├── models/
│   ├── User.js              # User schema
│   ├── Booking.js           # Booking schema
│   └── Contact.js           # Contact schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   └── contactRoutes.js     # Contact endpoints
├── utils/
│   └── generateToken.js     # JWT token generator
├── .env                     # Environment variables
├── .env.example             # Example env file
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Entry point
└── README.md               # This file
```

## Development

### Running MongoDB Locally

1. Install MongoDB Community Edition
2. Start MongoDB service:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Using MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Testing API Endpoints

Use tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- cURL commands

Example cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"555-1234","password":"test123"}'
```

## Deployment

### Environment Variables for Production

Update these in production:
- `NODE_ENV=production`
- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - Strong, unique secret key
- Update CORS origin to your frontend domain

### Deployment Platforms

- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern platform with MongoDB support
- **Render**: Free tier available
- **DigitalOcean**: VPS with more control
- **AWS/GCP/Azure**: Enterprise solutions

## Future Enhancements

- [ ] Email notifications (SendGrid/Nodemailer)
- [ ] Payment integration (Stripe)
- [ ] SMS notifications (Twilio)
- [ ] Photo upload for pets (AWS S3)
- [ ] Real-time updates (Socket.io)
- [ ] Admin dashboard
- [ ] Automated testing
- [ ] API documentation (Swagger)
- [ ] Rate limiting
- [ ] Caching with Redis

## License

Copyright © 2025 Empire State Walkers. All rights reserved.

## Support

For issues or questions, contact: hello@empirestatewalkers.com
