import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaChartLine, FaUsers, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0
  });

  const [loading, setLoading] = useState(true);

  // Mock fetching data for dashboard (Ideally, these would be real API calls)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Here we simulate API calls to get real dashboard data. 
        // For now, we mock some impressive numbers.
        setTimeout(() => {
          setStats({
            revenue: 124500,
            orders: 342,
            products: 89,
            customers: 1250
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, trend, isPositive, colorClass, gradientClass }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradientClass} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
            {loading ? <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div> : value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10 mt-2">
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
          {isPositive ? <FaArrowUp className="mr-1 text-[10px]" /> : <FaArrowDown className="mr-1 text-[10px]" />}
          {trend}
        </span>
        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg">
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`}
          icon={<FaDollarSign className="text-emerald-500 text-xl" />}
          trend="12.5%"
          isPositive={true}
          colorClass="bg-emerald-500 text-emerald-500"
          gradientClass="bg-emerald-400"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders.toLocaleString()}
          icon={<FaShoppingBag className="text-indigo-500 text-xl" />}
          trend="8.2%"
          isPositive={true}
          colorClass="bg-indigo-500 text-indigo-500"
          gradientClass="bg-indigo-400"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.customers.toLocaleString()}
          icon={<FaUsers className="text-blue-500 text-xl" />}
          trend="2.4%"
          isPositive={true}
          colorClass="bg-blue-500 text-blue-500"
          gradientClass="bg-blue-400"
        />
        <StatCard 
          title="Total Products" 
          value={stats.products.toLocaleString()}
          icon={<FaChartLine className="text-purple-500 text-xl" />}
          trend="1.1%"
          isPositive={false}
          colorClass="bg-purple-500 text-purple-500"
          gradientClass="bg-purple-400"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Analytics</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
             <p className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                <FaChartLine className="text-3xl opacity-50" />
                <span>Chart visualization will appear here</span>
             </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    #{1000 + i}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Order from John</p>
                    <p className="text-xs text-slate-500">2 mins ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">$124.00</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium">Paid</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;