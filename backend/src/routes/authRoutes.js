const express = require('express');
const router = express.Router();
const { registerCompany, loginUser } = require('../controllers/authController');

const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

router.post('/register-company', validate(authValidation.registerCompany), registerCompany);
router.post('/login', validate(authValidation.login), loginUser);

module.exports = router;
