import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current && expenses.length > 0) {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [expenses]);

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
      <ul ref={listRef} className="divide-y divide-gray-100">
        {expenses.map((expense) => (
          <li key={expense._id} className="hover:bg-gray-50 transition-colors duration-150">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${expense.category === 'Food' ? 'bg-orange-100 text-orange-600' :
                  expense.category === 'Travel' ? 'bg-blue-100 text-blue-600' :
                    expense.category === 'Utilities' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {/* Simple icon mapping based on first letter */}
                  <span className="font-bold">{expense.category.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description || expense.category}</p>
                  <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-gray-900">
                  ₹{expense.amount.toFixed(2)}
                </span>
                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
        {expenses.length === 0 && (
          <li className="px-6 py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No expenses found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first expense to get started!</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ExpenseList;
