const prisma = require("../../index.ts");

async function createUser(userData) {
    try {
        return await prisma.users.create({data: userData});
    } catch (error) {
        throw new Error("Failed to create a user");
    }
}

module.exports = {
    createUser,
}

