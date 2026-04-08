import React from 'react';

const KPICard = ({ title, value, icon, trend, trendValue, subtext, color = 'primary', progress }) => {

  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400',
    purple: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      {(trend || subtext) && (
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <span className={`font-medium flex items-center ${trend === 'up' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {trend === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {trendValue}
            </span>
          )}

          {subtext && <span className="text-gray-400">{subtext}</span>}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${progress < 70 ? 'bg-green-500' : progress <= 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
