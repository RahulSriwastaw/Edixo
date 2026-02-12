'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Loader2, Shield, Building2, Mail, Calendar, Eye, Ban, LogOut } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserModal from '../../components/users/UserModal';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  auth_user_id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  last_login_at: string;
  created_at: string;
  organizations?: {
    name: string;
    slug: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*, organizations(name, slug)')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'All Roles') {
        query = query.eq('role', roleFilter.toLowerCase().replace(' ', '_'));
      }

      if (statusFilter !== 'All Status') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, search]);

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
      alert(`User ${action}ed successfully.`);
    } catch (error: any) {
      alert('Error updating user: ' + error.message);
    }
  };

  const handleForceLogout = async (authUserId: string, userId: string) => {
    if (!confirm('Force logout this user? They will need to re-authenticate on their next request.')) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          last_login_at: null, // Resetting this can be a signal
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
      
      alert('Force logout signal sent. The user will be required to re-login if the application checks for session validity.');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-700',
      org_admin: 'bg-blue-100 text-blue-700',
      teacher: 'bg-green-100 text-green-700',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      suspended: 'bg-red-100 text-red-700',
      inactive: 'bg-amber-100 text-amber-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage user accounts and permissions</p>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">Total: <span className="text-lg font-bold text-orange-900">{users.length}</span></p>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-orange-100 transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none text-slate-600 font-medium text-sm"
              >
                <option>All Roles</option>
                <option>Super Admin</option>
                <option>Org Admin</option>
                <option>Teacher</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none text-slate-600 font-medium text-sm"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-300 mb-3" size={40} />
                <h3 className="text-base font-bold text-slate-900">No users found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Organization</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Last Login</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <div>
                            <p className="font-bold text-slate-900">{user.full_name || 'No Name'}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                              <Mail size={14} /> {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {user.organizations ? (
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">{user.organizations.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRoleBadge(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleBlockUser(user.id, user.status)}
                              className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                                }`}
                              title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                            >
                              <Ban size={18} />
                            </button>
                            <button
                              onClick={() => handleForceLogout(user.auth_user_id, user.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Force Logout"
                            >
                              <LogOut size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <UserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onRefresh={fetchUsers}
        />
      </div>
    </DashboardLayout>
  );
}
