import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExpenseTrendChart = ({ data }) => {
  const [granularity, setGranularity] = useState('Daily');

  // Helper to process data based on granularity
  const processData = (data, gran) => {
    if (!data || data.length === 0) return [];

    if (gran === 'Daily') return data;

    // Simple aggregation logic
    const aggregated = {};

    data.forEach(item => {
      const date = new Date(item._id);
      let key;
      const amount = Number(item.amount) || 0;

      if (gran === 'Weekly') {
        // Get week number (simple approximation or use ISO week)
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDays = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
        key = `Week ${weekNum}`;
      } else { // Monthly
        key = date.toLocaleString('default', { month: 'short' });
      }

      if (!aggregated[key]) {
        aggregated[key] = { _id: key, amount: 0 };
      }
      aggregated[key].amount += amount;
    });

    return Object.values(aggregated);
  };

  const chartData = useMemo(() => processData(data, granularity), [data, granularity]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Expense Trend</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['Daily', 'Weekly', 'Monthly'].map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${granularity === g
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="_id"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#1f2937', fontWeight: 600 }}
            formatter={(value) => [`₹${value}`, 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseTrendChart;
