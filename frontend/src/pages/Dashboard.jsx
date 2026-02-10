import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import KPICard from '../components/KPICard';
import ExpenseTrendChart from '../components/ExpenseTrendChart';
import CategoryDonutChart from '../components/CategoryDonutChart';
import SmartExpenseTable from '../components/SmartExpenseTable';
import DateRangeFilter from '../components/DateRangeFilter';
import ExpenseForm from '../components/ExpenseForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  console.log('Dashboard rendered');
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Admin Pending Count
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  const handleCategoryClick = (category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const exportToCSV = () => {
    // Filter expenses based on selected category if any
    const dataToExport = selectedCategory
      ? expenses.filter(e => e.category === selectedCategory)
      : expenses;

    if (dataToExport.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ["Description", "Category", "Date", "Amount", "Status", "User"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(e => [
        `"${e.description}"`,
        `"${e.category}"`,
        new Date(e.date).toLocaleDateString(),
        e.amount,
        e.status,
        `"${e.userId?.name || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const headerRef = useRef(null);
  const kpiRef = useRef(null);
  const chartsRef = useRef(null);
  const tableRef = useRef(null);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5001/api/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5001/api/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error(error);
      setExpenses([]);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      console.log('Page is attempting to reload!');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchExpenses();
    }
  }, [user, dateRange]);

  useEffect(() => {
    if (!analytics) return;
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });

    if (kpiRef.current) {
      tl.fromTo(kpiRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, '-=0.3');
    }

    if (chartsRef.current) {
      tl.fromTo(chartsRef.current.children, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2 }, '-=0.2');
    }

    if (tableRef.current) {
      tl.fromTo(tableRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');
    }
  }, [analytics]); // Re-animate on data load

  const handleDateChange = (key, value) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  const handleExpenseAction = async (id, action, status = null) => {
    try {
      let url = `http://localhost:5001/api/expenses/${id}`;
      let method = 'DELETE';
      let body = null;

      if (action === 'status') {
        url += '/status';
        method = 'PATCH';
        body = JSON.stringify({ status });
      }

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body
      });
      fetchAnalytics();
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav ref={headerRef} className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="SpendSuite Logo" className="h-10 w-auto rounded-lg" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">SpendSuite</span>
            </div>
            <div className="flex items-center gap-4">
              <DateRangeFilter startDate={dateRange.startDate} endDate={dateRange.endDate} onChange={handleDateChange} />
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Section */}
        {analytics?.kpi && (
          <div ref={kpiRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Expenses"
              value={`₹${(analytics.kpi.totalExpenses || 0).toLocaleString()}`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              trend={analytics.kpi.comparison?.percentageChange > 0 ? 'up' : 'down'}
              trendValue={`${Math.abs(analytics.kpi.comparison?.percentageChange || 0).toFixed(1)}%`}
              subtext="vs last month"
              color="primary"
            />
            <KPICard
              title="Avg Daily Spend"
              value={`₹${(analytics.kpi.avgDailyExpense || 0).toFixed(0)}`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              subtext="per day"
              color="secondary"
            />
            <KPICard
              title="Highest Expense"
              value={`₹${(analytics.kpi.highestExpense?.amount || 0).toLocaleString()}`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              subtext={analytics.kpi.highestExpense?.category || 'N/A'}
              color="orange"
            />
            <KPICard
              title="Budget Remaining"
              value={`₹${(analytics.kpi.budget?.remaining || 0).toLocaleString()}`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
              subtext={`${(analytics.kpi.budget?.usage || 0).toFixed(1)}% used`}
              color={(analytics.kpi.budget?.usage || 0) > 80 ? 'orange' : 'purple'}
              progress={analytics.kpi.budget?.usage || 0}
            />
          </div>
        )}

        {/* Charts Section */}
        {analytics?.charts && (
          <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ExpenseTrendChart data={analytics.charts.dailyTrend || []} />
            </div>
            <div>
              <CategoryDonutChart
                data={analytics.charts.categorySummary || []}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          </div>
        )}

        {/* Actions & Table */}
        <div ref={tableRef} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Management</h2>
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition-all font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancel' : 'Add Expense'}
            </button>
            <button
              onClick={exportToCSV}
              className="ml-3 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Admin Pending Indicator */}
          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'company_admin') && pendingCount > 0 && (
            <div className={`mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex items-center justify-between shadow-sm animate-pulse`}>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-yellow-700 font-medium">
                  {pendingCount} Pending Expense{pendingCount !== 1 ? 's' : ''} Require Approval
                </span>
              </div>
              <button
                onClick={() => {
                  // Scroll to table or just focus
                  tableRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-bold text-yellow-800 hover:underline"
              >
                Review Now
              </button>
            </div>
          )}

          <SmartExpenseTable
            expenses={expenses}
            selectedCategory={selectedCategory}
            onEdit={(expense) => {
              setEditingExpense(expense);
              setShowForm(true);
            }}
            onDelete={(id) => handleExpenseAction(id, 'delete')}
            onApprove={(id) => handleExpenseAction(id, 'status', 'approved')}
            onReject={(id) => handleExpenseAction(id, 'status', 'rejected')}
            isAdmin={user.role === 'admin' || user.role === 'super_admin' || user.role === 'company_admin'}
          />
        </div>
      </main>

      {/* Expense Form Modal - Moved outside main to avoid transform stacking context issues */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white transition-opacity">
          <div className="w-full h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto min-h-screen bg-white shadow-none">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-bold text-gray-900">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                <button onClick={() => { setShowForm(false); setEditingExpense(null); }} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ExpenseForm
                  onSuccess={(newExpenseDate) => {
                    if (newExpenseDate) {
                      const expenseDate = new Date(newExpenseDate);
                      const currentStart = new Date(dateRange.startDate);
                      const currentEnd = new Date(dateRange.endDate);

                      if (expenseDate < currentStart || expenseDate > currentEnd) {
                        const newStart = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1).toISOString().split('T')[0];
                        const newEnd = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0).toISOString().split('T')[0];
                        setDateRange({ startDate: newStart, endDate: newEnd });
                      } else {
                        fetchExpenses();
                        fetchAnalytics();
                      }
                    } else {
                      fetchExpenses();
                      fetchAnalytics();
                    }
                    setShowForm(false);
                    setEditingExpense(null);
                  }}
                  initialData={editingExpense}
                  token={user.token}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
