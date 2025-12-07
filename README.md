# NovaCart - E-Commerce Platform

A modern, full-stack e-commerce application built with Next.js 16 and Express.js, featuring a hybrid database architecture using MySQL and MongoDB.

![NovaCart](https://img.shields.io/badge/NovaCart-E--Commerce-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB)
![Express](https://img.shields.io/badge/Express-4.19.2-green)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748)

---

## 📋 Overview

NovaCart is a fully functional e-commerce platform that provides a seamless shopping experience with user authentication, product browsing, cart management, and order processing capabilities.

### Key Features

- 🔐 **User Authentication** - Secure JWT-based registration and login system with role-based access (Customer/Admin)
- 🛍️ **Product Catalog** - Browse, search, filter, and sort products with pagination support
- 🛒 **Shopping Cart** - Add, update, and remove items from your cart
- 📦 **Order Management** - Place orders and track order history
- 🎨 **Modern UI** - Responsive design with Tailwind CSS, Framer Motion animations, and Lucide icons
- 🗄️ **Hybrid Database** - MySQL for users/orders, MongoDB for product catalog

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 16.0.7 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type-safe JavaScript |
| Tailwind CSS | ^4 | Utility-first CSS framework |
| Framer Motion | ^12.23.25 | Animation library |
| Axios | ^1.13.2 | HTTP client |
| Lucide React | ^0.556.0 | Icon library |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Express.js | ^4.19.2 | Node.js web framework |
| TypeScript | ^5.4.5 | Type-safe JavaScript |
| Prisma | 6.15.0 | ORM for MySQL & MongoDB |
| JWT | ^9.0.3 | Authentication tokens |
| bcryptjs | ^3.0.3 | Password hashing |
| Jest | ^30.2.0 | Testing framework |
| Supertest | ^7.1.4 | HTTP testing |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- MongoDB database (Atlas or local)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd novacartWeb
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# MySQL Database Connection
SQL_DATABASE_URL="mysql://username:password@host:port/database_name"

# MongoDB Database Connection
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_LIFETIME=7d
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

The frontend connects to the backend API at `http://localhost:5000` by default.

---

## 🗄️ Database Configuration & Migration

NovaCart uses a **hybrid database architecture**:
- **MySQL** - Stores users, orders, carts, and order items
- **MongoDB** - Stores the product catalog

### Database Schema Overview

#### MySQL Models (schema.prisma)
- `User` - User accounts with roles (CUSTOMER/ADMIN)
- `Order` - Order records with status tracking
- `OrderItem` - Individual items within orders
- `Cart` - User shopping carts
- `CartItem` - Items within carts

#### MongoDB Models (product.prisma)
- `Product` - Product catalog with SKU, name, price, category, description, stock, images

### Migration Steps

```bash
cd backend

# Generate Prisma clients
npx prisma generate                           # MySQL client
npx prisma generate --schema=prisma/product.prisma  # MongoDB client

# Run MySQL migrations
npx prisma migrate dev --name init

# Seed the database with sample products
npm run seed
```

---

## 🧪 Testing Instructions

The project uses **Jest** with **Supertest** for API testing.

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The test suite includes:
- `GET /api/products` - Fetching product list
- `GET /api/products/:id` - Fetching single product
- Sorting and filtering functionality
- 404 handling for non-existent products

---

## 🔗 API Route Summary

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |

### Product Routes (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (with filters, search, pagination, sorting) | ❌ |
| GET | `/api/products/:id` | Get single product by ID | ❌ |

**Query Parameters:**
- `search` - Search by product name
- `category` - Filter by category
- `sortBy` - Sort field (e.g., `price`, `name`)
- `sortOrder` - Sort direction (`asc` or `desc`)
- `page` - Page number for pagination
- `limit` - Items per page

### Cart Routes (`/api/cart`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart | ✅ |
| POST | `/api/cart` | Add item to cart | ✅ |
| PUT | `/api/cart` | Update cart item quantity | ✅ |
| DELETE | `/api/cart/:productId` | Remove item from cart | ✅ |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | ✅ |
| GET | `/api/orders/myorders` | Get user's order history | ✅ |

---

## 🖥️ Frontend Route Summary

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured products |
| `/products` | Product listing page |
| `/products/[id]` | Product detail page |
| `/login` | User login page |
| `/register` | User registration page |
| `/cart` | Shopping cart page |
| `/orders` | Order history page |
| `/account` | User account management |

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:3000`

### Production Build

```bash
# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run build
npm run start
```

---

## 🌐 Deployment URLs

| Environment | Frontend URL | Backend API URL |
|-------------|--------------|-----------------|
| Development | http://localhost:3000 | http://localhost:5000 |
| Production | *To be configured* | *To be configured* |

---

## 🔑 Admin Login Credentials

For evaluation purposes, use the following credentials:

| Field | Value |
|-------|-------|
| **Email** | `admin@novacart.com` |
| **Password** | `Admin@123` |
| **Role** | ADMIN |

> **Note:** If the admin account doesn't exist, you can create it by:
> 1. Registering a new user through the `/register` page
> 2. Manually updating the user's role to `ADMIN` in the MySQL database:
> ```sql
> UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
> ```

---

## 📁 Project Structure

```
novacartWeb/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Data models
│   ├── prisma/          # Prisma schemas & migrations
│   ├── routes/          # API route definitions
│   ├── tests/           # Jest test files
│   ├── types/           # TypeScript types
│   └── server.ts        # Express server entry
│
├── frontend/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── lib/             # Utility functions
│   └── public/          # Static assets
│
└── README.md
```

## 👥 Author

- Arpan Charola

---

> **Built with ❤️ using Next.js, Express, and Prisma**
