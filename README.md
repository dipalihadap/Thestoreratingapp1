# Store Rating Application

A full-stack web application for submitting and managing store ratings.

## Tech Stack

- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL
- **Frontend**: React (Vite) + TypeScript

---

## Prerequisites

- Node.js v18+
- PostgreSQL 13+
- npm

---

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE store_rating_db;
```

2. The tables are auto-created by TypeORM on first run (`synchronize: true`).

---

## Backend Setup

```bash
cd store-rating-backend
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run start:dev
```

The API runs on **http://localhost:3000/api**

### Environment Variables (`.env`)

| Variable       | Description                        | Default          |
|----------------|------------------------------------|------------------|
| DB_HOST        | PostgreSQL host                    | localhost        |
| DB_PORT        | PostgreSQL port                    | 5432             |
| DB_USERNAME    | PostgreSQL username                | postgres         |
| DB_PASSWORD    | PostgreSQL password                | yourpassword     |
| DB_DATABASE    | Database name                      | store_rating_db  |
| JWT_SECRET     | JWT signing secret                 | (change this!)   |
| JWT_EXPIRES_IN | Token expiry                       | 7d               |
| PORT           | API port                           | 3000             |

---

## Frontend Setup

```bash
cd store-rating-frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## Creating the First Admin User

The first admin must be created directly in the database (since signup creates normal users only):

```sql
-- Replace values as needed. Password below is: Admin@1234
INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator Name',
  'admin@example.com',
  '$2a$10$...', -- use a bcrypt hash
  'Admin Office Address Here',
  'admin'
);
```

Or use a seed script — run once after starting the backend:

```bash
cd store-rating-backend
# via REST (using curl):
# 1. Register a normal user first, then manually update role in DB
```

Alternatively, temporarily use the register endpoint and update the role in the DB:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## API Endpoints

### Auth
| Method | Endpoint                  | Access      | Description           |
|--------|---------------------------|-------------|-----------------------|
| POST   | /api/auth/register        | Public      | Register normal user  |
| POST   | /api/auth/login           | Public      | Login                 |
| PATCH  | /api/auth/update-password | Authenticated | Change password     |

### Users (Admin only)
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | /api/users         | List users (filterable)|
| GET    | /api/users/dashboard | Stats totals          |
| GET    | /api/users/:id     | User detail            |
| POST   | /api/users         | Create user            |

### Stores
| Method | Endpoint                    | Access       | Description              |
|--------|-----------------------------|--------------|--------------------------|
| GET    | /api/stores                 | Authenticated| List stores with ratings |
| POST   | /api/stores                 | Admin        | Create store             |
| GET    | /api/stores/owner-dashboard | Store Owner  | Owner dashboard          |
| GET    | /api/stores/:id             | Authenticated| Store detail             |

### Ratings (Normal User only)
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/ratings          | Submit rating (1–5)   |
| PATCH  | /api/ratings/:storeId | Update existing rating|

---

## User Roles & Features

### System Administrator
- Dashboard: total users, stores, ratings
- Add users (any role) and stores
- View/filter/sort all users and stores
- View individual user details (including store owner's rating)

### Normal User
- Register & login
- Browse all stores (with search by name/address)
- Submit rating (1–5 stars) per store
- Modify previously submitted rating
- Update password

### Store Owner
- Login
- Dashboard: average rating + list of users who rated their store
- Update password

---

## Form Validation Rules

| Field    | Rules                                              |
|----------|----------------------------------------------------|
| Name     | Min 20 characters, Max 60 characters               |
| Email    | Standard email format                              |
| Address  | Max 400 characters                                 |
| Password | 8–16 characters, ≥1 uppercase letter, ≥1 special character |
| Rating   | Integer 1–5                                        |

---

## Project Structure

```
store-rating-backend/
├── src/
│   ├── auth/           # JWT auth, login, register, password update
│   ├── users/          # User CRUD, dashboard stats
│   ├── stores/         # Store CRUD, owner dashboard
│   ├── ratings/        # Submit/update ratings
│   └── common/         # Guards, decorators, enums
└── .env.example

store-rating-frontend/
├── src/
│   ├── api/            # Axios instance
│   ├── components/     # Navbar, StarRating, ProtectedRoute
│   ├── context/        # AuthContext
│   ├── pages/
│   │   ├── auth/       # Login, Register, UpdatePassword
│   │   ├── admin/      # Dashboard, Users, Stores
│   │   ├── user/       # Store listing + rating
│   │   └── owner/      # Owner dashboard
│   └── types/          # TypeScript interfaces
```
