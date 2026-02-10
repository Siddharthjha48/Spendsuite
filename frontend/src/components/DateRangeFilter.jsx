import React from 'react';

const DateRangeFilter = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-primary-300 transition-colors">
      <div className="flex items-center gap-2 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium hidden sm:block">Period:</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 p-0 hover:text-primary-600 cursor-pointer"
        />
        <span className="text-gray-400">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange('endDate', e.target.value)}
          className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 p-0 hover:text-primary-600 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
