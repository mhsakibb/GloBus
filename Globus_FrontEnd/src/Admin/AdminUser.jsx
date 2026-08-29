import React, { useEffect, useState } from "react";
import { FaTrash, FaBan, FaCheckCircle, FaUserShield, FaSearch, FaEllipsisV } from "react-icons/fa";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users?t=${Date.now()}`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  // Delete user with confirmation
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/admin/user/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== id));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  // Toggle user status
  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/user/${id}/status`, {
        method: "PATCH",
      });
      const data = await response.json();
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, status: data.status } : user,
        ),
      );
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaUserShield className="text-indigo-500" />
            Customer Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your platform's users, their roles, and access statuses.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading users data...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user._id.substring(0,8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{user.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{user.phone || 'No phone provided'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleStatus(user._id)}
                          title={user.status === "active" ? "Suspend User" : "Activate User"}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === "active" 
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-500 dark:bg-amber-500/10 dark:hover:bg-amber-500/20" 
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                          }`}
                        >
                          {user.status === "active" ? <FaBan /> : <FaCheckCircle />}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          title="Delete User"
                          className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-500 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                        >
                          <FaTrash />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hidden sm:block">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Pagination Placeholder */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-800 dark:text-slate-200">{users.length}</span> total users
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUser;
