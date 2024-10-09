const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Controllers
const authController = require("./auth/auth.controller");
const productController = require("./product/product.controller");
const UserController = require("./user/user.controller");

// Routes
app.use("/api/auth", authController);
app.use("/api/products", productController);

// New User routes
const userController = new UserController();
app.post("/api/users", userController.createUser.bind(userController));
app.get("/api/users", userController.getUsers.bind(userController));
app.get("/api/users/:id", userController.getUserById.bind(userController));
app.put("/api/users/:id", userController.updateUser.bind(userController));
app.delete("/api/users/:id", userController.deleteUser.bind(userController));

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});