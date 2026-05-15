# Car Rental Backend API

A robust, TypeScript-based backend API for a dynamic car rental platform.

## 🚀 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Caching & Queues:** [Redis](https://redis.io/)
- **Authentication:** JWT, Passport.js (Google OAuth20), bcryptjs
- **Media Storage:** [Cloudinary](https://cloudinary.com/), Multer
- **Realtime Communication:** Socket.io
- **Validation:** Zod
- **Email Service:** Nodemailer
- **Logging:** Winston, Morgan
- **Security:** Helmet, express-rate-limit, cors

## 📁 Project Structure

The codebase follows an organized structure focusing on modularity and separation of concerns:

- `/src`         - Application source code (TypeScript)
  - `/config`    - Application configuration and environment variables
  - `/error`     - Error handling utilities
  - `/utils`     - Helper functions and common utilities
  - `/routes`    - Express route definitions
- `/dist`        - Compiled JavaScript output
- `/prisma`      - Prisma schema configurations and database migrations

## 🛠️ Setup Instructions

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher recommended)
- PostgreSQL
- Redis
- A Cloudinary account (for media storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd car-rental-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Make sure you have a `.env` file configured in the root directory containing necessary keys containing your database connection strings, JWT secrets, and third-party provider keys.

4. **Initialize the Database:**
   Generate the Prisma client and push your schema to the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Running the Application

- **Development Mode:**
  Runs the app with `nodemon` for hot-reloading.
  ```bash
  npm run dev
  ```

- **Build Output:**
  Compiles TypeScript code into standard JavaScript inside the `/dist` folder.
  ```bash
  npm run build
  ```

- **Production Mode:**
  Runs the compiled build.
  ```bash
  npm start
  ```

- **Type Checking:**
  Type checks the code without emitting compilation files.
  ```bash
  npm run typecheck
  ```

## 🔒 Security Features

- **Helmet:** Sets secure HTTP headers out of the box.
- **Rate Limiting:** Protects the endpoints from brute-force attacks and abuse.
- **CORS:** Configured for safe cross-origin resource sharing.
- **Data Validation:** Enforced API input validation using Zod.

## 📄 License

This project is licensed under the ISC License.
