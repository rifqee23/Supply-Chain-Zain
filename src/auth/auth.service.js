const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepository = require("./auth.repository");

function generateToken(user) {
  return jwt.sign(
    {
      userID: user.userID,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
}

async function register(username, email, password, role) {
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = {
      username,
      email,
      password: hash,
      role,
    };
    return await userRepository.createUser(user);
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
}

async function login(username, password) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }

  const token = generateToken(user);

  return {
    user: {
      username: user.username,
      role: user.role,
      userID: user.userID, // pastikan `userID` dikembalikan
    },
    token,
  };
}

module.exports = {
  register,
  login,
};
