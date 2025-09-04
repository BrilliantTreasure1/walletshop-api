# 🛒 Online Store API

This is a RESTful API for an online store, built with **Node.js**, **Express**, and **PostgreSQL**, featuring:
- User creation and wallet management via gRPC
- Product management (CRUD)
- Order system with wallet-based payment
- Dockerized PostgreSQL integration

---

## 🚀 Features

- Create and manage users with internal wallet system via gRPC
- Full CRUD operations for products
- Place, update, view and delete orders
- Pay for orders using internal wallet
- PostgreSQL setup via Docker Compose

---

## 📦 Tech Stack

- Node.js
- Express.js
- PostgreSQL (via Docker)
- pg (Node.js PostgreSQL client)

---

## 📁 Project Structure

📦 online-store-api
├── 📂 routes
│ ├── users.js
│ ├── products.js
│ └── orders.js
├── 📄 db.js
├── 📄 docker-compose.yml
├── 📄 index.js
├── 📄 package.json
└── 📄 README.md


---

## ⚙️ Getting Started

### 1. Clone the project
```bash
git clone https://github.com/YOUR_USERNAME/online-store-api.git
cd online-store-api

2. Start PostgreSQL via Docker

Make sure Docker is installed, then run:

 docker run --name shop-db -e POSTGRES_USER=shop \
 -e POSTGRES_PASSWORD=shop123 -e POSTGRES_DB=shopdb \
 -p 5432:5432 -d postgres:16



It will run a PostgreSQL instance on port 5432 with the following credentials:

    User: shop

    Password: shop123

    Database: shopdb

3. Create Tables

Once PostgreSQL is running, create the tables manually using psql or a tool like TablePlus, or add a schema.sql file and run it.
4. Install dependencies and run the server

npm install
npm start

Server will run on http://localhost:3000
📬 API Endpoints
👤 Users

    POST /users – Create a new user

    GET /users/:id – Get a single user

    PATCH /users/:id/deposit – Deposit into wallet

🛍️ Products

    POST /products – Add new product

    GET /products – List all products

    GET /products/:id – Get a single product

    PATCH /products/:id – Update product

    DELETE /products/:id – Delete product

📦 Orders

    POST /orders – Create a new order

    GET /orders – Get all orders (optional ?user_id=1)

    PATCH /orders/:id – Update an order

    DELETE /orders/:id – Delete an order

    POST /orders/:id/pay – Pay for an order using wallet

🧪 Testing with CURL
Create User

curl -X POST http://localhost:3000/users \
-H "Content-Type: application/json" \
-d '{"name":"ali","balance":1000}'

Deposit to Wallet

curl -X PATCH http://localhost:3000/users/1/deposit \
-H "Content-Type: application/json" \
-d '{"amount":500}'

Create Product

curl -X POST http://localhost:3000/products \
-H "Content-Type: application/json" \
-d '{"name":"Laptop","price":1200}'

Create Order

curl -X POST http://localhost:3000/orders \
-H "Content-Type: application/json" \
-d '{"user_id":1,"product_id":1}'

Pay for Order

curl -X POST http://localhost:3000/orders/1/pay

📌 Contribution Strategy

We encourage developers to contribute to the frontend and help grow this project.
🔧 Issues

Frontend devs can pick from these issues:

Build a product listing UI

Create a user dashboard (wallet, orders)

Implement product purchase flow

    Build order history page

Feel free to open a new issue for bugs or ideas!
🤝 Guidelines

    Fork the repo

    Create a feature branch (feat/your-feature)

    Commit with meaningful messages

    Send a Pull Request

✨ Credits

Built by Abolfazl Ganjtabesh
📄 License

MIT
