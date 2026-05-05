import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Fixes 'Cannot find name useAuth'
import { Search, Users, Shield, Activity, UserCheck, UserX } from 'lucide-react';
import { fetchUsers, updateUserRole, fetchAuditLogs } from '../../services/adminService';
import type { AppUser, UserRole } from '../../types/user';
import type { AuditLog } from '../../types/audit';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, auditData] = await Promise.all([
          fetchUsers(),
          fetchAuditLogs()
        ]);
        setUsers(usersData);
        setAuditLogs(auditData);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      const updatedUser = await updateUserRole(userId, newRole);
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterToolbar = (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={16} className="text-[#C5A059]" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="bg-transparent flex-1 outline-none text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'users'
              ? 'bg-[#C5A059] text-black'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Users size={16} />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'audit'
              ? 'bg-[#C5A059] text-black'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Activity size={16} />
          Audit Logs
        </button>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    if (activeTab === 'users') {
      return (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C5A059] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-lg">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{user.displayName}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'faculty' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{log.action}</p>
                  <p className="text-gray-400 text-sm">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{log.actor}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-10">
      <div className="sticky top-0 z-40 bg-[#020d1d]/80 backdrop-blur-md pb-6 mb-8 pt-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-6">
          System <span className="text-[#C5A059] italic">Governance.</span>
        </h1>
        {filterToolbar}
      </div>

      <div className="pb-20">
        {loading ? (
          <div className="text-center py-20 text-[#C5A059] animate-pulse font-bold uppercase tracking-widest">
            Syncing Institutional Archive...
          </div>
        ) : (
          renderActiveSection()
        )}
      </div>
    </div>
  );
};