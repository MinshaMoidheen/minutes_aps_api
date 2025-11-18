# API Template

A clean, production-ready Node.js API template built with Express, TypeScript, and MongoDB. This template provides a solid foundation for building RESTful APIs with authentication and user management.

## Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication with access and refresh tokens
  - Password hashing with bcrypt
  - Secure cookie handling

- **User Management**
  - Get current user profile
  - Update user profile
  - Get all users (admin)
  - Get user by ID
  - Delete user account
  - Role-based access control (super_admin, admin, user)
  - Automatic super admin seeding on first startup

- **Comprehensive Logging System**
  - Database logging for all user actions
  - Detailed audit trails with change tracking
  - Log management (CRUD operations)
  - Log analytics and statistics
  - Advanced filtering and search capabilities

- **Security**
  - CORS protection
  - Rate limiting
  - Helmet for security headers
  - Input validation with Zod
  - Password strength requirements

- **Development Tools**
  - TypeScript support
  - Hot reload with nodemon
  - Winston logging
  - Prettier code formatting
  - Environment configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors
- **Validation**: Zod
- **Logging**: Winston
- **Development**: nodemon, ts-node

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd api-template
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URL=mongodb://localhost:27017/samay-api
JWT_ACCESS_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
WHITELIST_ORIGINS=http://localhost:3000,http://localhost:3001
WHITELIST_ADMINS_MAILS=admin@example.com,admin2@example.com
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!
LOG_LEVEL=info
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/me` - Delete current user account
- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:userId` - Get user by ID
- `DELETE /api/v1/users/:userId` - Delete user by ID (admin)

### Logs
- `POST /api/v1/logs` - Create a log entry
- `GET /api/v1/logs` - Get all logs with filtering and pagination
- `GET /api/v1/logs/statistics` - Get log analytics and statistics
- `GET /api/v1/logs/:id` - Get log by ID
- `PUT /api/v1/logs/:id` - Update log entry
- `DELETE /api/v1/logs/:id` - Delete log entry

## Project Structure

```
src/
├── @types/          # TypeScript type definitions
├── config/          # Configuration files
├── controllers/     # Route controllers
│   └── v1/
│       ├── auth/    # Authentication controllers
│       ├── user/    # User management controllers
│       └── log/     # Log management controllers
├── lib/             # Utility libraries
├── middlewares/     # Express middlewares
├── models/          # Database models (User, Token, Log)
├── routes/          # API routes
│   └── v1/
├── utils/           # Helper utilities
├── zod/             # Validation schemas (auth, user, log)
└── server.ts        # Application entry point
```

## Logging System

The API includes a comprehensive logging system that tracks all user actions and system events:

### Features
- **Automatic Logging**: All authentication and user management actions are automatically logged
- **Change Tracking**: Detailed tracking of what fields were changed, with old and new values
- **User Context**: Each log entry includes user information and role
- **Search & Filter**: Advanced filtering by action, module, user, date range, and text search
- **Analytics**: Built-in statistics and analytics for log data
- **Audit Trail**: Complete audit trail for compliance and debugging

### Log Structure
```json
{
  "action": "LOGIN",
  "module": "AUTH", 
  "description": "User logged in successfully: user@example.com",
  "userRole": "user",
  "userId": "user_id_here",
  "documentId": "optional_document_id",
  "changes": [
    {
      "field": "email",
      "oldValue": null,
      "newValue": "user@example.com"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Log Types
- **AUTH**: Login, logout, registration, failed attempts
- **USER**: Profile updates, account deletions
- **LOG**: Log management operations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGO_URL` | MongoDB connection string | - |
| `JWT_ACCESS_SECRET` | JWT access token secret key | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret key | - |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry time | 15m |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry time | 7d |
| `WHITELIST_ORIGINS` | CORS whitelist origins | - |
| `WHITELIST_ADMINS_MAILS` | Comma-separated list of admin emails | - |
| `SUPER_ADMIN_EMAIL` | Super admin email for auto-creation | - |
| `SUPER_ADMIN_PASSWORD` | Super admin password for auto-creation | - |
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | info |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC