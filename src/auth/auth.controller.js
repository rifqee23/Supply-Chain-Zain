const express = require('express');
const authService = require('./auth.service');
const router = express.Router();

router.post("/register", async (req, res, next) => {
    const {username, email, password} = req.body;

    try {
        const newUser = await authService.register(username, email, password);
        res.status(201).json({
            data: {
                username: newUser.username,
                email: newUser.email,
            },
            message: "Register successfully",
        })
    } catch (e) {
        res.status(400).json({
            error: e.message,
        })
    }
});

module.exports = router;