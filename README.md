# Empire State Walkers

Professional dog walking and pet sitting services website for Manhattan, NYC.

## Overview

Empire State Walkers is a modern, responsive website for a professional dog walking and pet care service based in Manhattan. The site features customer authentication, booking management, and a clean, user-friendly interface built with Tailwind CSS.

## Features

### Core Functionality
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile devices
- **Customer Authentication**: Login and registration system with user dashboard
- **Booking Management**: Online booking form for scheduling dog walking and pet sitting services
- **Customer Dashboard**: Personalized dashboard for managing bookings and account information
- **Service Catalog**: Detailed information about available services and pricing

### Services Offered
- **Daily Walks**: 30-60 minute walks ($25-35)
- **Pet Sitting**: In-home care and companionship ($40/visit)
- **Emergency Visits**: Same-day availability ($50/visit)
- **Additional Services**: Basic grooming, training, transportation, and photo sessions

## Technology Stack

- **HTML5**: Semantic markup structure
- **CSS3**: Custom styles with Tailwind CSS framework
- **JavaScript**: Vanilla JS for interactive features
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Font Awesome**: Icon library for UI elements

## Project Structure

```
empirestatewalkers/
├── index.html          # Main HTML file with all sections
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

No build tools or dependencies required. The project uses CDN-hosted libraries.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rubelefsky/empirestatewalkers.git
cd empirestatewalkers
```

2. Open the website:
   - Simply open `index.html` in your web browser
   - Or use a local development server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js with npx
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

## Usage

### For Customers

1. **Browse Services**: Navigate through the site to view available services and pricing
2. **Register/Login**: Create an account or login to access the booking system
3. **Book a Service**: Fill out the booking form with your pet's details and preferred time
4. **Manage Bookings**: Access your dashboard to view and manage your bookings

### For Development

The website uses localStorage for demo authentication. In a production environment, you would need to:
- Implement backend API for user authentication
- Add database integration for booking storage
- Set up payment processing
- Add email notifications

## Key Sections

- **Home**: Hero section with call-to-action
- **About**: Information about the service provider and qualifications
- **Services**: Detailed service offerings with pricing
- **Contact**: Contact form and service area information
- **Booking**: Comprehensive booking form for scheduling services
- **Dashboard**: Customer portal for managing bookings (requires login)

## Service Area

Currently serving:
- Upper East Side, Manhattan
- Upper West Side, Manhattan
- Midtown, Manhattan

## Contact Information

- **Phone**: (555) 123-4567
- **Email**: hello@empirestatewalkers.com
- **Hours**: Available 7am - 9pm daily

## Future Enhancements

- Backend API integration
- Payment processing
- Email notifications
- Real-time availability calendar
- Photo upload for pet profiles
- Walk tracking with GPS
- Review and rating system

## License

Copyright © 2025 Empire State Walkers. All rights reserved.

## Contributing

This is a private project. For inquiries about modifications or features, please contact the owner.
