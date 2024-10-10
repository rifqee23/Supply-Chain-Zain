const express = require("express");
const UserService = require('./user.service');

const router = express.Router();
const userService = new UserService();

// Create User
router.post("/", async (req, res) => {
    try {
        const newUserData = req.body;
        const newUser = await userService.createUser(newUserData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all Users
router.get("/", async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User by ID
router.put("/:id", async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete User by ID
router.delete("/:id", async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;