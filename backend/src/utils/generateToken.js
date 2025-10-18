const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'docmedaa_secret_dummy';//NEEDS TO UPDATE
const JWT_EXPIRES = '7d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

module.exports = generateToken;
