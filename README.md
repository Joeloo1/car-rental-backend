# 🚗 LuxeDrive - Premium Car Rental Platform

A modern, full-stack car rental platform built with React, TypeScript, Express, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with glassmorphism effects
- 🚀 **Fast Performance** - Optimized with React Query and lazy loading
- 🔐 **Secure Authentication** - JWT-based auth with Google OAuth
- 💳 **Booking System** - Complete rental workflow with calendar
- 💬 **Real-time Chat** - Socket.IO powered messaging
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🎯 **Type-Safe** - Full TypeScript coverage
- 🗄️ **PostgreSQL Database** - Robust data management with Prisma ORM

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Data fetching & caching
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time features
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **Passport** - OAuth strategies
- **Cloudinary** - Image storage
- **Winston** - Logging

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** >= 14
- **Redis** (optional, for caching)

## 🚀 Quick Start

### 1. Install pnpm

```bash
# Using npm
npm install -g pnpm

# Or using corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate
```

### 2. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd car-rental-backend

# Install all dependencies
pnpm install
```

### 3. Environment Setup

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/luxedrive"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Frontend (.env.production)

```bash
cd frontend
cp .env.example .env.production
```

Edit `frontend/.env.production`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm prisma:push

# (Optional) Seed database with sample data
pnpm prisma:seed
```

### 5. Start Development

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:frontend  # Frontend only (http://localhost:5173)
pnpm dev:backend   # Backend only (http://localhost:3000)
```

## 📝 Available Scripts

### Root Level

```bash
pnpm dev              # Start both frontend & backend
pnpm build            # Build both projects
pnpm lint             # Lint all projects
pnpm clean            # Clean node_modules & builds
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:push      # Push schema to database
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:seed      # Seed database
```

### Frontend

```bash
cd frontend
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Lint code
```

### Backend

```bash
cd backend
pnpm dev              # Start dev server with hot reload
pnpm build            # Build TypeScript
pnpm start            # Start production server
pnpm typecheck        # Type checking
```

## 📁 Project Structure

```
car-rental-backend/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── Landing/    # Landing page components
│   │   │   └── common/     # Common components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── context/        # React contexts
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # Global styles
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   ├── utils/          # Utility functions
│   │   └── generated/      # Prisma generated files
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   └── package.json
│
├── pnpm-workspace.yaml       # pnpm workspace config
├── package.json              # Root package.json
└── README.md
```

## 🎨 Key Features Implemented

### Frontend

- ✅ Modern, responsive UI with dark theme
- ✅ Loading skeletons for better UX
- ✅ Empty states with CTAs
- ✅ Smooth animations and transitions
- ✅ Car cards with favorites
- ✅ Advanced filtering system
- ✅ Real-time notifications
- ✅ Toast notifications
- ✅ Form validation
- ✅ Image lazy loading

### Backend

- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ Google OAuth integration
- ✅ Role-based access control
- ✅ File upload with Cloudinary
- ✅ Real-time chat with Socket.IO
- ✅ Email notifications
- ✅ Rate limiting
- ✅ Error handling
- ✅ Request logging

## 🔧 Development

### Adding Dependencies

```bash
# Frontend
pnpm --filter frontend add <package-name>

# Backend
pnpm --filter backend add <package-name>

# Dev dependency
pnpm --filter frontend add -D <package-name>
```

### Database Migrations

```bash
# Create migration
cd backend
pnpm prisma migrate dev --name <migration-name>

# Apply migrations
pnpm prisma migrate deploy

# Reset database
pnpm prisma migrate reset
```

### Code Quality

```bash
# Lint
pnpm lint

# Type check
cd backend && pnpm typecheck
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
pnpm build
# Deploy dist/ folder
```

### Backend (Railway/Heroku/DigitalOcean)

```bash
cd backend
pnpm build
# Deploy with start script
```

### Environment Variables

Ensure all production environment variables are set:

- Database connection string
- JWT secrets
- OAuth credentials
- Cloudinary credentials
- Email service credentials

## 📚 Documentation

- [Frontend Improvements](./FRONTEND_IMPROVEMENTS.md) - Detailed frontend enhancements
- [Quick Start Guide](./QUICK_START_GUIDE.md) - Step-by-step setup guide
- [pnpm Migration Guide](./PNPM_MIGRATION_GUIDE.md) - Migration from npm to pnpm
- [pnpm Quick Reference](./PNPM_QUICK_REFERENCE.md) - Common pnpm commands

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - LuxeDrive
- **Contact** - support@luxedrive.io

## 🙏 Acknowledgments

- React team for the amazing library
- Prisma team for the excellent ORM
- All open-source contributors

---

**Built with ❤️ using pnpm, React, and TypeScript**

🚗 Happy Coding! 💨
