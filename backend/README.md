# QuickCourt Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Update the `config.env` file with your actual email credentials:

```env
MONGODB_URI=mongodb+srv://yashbaldaniya2006:yash123@odoofinal.bgnvi5y.mongodb.net/?retryWrites=true&w=majority&appName=odoofinal
JWT_SECRET=quickcourt_super_secret_jwt_key_2024
JWT_EXPIRE=7d
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=QuickCourt <your-actual-gmail@gmail.com>
PORT=5000
NODE_ENV=development
```

### 3. Gmail Setup for OTP
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

### 4. Run the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

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

## Features Implemented
- ✅ User authentication with JWT
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ MongoDB Atlas integration
- ✅ Input validation
- ✅ Security middleware (Helmet, Rate limiting)
- ✅ Error handling

## Next Steps
- Implement Facility management
- Implement Court management
- Implement Booking system
- Add file upload for images
- Implement real-time notifications
