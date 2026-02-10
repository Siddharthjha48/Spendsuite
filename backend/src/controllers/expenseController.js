const Expense = require('../models/Expense');

// @desc    Get all expenses for the company
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { status, startDate, endDate, sort, page = 1, limit = 10 } = req.query;
    console.log('getExpenses query params:', { status, startDate, endDate, sort, page, limit });

    const query = { companyId: req.companyId };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log('getExpenses MongoDB query:', JSON.stringify(query));

    const sortOption = {};
    if (sort) {
      const parts = sort.split(':');
      sortOption[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortOption.date = -1; // Default sort by date desc
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name email')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Expense.countDocuments(query);
    console.log(`Found ${expenses.length} expenses. Total count: ${count}`);

    res.json({
      expenses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalExpenses: count,
    });
  } catch (error) {
    console.error('getExpenses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  const { amount, category, date, description } = req.body;
  console.log('createExpense body:', req.body);

  try {
    const expense = await Expense.create({
      amount,
      category,
      date,
      description,
      companyId: req.companyId,
      userId: req.user._id,
      status: ['admin', 'super_admin', 'company_admin'].includes(req.user.role) ? 'approved' : 'pending', // Auto-approve for admins
    });

    console.log('Expense created:', expense);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, companyId: req.companyId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only admin can update status directly, or update approved expenses
    // Employees can update their own pending expenses
    if (!['admin', 'super_admin', 'company_admin'].includes(req.user.role) && expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, companyId: req.companyId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (!['admin', 'super_admin', 'company_admin'].includes(req.user.role) && expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense status (Approve/Reject)
// @route   PATCH /api/expenses/:id/status
// @access  Private (Admin only)
const updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const expense = await Expense.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = status;
    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  updateExpenseStatus
};
