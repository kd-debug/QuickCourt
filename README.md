# QuickCourt - Local Sports Booking Platform

A full-stack web application that enables sports enthusiasts to book local sports facilities and join matches with others in their area.

## 🏆 Project Overview

QuickCourt is a comprehensive sports booking platform that connects sports enthusiasts with local sports facilities. Users can discover, book, and review sports courts while facility owners can manage their venues and track performance.

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration**: Email-based signup with role selection
- **Email Verification**: OTP verification system for account security
- **Role-based Access**: Different dashboards for users, facility owners, and admins
- **Profile Management**: User profile updates and preferences

### 🏟️ Sports Facility Management
- **Venue Discovery**: Browse and search sports facilities
- **Court Booking**: Easy booking system with time slot selection
- **Facility Management**: Owners can manage courts, pricing, and availability
- **Reviews & Ratings**: Community-driven venue quality system

### 📊 Analytics & Reporting
- **Booking Analytics**: Track booking trends and performance
- **Revenue Tracking**: Monitor earnings and facility utilization
- **User Insights**: Platform usage statistics and user behavior

### 📱 Responsive Design
- **Mobile First**: Optimized for all device sizes
- **Modern UI/UX**: Beautiful, intuitive interface
- **Fast Performance**: Optimized React components

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Nodemailer** - Email functionality
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React 19** - Latest React with modern features
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account for email functionality

### 1. Clone the Repository
```bash
git clone <repository-url>
cd QuickCourt
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Update config.env with your credentials

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## ⚙️ Configuration

### Backend Environment Variables
Create `backend/config.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=QuickCourt <your_email>
PORT=5000
NODE_ENV=development
```

### Gmail Setup for OTP
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## 📁 Project Structure

```
QuickCourt/
├── backend/                 # Backend API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── App.js          # Main app component
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id/status` - Update user status (Admin only)

## 👥 User Roles

### 🏃‍♂️ Sports Enthusiast (User)
- Browse and search sports venues
- Book courts and time slots
- View booking history
- Rate and review facilities
- Manage personal profile

### 🏢 Facility Owner
- Register and manage sports facilities
- Set court pricing and availability
- View and manage bookings
- Access analytics dashboard
- Update facility information

### 👨‍💼 Administrator
- User management and moderation
- Facility approval system
- Platform analytics and insights
- Content moderation
- System configuration

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#0ea5e9) - Trust and reliability
- **Secondary**: Gray (#64748b) - Professional and clean
- **Accent**: Yellow (#eab308) - Energy and excitement
- **Success**: Green (#22c55e) - Positive actions
- **Error**: Red (#ef4444) - Warnings and errors

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Responsive**: Scales appropriately across devices

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large touch targets and mobile-optimized navigation
- **Progressive Enhancement**: Enhanced experience on larger screens

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Cross-origin resource sharing security
- **Helmet Security**: HTTP header security middleware

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your hosting platform
3. Configure MongoDB Atlas for production
4. Set up email service for production

### Frontend Deployment
1. Update API endpoint URLs
2. Build the application: `npm run build`
3. Deploy to hosting platform (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🔮 Future Roadmap

- [ ] **Real-time Notifications**: Push notifications and live updates
- [ ] **Payment Integration**: Stripe/PayPal payment processing
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Social Features**: User matching and community building
- [ ] **Multi-language Support**: Internationalization
- [ ] **API Documentation**: Swagger/OpenAPI documentation
- [ ] **Testing Suite**: Comprehensive testing coverage

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database
- **Express.js** - For the robust Node.js framework

---

**Built with ❤️ for the sports community**
