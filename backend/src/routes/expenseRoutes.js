const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  updateExpenseStatus,
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middlewares/auth');

const validate = require('../middlewares/validate');
const expenseValidation = require('../validations/expense.validation');

router.use(protect); // All routes are protected

router.route('/')
  .get(getExpenses)
  .post(validate(expenseValidation.createExpense), createExpense);

router.route('/:id')
  .put(validate(expenseValidation.updateExpense), updateExpense)
  .delete(validate(expenseValidation.deleteExpense), deleteExpense);

router.route('/:id/status').patch(protect, authorize('admin', 'super_admin', 'company_admin'), updateExpenseStatus);

module.exports = router;
