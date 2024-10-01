const bcrypt = require('bcrypt');
const userRepository = require('./auth.repository');

async function register(username, email, password) {
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = {
            username,
            email,
            password: hash,
            role: "SUPPLYER",
        }
        return await userRepository.createUser(user);
    } catch (e) {
        console.log(e)
        throw new Error('Failed to register user !!');
    }
}

module.exports = {register}