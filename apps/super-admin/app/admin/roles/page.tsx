'use client';

import React from 'react';
import { 
  Shield, Check, AlertCircle, Info, 
  Settings, Users, FileText, Layout, 
  Video, Calendar, MessageSquare, BarChart3
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const roles = [
  {
    name: 'Super Admin',
    description: 'Full access to all modules and system settings.',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    permissions: ['All access']
  },
  {
    name: 'Admin',
    description: 'Can manage most modules but has restricted system settings access.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: ['User Management', 'Content Management', 'Analytics', 'Support']
  },
  {
    name: 'Editor',
    description: 'Focuses on content creation and management.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    permissions: ['Content Management', 'Blogs', 'Media Library']
  },
  {
    name: 'Manager',
    description: 'Can manage specific organizational units and users.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    permissions: ['User Management', 'Organization Analytics', 'Reports']
  }
];

const permissionCategories = [
  {
    title: 'System',
    icon: Settings,
    permissions: ['System Settings', 'API Keys', 'Logs', 'Backup']
  },
  {
    title: 'Users',
    icon: Users,
    permissions: ['Manage Users', 'Manage Staff', 'Role Management', 'Assign Courses']
  },
  {
    title: 'Content',
    icon: FileText,
    permissions: ['Manage Courses', 'Manage Lessons', 'Media Library', 'Categories']
  },
  {
    title: 'Interactions',
    icon: MessageSquare,
    permissions: ['Live Chat', 'Comments', 'Reviews', 'Feedback']
  }
];

export default function RolePermissionsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Role & Permissions</h1>
          <p className="text-slate-500">Define and manage access levels for your team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Available Roles
            </h2>
            {roles.map((role) => (
              <div 
                key={role.name}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${role.color}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{role.name}</h3>
                  <div className="p-1 bg-white/50 rounded-lg">
                    <Info size={14} />
                  </div>
                </div>
                <p className="text-sm opacity-90 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-white/40 rounded-full font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
              <Shield size={18} />
              Create New Role
            </button>
          </div>

          {/* Permissions Matrix Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Permission Matrix</h2>
                  <p className="text-sm text-slate-500">Detailed access control for Super Admin</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                  Save Changes
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {permissionCategories.map((category) => (
                  <div key={category.title}>
                    <div className="flex items-center gap-2 mb-4 text-slate-900 font-medium">
                      <category.icon size={18} className="text-slate-400" />
                      {category.title}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.permissions.map((permission) => (
                        <div key={permission} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-sm text-slate-700">{permission}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-amber-50 border-t border-amber-100 flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Changes to permissions will take effect immediately for all users assigned to this role. Users may need to refresh their session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
