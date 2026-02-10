const jwt = require('jsonwebtoken');

const generateToken = (id, companyId, role) => {
  return jwt.sign({ id, companyId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
