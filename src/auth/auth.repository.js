const prisma = require('../../index.ts');

async function createUser(userData) {
    try {
        return await prisma.users.create({data: userData});
    } catch (error) {
        throw new Error('Failed to create a user');
    }
}

async function findUserByUsername(username) {
    return prisma.users.findUnique({where: {username}});
}

module.exports = {
    createUser,
    findUserByUsername
}

