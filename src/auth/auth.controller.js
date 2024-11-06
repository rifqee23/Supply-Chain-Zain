const express = require('express');
const authService = require('./auth.service');
const router = express.Router();

router.post('/register', async (req, res, next) => {
    const {username, email, password, role} = req.body;

    try {
        const newUser = await authService.register(username, email, password, role);
        res.status(201).json({
            data: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            message: 'Register successfully',
        })
    } catch (e) {
        res.status(400).json({
            error: e.message,
        })
    }
});

router.post("/login", async (req, res, next) => {
    const {username, password} = req.body;
    try {
        const {user, token} = await authService.login(username, password);
        res.status(200).json({
            data: {
                username: user.username,
                role: user.role,
                token
            },
            message: 'Login successfully',
        })
    } catch (err) {
        res.status(400).json({error: err.message})
    }
});

module.exports = router;