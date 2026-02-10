import React, { useState } from 'react';

const SmartExpenseTable = ({ expenses, onEdit, onDelete, onApprove, onReject, isAdmin, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [deleteId, setDeleteId] = useState(null); // For delete confirmation modal

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      // Filter by Search Term
      const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by Selected Category from Donut Chart
      const matchesCategory = selectedCategory ? expense.category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Recent Expenses</h3>
          {selectedCategory && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
              Filtered by: {selectedCategory}
            </span>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left relative border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr className="text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-gray-700 bg-gray-50" onClick={() => handleSort('description')}>Description</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-gray-700 bg-gray-50" onClick={() => handleSort('category')}>Category</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-gray-700 bg-gray-50" onClick={() => handleSort('date')}>Date</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-gray-700 bg-gray-50" onClick={() => handleSort('amount')}>Amount</th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-gray-700 bg-gray-50" onClick={() => handleSort('status')}>Status</th>
              <th className="px-6 py-4 font-semibold text-right bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredExpenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-primary-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{expense.description || 'No description'}</div>
                  <div className="text-xs text-gray-500">{expense.userId?.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ₹{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                      expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {isAdmin && expense.status === 'pending' && (
                    <>
                      <button onClick={() => onApprove(expense._id)} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase tracking-wide">Approve</button>
                      <button onClick={() => onReject(expense._id)} className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-wide">Reject</button>
                    </>
                  )}
                  <button onClick={() => onEdit(expense)} className="text-primary-600 hover:text-primary-800">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteId(expense._id)} className="text-gray-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredExpenses.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No expenses found {selectedCategory ? `for category "${selectedCategory}"` : 'matching your criteria'}.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Expense?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartExpenseTable;
