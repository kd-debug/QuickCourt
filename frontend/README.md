# QuickCourt Frontend

A modern, responsive React application for the QuickCourt sports booking platform.

## Features

- 🎨 **Modern UI/UX**: Beautiful design with Tailwind CSS
- 📱 **Responsive Design**: Works perfectly on mobile and desktop
- 🔐 **Authentication**: Complete login/signup system with JWT
- 👥 **Role-based Access**: Different dashboards for users, facility owners, and admins
- 🎯 **Landing Page**: Engaging homepage with call-to-action
- 🚀 **Fast Performance**: Optimized React components

## Tech Stack

- **React 19** - Latest React with modern features
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── LoginPage.js
│   │   ├── SignupPage.js
│   │   └── ProtectedRoute.js
│   ├── dashboard/      # Dashboard components
│   │   ├── Dashboard.js
│   │   ├── DashboardSidebar.js
│   │   ├── DashboardHome.js
│   │   └── Profile.js
│   └── LandingPage.js  # Homepage component
├── contexts/
│   └── AuthContext.js  # Authentication state management
├── App.js              # Main app component
└── index.css           # Global styles with Tailwind
```

## Authentication Flow

1. **Registration**: Users can sign up with email, password, and role selection
2. **Email Verification**: OTP verification system (backend handles email sending)
3. **Login**: Secure authentication with JWT tokens
4. **Protected Routes**: Role-based access control
5. **Profile Management**: User profile updates and management

## Role-Based Features

### User (Sports Enthusiast)
- Book sports courts
- View booking history
- Find and review venues
- Manage profile

### Facility Owner
- Manage sports facilities
- View and manage bookings
- Analytics dashboard
- Court management

### Admin
- User management
- Facility approval system
- Platform analytics
- Content moderation

## Styling

The app uses a custom Tailwind CSS configuration with:
- **Primary Colors**: Blue theme (#0ea5e9)
- **Secondary Colors**: Gray scale (#64748b)
- **Accent Colors**: Yellow highlights (#eab308)
- **Success/Error**: Green/Red for feedback (#22c55e, #ef4444)

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large touch targets and mobile-optimized navigation

## API Integration

The frontend connects to the backend API at `http://localhost:5000`:
- Authentication endpoints
- User management
- Facility operations
- Booking system

## Development

### Adding New Components
1. Create component in appropriate directory
2. Import and use in parent component
3. Add routing if needed
4. Style with Tailwind CSS classes

### State Management
- **Local State**: Use React hooks (useState, useEffect)
- **Global State**: Use AuthContext for authentication
- **API Calls**: Use Axios with proper error handling

### Styling Guidelines
- Use Tailwind utility classes
- Follow the established color scheme
- Maintain consistent spacing and typography
- Ensure responsive design

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Create `.env` file for production:
```env
REACT_APP_API_URL=https://your-api-domain.com
```

## Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add proper error handling
4. Test on multiple devices
5. Update documentation

## Support

For issues or questions:
1. Check the backend API is running
2. Verify environment configuration
3. Check browser console for errors
4. Ensure all dependencies are installed

## Next Steps

- [ ] Implement venue discovery
- [ ] Add booking system
- [ ] Implement payment integration
- [ ] Add real-time notifications
- [ ] Implement search and filtering
- [ ] Add image upload functionality
