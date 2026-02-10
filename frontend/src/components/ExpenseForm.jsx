import { useState, useEffect } from 'react';

const ExpenseForm = ({ onSuccess, initialData, token }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      setCategory(initialData.category);
      setDate(initialData.date.split('T')[0]);
      setDescription(initialData.description);
    } else {
      // Reset form when not editing
      setAmount('');
      setCategory('');
      setDate('');
      setDescription('');
    }
  }, [initialData]);

  console.log('ExpenseForm rendered');

  const handleSubmit = async (e) => {
    console.log('handleSubmit called', e);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!amount || !category || !date) {
      alert('Please fill in all required fields');
      return;
    }

    const expenseData = { amount, category, date, description };
    const url = initialData
      ? `http://localhost:5001/api/expenses/${initialData._id}`
      : 'http://localhost:5001/api/expenses';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        onSuccess(date);
        // Clear form
        setAmount('');
        setCategory('');
        setDate('');
        setDescription('');
      } else {
        const errorData = await res.json();
        console.error('Failed to save expense:', errorData);
        alert(`Failed to save expense: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving the expense.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="number"
              required
              className="input-field"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            required
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Utilities">Utilities</option>
            <option value="Office">Office</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            className="input-field"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary w-auto"
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </div>
  );
};

export default ExpenseForm;
