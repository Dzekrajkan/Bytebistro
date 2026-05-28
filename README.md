# ByteBistro - Restaurant Management System

> A full-stack restaurant management application with order management, menu handling, table reservations, and payment processing.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?style=flat&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/DRF-3.17-A30000?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Available Accounts](#available-accounts)

---

## Overview

ByteBistro is a pet project - a restaurant management system designed for staff to manage orders, reservations, payments, and menu items efficiently. The backend is built with Python 3.11 and Django REST Framework, while the frontend is developed in React + TypeScript with modern UI components.

---

## Features

- **Order Management** - create, track, and manage orders with status transitions (Created → Sent to Kitchen → Ready → Completed/Cancelled)
- **Order Types** - support for both dine-in and takeaway orders
- **Payment Processing** - handle cash and card payments for orders
- **Menu Management** - manage menu items organized by categories with pricing and availability
- **Table Management** - track table status (Free, Occupied, Reserved), reserve tables, and manage seat count
- **Role-Based Access Control** - different permissions for Cashier, Waiter, Chef, and Administrator roles
- **JWT Authentication** - secure cookie-based JWT tokens for authentication
- **Daily Sales Reports** - view daily sales analytics
- **API Documentation** - interactive Swagger UI at `/api/docs/`
- **Rate Limiting** - login endpoint protected with rate limiting (5 requests per minute per IP)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Django 5.2, Django REST Framework |
| Frontend | React, TypeScript, Redux Toolkit, Vite |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Infrastructure | Docker, Docker Compose |
| API Docs | drf-spectacular (Swagger) |

---

## Installation and Setup

The entire project runs in Docker - no manual dependency installation needed.

**1.Clone the repository and copy environment files**

**Linux/Mac:**
```bash
cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env
```

**Windows (PowerShell):**
```powershell
cp backend/.env.example backend/.env; cp frontend/.env.example frontend/.env
```

**2.Start the containers**

```bash
docker-compose up --build
```

Or, if you're using a newer version of Docker Compose:

```bash
docker compose up --build
```

Wait about 5 minutes for everything to build and start. The site will be ready at `http://localhost:5173` (frontend) and API at `http://localhost:8000/api/`.

---



---

**3. Access the application**

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/`
- **API Documentation (Swagger)**: `http://localhost:8000/api/docs/`

---

## Available Accounts

The database is pre-populated with test data including a superuser account:

### Admin Account

| Email | Password |
|---|---|
| `admin@bytebistro.com` | `admin1234` |

**Note:** Additional staff accounts (Cashier, Waiter, Chef) can be created via the `/api/users/` endpoint (admin only) or through Django admin panel.

---

## Project Structure

```
ByteBistro/
├── backend/
│   ├── apps/
│   │   ├── users/          # User authentication and role management
│   │   ├── orders/         # Order, OrderItem, and Payment models
│   │   ├── menu/           # Menu items and categories
│   │   └── tables/         # Table management and reservations
│   ├── bytebistro/         # Django project settings
│   ├── core/               # Common utilities and configurations
│   ├── requirements.txt    # Python dependencies
│   ├── manage.py           # Django CLI
│   └── Dockerfile          # Backend container configuration
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client and request handlers
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── Dockerfile          # Frontend container configuration
│
├── docker-compose.yml      # Multi-container orchestration
└── README.md               # This file
```

---

## Key API Endpoints

### Authentication
- `POST /api/login/` - User login (returns JWT tokens as httponly cookies)
- `POST /api/logout/` - User logout (clears cookies)
- `GET /api/me/` - Get current user information
- `POST /api/refresh/` - Refresh access token using refresh cookie

### Users (Admin only)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user information
- `DELETE /api/users/{id}/` - Delete user

### Orders
- `GET /api/orders/` - List all orders (with status filtering via query params: ?status=CR&status=R)
- `POST /api/orders/` - Create new order
- `GET /api/orders/{id}/` - Get order details
- `DELETE /api/orders/{id}/` - Delete order
- `POST /api/orders/{id}/pay/` - Process payment for order
- `POST /api/orders/{id}/ready/` - Mark order as ready
- `POST /api/orders/{id}/completed/` - Mark order as completed
- `POST /api/orders/{id}/cancel/` - Cancel order

### Menu
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `DELETE /api/categories/{id}/` - Delete category
- `GET /api/menu-items/` - List all menu items
- `POST /api/menu-items/` - Create menu item
- `GET /api/menu-items/{id}/` - Get menu item details
- `DELETE /api/menu-items/{id}/` - Delete menu item

### Tables
- `GET /api/tables/` - List all tables
- `POST /api/tables/` - Create new table
- `GET /api/tables/{id}/` - Get table details
- `DELETE /api/tables/{id}/` - Delete table
- `POST /api/tables/reserve/` - Reserve an available table
- `POST /api/tables/{id}/free/` - Mark table as free

### Reports
- `GET /api/reports/daily/` - Get daily sales report

---

## Database Models

### User
- Roles: Cashier, Waiter, Chef, Administrator
- Email-based authentication with JWT tokens

### Order
- Status tracking: Created → Sent to Kitchen → Ready → Completed/Cancelled
- Supports Dine-In and Takeaway order types
- Links to Table (for dine-in) and multiple OrderItems

### OrderItem
- Stores individual items in an order
- Tracks quantity and price at the moment of ordering

### Payment
- Handles Cash and Card payments
- Linked to Order for payment reconciliation

### MenuItem
- Belongs to a Category
- Tracks availability and pricing

### Table
- Manages table status and seat count
- Statuses: Free, Occupied, Reserved

### Category
- Groups menu items by category
- Supports active/inactive states

---

## Technologies & Libraries

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework 3.17** - REST API building
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching layer
- **drf-spectacular 0.29** - API documentation with Swagger/OpenAPI
- **PyJWT 2.12** - JWT token handling
- **django-ratelimit 4.1** - Rate limiting for API endpoints

### Frontend
- **React 19** - UI library
- **TypeScript ~6.0** - Type safety
- **Vite 8** - Build tool and dev server
- **Redux Toolkit 2.11** - State management
- **React Router 7.14** - Navigation
- **Tailwind CSS 3.4** - Styling
- **Axios 1.15** - HTTP client
- **React Hook Form 7.73** - Form handling
- **Zod 4.3** - Schema validation
- **Recharts 3.8** - Data visualization for charts

---

## License

This project is a pet project and is open for learning purposes.
