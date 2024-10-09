const UserService = require('./user.service');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }
      const user = await this.userService.createUser({ username, email, password, role });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await this.userService.deleteUser(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;