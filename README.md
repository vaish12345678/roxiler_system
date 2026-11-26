# Roxiler Store Rating System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

A full-stack web application designed for role-based store management and customer rating tracking. The platform enables administrators to oversee users and stores, normal users to discover and rate stores, and store owners to monitor rating performance and customer feedback.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Database Overview](#database-overview)
- [Project Structure](#project-structure)
- [Application Screenshots](#application-screenshots)
- [Installation and Setup](#installation-and-setup)
- [Demo Login Credentials](#demo-login-credentials)
- [Author](#author)

---

## Project Overview

The **Roxiler Store Rating System** implements a structured, three-tier access control architecture tailored to distinct operational roles:

- **Administrators** maintain platform governance by adding and managing users, creating and managing stores, assigning user roles, and reviewing platform-wide statistics.
- **Normal Users** can register for an account, search and explore registered stores, view aggregated rating scores, and submit or update ratings on a 1-to-5 scale.
- **Store Owners** have access to a dedicated dashboard displaying their store's average rating, total rating count, and individual customer rating details.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Axios, React Router DOM |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | MySQL |
| **Security & Auth** | JSON Web Tokens (JWT via HTTP-only cookies), bcrypt |

---

## Key Features

### Administrator
- View platform statistics from the Admin Dashboard.
- Add, view, and manage user accounts across roles.
- Create, view, and manage registered stores.
- Search, filter, and sort user and store records.
- Assign and manage user roles.

### Normal User
- Register a new user account and log in securely.
- Browse all available stores and view their average ratings.
- Search stores by name and address.
- Submit store ratings on a scale from 1 to 5.
- Update previously submitted ratings.
- Update account password.

### Store Owner
- Access a dedicated Store Owner Dashboard.
- View the overall average rating for their store.
- Track the total number of customer ratings received.
- Inspect detailed customer rating submissions.
- Update account password.

### Authentication and Security
- **Stateless Authentication:** JWT-based authentication stored in secure HTTP-only cookies.
- **Role-Based Access Control (RBAC):** Strict authorization middleware separating Admin, Normal User, and Store Owner endpoints and UI views.
- **Credential Protection:** Password hashing using `bcrypt` prior to database persistence.
- **Route Protection:** Client-side and server-side protected routes with secure logout functionality.

---

## Database Overview

The relational data layer is managed using **MySQL** and **Prisma ORM**, structured around three core entities:

- **Users:** Stores user profile details, hashed passwords, and assigned roles (`Admin`, `Normal User`, `Store Owner`).
- **Stores:** Stores business information (such as store name, email, and address) linked to a designated Store Owner.
- **Ratings:** Records individual user rating scores (1–5) associated with both the submitting user and the target store, enabling real-time average rating calculations.

---

## Project Structure

```text
roxiler_system/
├── backend/          # Express.js REST API, Prisma schema, seed script, controllers, and auth middleware
├── frontend/         # React + Vite client application, Tailwind styles, and role-based views
├── screenshots/      # Application interface previews
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## Application Screenshots

### Admin Views

| Admin Manage Users | Admin Manage Stores |
| :---: | :---: |
| ![Admin Manage Users](screenshots/manage_users.png) | ![Admin Manage Stores](screenshots/Stores.png) |

| Create Store |
| :---: |
| ![Create Store](screenshots/create_store.png) |

---

### Normal User Views

| User Registration | User Explore Stores |
| :---: | :---: |
| ![User Registration](screenshots/regioster.png) | ![User Explore Stores](screenshots/user_explore.png) |

| Change Password |
| :---: |
| ![Change Password](screenshots/change_password.png) |

---

### Store Owner Views

| Store Owner Dashboard |
| :---: |
| ![Store Owner Dashboard](screenshots/Store_Owner_dashboard.png) |

---

## Installation and Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MySQL Server

### 1. Clone the Repository

```bash
git clone [https://github.com/vaish12345678/roxiler_system.git](https://github.com/vaish12345678/roxiler_system.git)
cd roxiler_system
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory using `.env.example` as a reference, and configure the following environment variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=roxiler_store_rating
JWT_SECRET=YOUR_PRIVATE_SECRET
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/roxiler_store_rating"
ADMIN_EMAIL=admin@roxiler.com
ADMIN_PASSWORD=YOUR_ADMIN_DEMO_PASSWORD
```

Create the MySQL database:

```sql
CREATE DATABASE roxiler_store_rating;
```

Generate the Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Create the default Admin account:

```bash
npx prisma db seed
```

> The seed command creates the Admin account with the credentials configured in your backend `.env` file. The password is securely hashed using `bcrypt`.

Start the backend server:

```bash
npm run dev
```

The backend API will run at: `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will run at: `http://localhost:5173`

---

## Demo Login Credentials

### Admin Account

The Admin account is created automatically using the Prisma seed script.

| Field | Value |
| :--- | :--- |
| **Email** | `admin@roxiler.com` |
| **Password** | `YOUR_ADMIN_DEMO_PASSWORD` |
| **Role** | `ADMIN` |

> **Note:** Replace `YOUR_ADMIN_DEMO_PASSWORD` above with the actual password configured in your `.env` before sharing or demonstrating the application.

### Other Test Accounts

- **Normal Users:** Can register directly through the application's registration page.
- **Store Owners:** Can be created by the Admin through the Admin Dashboard.

---

## Author

**Vaishnavi Ambhore**  
GitHub: [@vaish12345678](https://github.com/vaish12345678)
