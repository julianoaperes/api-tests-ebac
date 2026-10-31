# 📚 API Reading Hub - Library System for QA

**A complete educational API for learning and practicing Quality Assurance (QA)**

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)
![SQLite](https://img.shields.io/badge/SQLite-3+-lightgrey.svg)
![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)
![License](https://img.shields.io/badge/License-Educational-yellow.svg)

## 🎯 Purpose

The **API Reading Hub** is a REST API for library management, developed specifically for **teaching and practicing Quality Assurance**. Each endpoint represents real-world scenarios that QA professionals encounter in their daily work.

### 🎓 For QA Students

- ✅ **Learn by testing** - A real API with complex scenarios
- ✅ **Complete REST API** - All types of endpoints
- ✅ **Different roles** - Regular User vs Administrator
- ✅ **JWT authentication** - A professional login system
- ✅ **Error scenarios** - How APIs fail in practice
- ✅ **Swagger documentation** - A well-documented API

## 🚀 API Features

### 👤 **User Management**

- User registration and login
- JWT authentication with expiration
- Different roles (User/Admin)
- Profile updates

### 📖 **Book Catalog**

- Listings with filters and search
- Full CRUD operations (Admin)
- Inventory management
- Cover image uploads
- Categorization

### 📝 **Reservations**

- Reservations for available books
- Deadline tracking
- Pickup and return management
- Complete history
- Overdue alerts

### 🛠️ **Administration**

- Dashboard with statistics
- Management of all reservations
- User management
- Reports and exports
- System logs

## 🛠️ Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation
- **Swagger** - API documentation

## ⚡ Quick Setup

### Prerequisites

- Node.js 18+ installed
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/EBAC-QE/hub-de-leitura-api.git
cd hub-de-leitura-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

### 4. Access the Documentation

- **API Docs:** http://localhost:3000/api-docs

## 🔑 Test Credentials

### Administrator

- **Email:** admin@biblioteca.com
- **Password:** admin123
- **Permissions:** Full system access

### Regular User

- **Email:** usuario@teste.com
- **Password:** user123
- **Permissions:** Reservations and queries

## 🧪 Testing the API

### With cURL

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.com","password":"admin123"}'

# List books (with token)
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### With Postman/Insomnia

1. Import the Swagger collection: http://localhost:3000/api-docs
2. Set the JWT token in the Authorization header
3. Test all available endpoints

## 🤝 Contributing

### For Instructors

1. Fork the repository
2. Create additional test scenarios
3. Add new endpoints for practice
4. Document intentional bugs for students to find
5. Submit a Pull Request

### For Students

1. Report bugs you find (it is part of learning!)
2. Suggest documentation improvements
3. Share interesting test cases
4. Contribute automation examples

### Reset the Database

```bash
# Stop the server with "CTRL + C" and delete the database file
rm database/biblioteca.db
# Run the command to recreate the database
npm run db
# Restart the server to recreate the tables
npm start
```

## 🐛 Common Issues

### "Port 3000 already in use" Error

```bash
# Run on a different port, for example, port 3001
PORT=3001 npm start
```

### Expired Token

- Log in again to get a new token
- Tokens expire after 1 hour by default

### Corrupted Database

- Delete the `database/biblioteca.db` file
- Run `npm run db` to recreate the database

## 📚 Learning Resources

### Documentation

- [Express.js](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Swagger/OpenAPI](https://swagger.io/docs/)

### Testing Tools

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Jest](https://jestjs.io/) - For automated testing
- [Newman](https://github.com/postmanlabs/newman) - Postman's CLI

### Permitted Use

- ✅ Educational and academic use
- ✅ Modification for teaching purposes
- ✅ Distribution to students
- ✅ Creation of courses based on the project

### Restricted Use

- ❌ Direct commercial use
- ❌ Sale of the code
- ❌ Redistribution without attribution

---

## ⭐ Acknowledgments

Developed with ❤️ for the **Quality Assurance** community.

**Contributors:**

- Fábio Araújo
  - [Repository](https://github.com/fabioaraujoqa)
  - [Linkedin](https://www.linkedin.com/in/fabio10/)

---

### 🚀 **Happy Testing!**

_"Quality is never an accident; it is always the result of intelligent effort."_ - John Ruskin
