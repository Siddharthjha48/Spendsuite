const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get company analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.companyId);
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Default to current month
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        date: {
          $gte: start,
          $lte: end,
        },
      };
    }

    const matchStage = {
      companyId: companyId,
      ...dateFilter,
    };

    // 1. Total Expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const expenseCount = totalExpensesResult[0]?.count || 0;

    // 2. Average Daily Expense
    // Calculate number of days in range
    const start = dateFilter.date.$gte;
    const end = dateFilter.date.$lte;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const avgDailyExpense = totalExpenses / diffDays;

    // 3. Highest Single Expense
    const highestExpenseResult = await Expense.find(matchStage)
      .sort({ amount: -1 })
      .limit(1);
    const highestExpense = highestExpenseResult[0] || { amount: 0, description: 'N/A' };

    // 4. Budget Tracking
    const user = await User.findById(req.user._id);
    const monthlyBudget = user.monthlyBudget || 10000; // Default if not set
    const budgetRemaining = monthlyBudget - totalExpenses;
    const budgetUsage = (totalExpenses / monthlyBudget) * 100;

    // 5. Daily Trend
    const dailyTrend = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 6. Category Breakdown
    const categorySummary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 7. Month-over-Month Comparison (Simplified)
    // Calculate previous month range
    const prevStart = new Date(start);
    prevStart.setMonth(prevStart.getMonth() - 1);
    const prevEnd = new Date(end);
    prevEnd.setMonth(prevEnd.getMonth() - 1);

    const prevMonthResult = await Expense.aggregate([
      {
        $match: {
          companyId: companyId,
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const prevTotal = prevMonthResult[0]?.total || 0;
    const percentageChange = prevTotal === 0 ? 100 : ((totalExpenses - prevTotal) / prevTotal) * 100;

    res.json({
      kpi: {
        totalExpenses,
        avgDailyExpense,
        highestExpense,
        budget: {
          limit: monthlyBudget,
          remaining: budgetRemaining,
          usage: budgetUsage,
        },
        comparison: {
          prevTotal,
          percentageChange,
        },
      },
      charts: {
        dailyTrend,
        categorySummary,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
