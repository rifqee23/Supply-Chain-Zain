const UserRepository = require('./user.repository');
const bcrypt = require('bcrypt');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'STACKHOLDER'
    };

    return this.userRepository.create(newUser);
  }

  async getUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id) {
    return this.userRepository.findById(id);
  }

  async updateUser(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.userRepository.update(id, userData);
  }

  async deleteUser(id) {
    return this.userRepository.delete(id);
  }
}

module.exports = UserService;