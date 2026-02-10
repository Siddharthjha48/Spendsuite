import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

const CategoryDonutChart = ({ data, onCategoryClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Expense by Category</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={5}
            dataKey="total"
            nameKey="_id"
            onClick={(data) => onCategoryClick && onCategoryClick(data._id)}
            onMouseEnter={onPieEnter}
            onMouseLeave={() => setActiveIndex(null)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                strokeWidth={index === activeIndex ? 2 : 0}
                stroke="#fff"
                className="transition-all duration-300"
                style={{
                  filter: index === activeIndex ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                  transform: index === activeIndex ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value) => [`₹${value.toFixed(2)}`, 'Total']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry) => <span className="text-gray-600 font-medium ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDonutChart;
